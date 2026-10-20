export interface GoogleFormsConnectionStatus {
  connected: boolean
  googleEmail?: string
  googleUserId?: string
  connectedAt?: string
}

export interface GoogleFormItem {
  id: string
  formId?: string
  title: string
  description?: string
  responderUri: string
  editUri?: string
  questionCount?: number
  hasCompletionCodeQuestion?: boolean
}

export interface GoogleFormVerifyResult {
  verified: boolean
  responseId?: string
  submittedAt?: string
  message: string
}
