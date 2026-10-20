import { SURVEY_CODE_QUESTION } from '@/constants/survey'
import { expect, it } from 'vitest'
import { googleFormsScript, webhookUrl } from '@/utils/google-forms-script'
it('resolves backend paths against origin without duplicating API prefix', () => {
  expect(webhookUrl('https://api.example.com/api/v1', '/api/v1/webhooks/google-forms/1')).toBe(
    'https://api.example.com/api/v1/webhooks/google-forms/1'
  )
  const script = googleFormsScript(
    {
      surveyId: 1,
      webhookPath: '/api/v1/webhooks/google-forms/1',
      verificationPath: '/api/v1/webhooks/google-forms/1/verify',
      webhookToken: 'demo-token'
    },
    'https://api.example.com/api/v1',
    'form-id'
  )
  expect(SURVEY_CODE_QUESTION).toBe('Mã xác nhận SurveyFlow')
  expect(script).toContain(JSON.stringify(SURVEY_CODE_QUESTION))
  expect(script).toContain('X-Webhook-Token')
  expect(script).toContain('event.response.getId()')
  expect(script).toContain('retrySurveyFlow')
})

it('generated script sends verify and callback with form identity and queues failed submissions', async () => {
  const { runInNewContext } = await import('node:vm')
  const config = {
    surveyId: 1,
    webhookPath: '/api/v1/webhooks/google-forms/1',
    verificationPath: '/api/v1/webhooks/google-forms/1/verify',
    webhookToken: 'DEMO_ONLY'
  }
  const queued: Record<string, string> = {}
  const requests: Array<{ url: string; body: unknown }> = []
  let status = 200
  const properties = {
    setProperty: (key: string, value: string) => {
      queued[key] = value
    },
    deleteProperty: (key: string) => {
      delete queued[key]
    },
    getProperties: () => ({ ...queued })
  }
  const context = {
    FormApp: {
      getActiveForm: () => ({
        getId: () => 'edit-form-id',
        getPublishedUrl: () => 'https://docs.google.com/forms/d/e/public-form-id/viewform'
      })
    },
    ScriptApp: { getProjectTriggers: () => [{ getHandlerFunction: () => 'handleFormSubmit' }] },
    PropertiesService: { getScriptProperties: () => properties },
    UrlFetchApp: {
      fetch: (url: string, options: { payload: string }) => {
        requests.push({ url, body: JSON.parse(options.payload) })
        return { getResponseCode: () => status }
      }
    },
    console: { error: () => undefined, log: () => undefined }
  }
  const script = googleFormsScript(config, 'https://api.example.com/api/v1', 'public-form-id')
  const api = runInNewContext(
    script + '\n({ verifyConnection, handleFormSubmit, retrySurveyFlow })',
    context
  ) as {
    verifyConnection: () => void
    handleFormSubmit: (event: unknown) => void
    retrySurveyFlow: () => void
  }
  api.verifyConnection()
  expect(requests[0]).toEqual({
    url: 'https://api.example.com/api/v1/webhooks/google-forms/1/verify',
    body: { formId: 'public-form-id' }
  })
  const event = {
    response: {
      getId: () => 'response-1',
      getTimestamp: () => new Date('2026-09-27T00:00:00Z'),
      getItemResponses: () => [
        {
          getItem: () => ({ getTitle: () => SURVEY_CODE_QUESTION }),
          getResponse: () => ' CODE123 '
        }
      ]
    }
  }
  expect(() =>
    api.handleFormSubmit({
      response: { ...event.response, getItemResponses: () => [] }
    })
  ).toThrow('Cần đúng một câu trả lời có mã')
  expect(() =>
    api.handleFormSubmit({
      response: {
        ...event.response,
        getItemResponses: () => [
          {
            getItem: () => ({ getTitle: () => SURVEY_CODE_QUESTION }),
            getResponse: () => '   '
          }
        ]
      }
    })
  ).toThrow('Cần đúng một câu trả lời có mã')
  expect(Object.keys(queued)).toHaveLength(0)
  status = 503
  expect(() => api.handleFormSubmit(event)).toThrow('HTTP 503')
  expect(Object.keys(queued)).toHaveLength(1)
  status = 200
  api.retrySurveyFlow()
  expect(Object.keys(queued)).toHaveLength(0)
  expect(requests.at(-1)?.body).toMatchObject({
    formId: 'public-form-id',
    responseId: 'response-1',
    completionCode: 'CODE123',
    submittedAt: '2026-09-27T00:00:00.000Z'
  })
})
