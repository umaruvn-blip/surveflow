import { SURVEY_CODE_QUESTION } from '@/constants/survey'
import type { SurveyWebhookConfiguration } from '@/types/survey-management.type'

export function webhookUrl(baseUrl: string, path: string) {
  return new URL(path, baseUrl).href
}

export function googleFormsScript(
  config: SurveyWebhookConfiguration,
  baseUrl: string,
  formId: string
) {
  return `// Chỉ dán vào Apps Script gắn với Google Form của bạn. Không chia sẻ token.
const CONFIG = ${JSON.stringify(
    {
      backendUrl: new URL(baseUrl).origin,
      surveyId: config.surveyId,
      webhookToken: config.webhookToken,
      formId,
      codeQuestionTitle: SURVEY_CODE_QUESTION
    },
    null,
    2
  )};

function sendWebhook(path, payload) {
  const response = UrlFetchApp.fetch(CONFIG.backendUrl + path, {
    method: 'post', contentType: 'application/json',
    headers: { 'X-Webhook-Token': CONFIG.webhookToken },
    payload: JSON.stringify(payload), muteHttpExceptions: true
  });
  const status = response.getResponseCode();
  if (status < 200 || status >= 300) {
    throw new Error('Webhook lỗi HTTP ' + status);
  }
  console.log('Webhook thành công, HTTP ' + status);
}

function verifyConnection() {
  requireConfiguredForm();
  if (!ScriptApp.getProjectTriggers().some(function(trigger) { return trigger.getHandlerFunction() === 'handleFormSubmit'; })) throw new Error('Chạy setupSurveyFlow trước khi kiểm tra kết nối.');
  sendWebhook('/api/v1/webhooks/google-forms/' + CONFIG.surveyId + '/verify', { formId: CONFIG.formId });
}

function requireConfiguredForm() {
  const form = FormApp.getActiveForm();
  if (!form) throw new Error('Mở Apps Script từ Google Form.');
  const publishedId = form.getPublishedUrl().split('/forms/d/')[1].replace(/^e\\//, '').split('/')[0];
  if (CONFIG.formId !== form.getId() && CONFIG.formId !== publishedId) throw new Error('Script đang gắn với form khác URL khảo sát.');
  return form;
}

function setupSurveyFlow() {
  const form = requireConfiguredForm();
  const questions = form.getItems(FormApp.ItemType.TEXT).filter(function(item) {
    return item.getTitle() === CONFIG.codeQuestionTitle && item.asTextItem().isRequired();
  });
  if (questions.length !== 1) throw new Error('Cần đúng một câu hỏi trả lời ngắn bắt buộc: ' + CONFIG.codeQuestionTitle);
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (['onSurveyFlowSubmit', 'handleFormSubmit', 'retrySurveyFlow'].indexOf(trigger.getHandlerFunction()) >= 0) ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger('handleFormSubmit').forForm(form).onFormSubmit().create();
  ScriptApp.newTrigger('retrySurveyFlow').timeBased().everyMinutes(5).create();
}

function handleFormSubmit(event) {
  const answers = event.response.getItemResponses().filter(function(answer) {
    return answer.getItem().getTitle() === CONFIG.codeQuestionTitle;
  });
  if (answers.length !== 1 || !String(answers[0].getResponse()).trim()) {
    throw new Error('Cần đúng một câu trả lời có mã cho câu hỏi: ' + CONFIG.codeQuestionTitle);
  }
  const payload = {
    formId: CONFIG.formId, responseId: event.response.getId(),
    submittedAt: event.response.getTimestamp().toISOString(),
    completionCode: String(answers[0].getResponse()).trim()
  };
  // Lưu trước khi gửi để callback lỗi có thể thử lại; backend chống trùng responseId.
  const properties = PropertiesService.getScriptProperties();
  const key = 'surveyflow_pending_' + CONFIG.formId + '_' + payload.responseId;
  properties.setProperty(key, JSON.stringify(payload));
  sendWebhook('/api/v1/webhooks/google-forms/' + CONFIG.surveyId, payload);
  properties.deleteProperty(key);
}

function retrySurveyFlow() {
  const properties = PropertiesService.getScriptProperties();
  const queued = properties.getProperties();
  Object.keys(queued).forEach(function(key) {
    if (key.indexOf('surveyflow_pending_' + CONFIG.formId + '_') !== 0) return;
    try {
      sendWebhook('/api/v1/webhooks/google-forms/' + CONFIG.surveyId, JSON.parse(queued[key]));
      properties.deleteProperty(key);
    } catch (error) { console.error('Callback chưa gửi được; kiểm tra kết nối và lần chạy trigger.'); }
  });
}
`
}
