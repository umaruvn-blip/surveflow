import http from '@/libs/http'
import type { ApiResponse } from '@/types/api-response.type'
import type {
  GoogleFormItem,
  GoogleFormsConnectionStatus,
  GoogleFormVerifyResult
} from '@/types/google-forms.type'
import { unwrapApiResponse } from '@/utils/api-response'

export const googleFormsApi = {
  async getAuthUrl(redirectUri: string): Promise<string> {
    const response = await http.get<ApiResponse<string>>(
      `/google-forms/auth-url?redirectUri=${encodeURIComponent(redirectUri)}`
    )
    return unwrapApiResponse(response.data)
  },

  async connect(code: string, redirectUri: string): Promise<GoogleFormsConnectionStatus> {
    const response = await http.post<ApiResponse<GoogleFormsConnectionStatus>>(
      '/google-forms/callback',
      { code, redirectUri }
    )
    return unwrapApiResponse(response.data)
  },

  async getStatus(): Promise<GoogleFormsConnectionStatus> {
    const response = await http.get<ApiResponse<GoogleFormsConnectionStatus>>(
      '/google-forms/status'
    )
    return unwrapApiResponse(response.data)
  },

  async disconnect(): Promise<void> {
    const response = await http.delete<ApiResponse<void>>('/google-forms/disconnect')
    return unwrapApiResponse(response.data)
  },

  async listForms(): Promise<GoogleFormItem[]> {
    const response = await http.get<ApiResponse<GoogleFormItem[]>>('/google-forms/forms')
    return unwrapApiResponse(response.data)
  },

  async getFormDetails(formId: string): Promise<GoogleFormItem> {
    const response = await http.get<ApiResponse<GoogleFormItem>>(
      `/google-forms/details?formId=${encodeURIComponent(formId)}`
    )
    return unwrapApiResponse(response.data)
  },

  async checkCompletionCodeQuestion(formId: string): Promise<boolean> {
    const response = await http.get<ApiResponse<boolean>>(
      `/google-forms/check-completion-question?formId=${encodeURIComponent(formId)}`
    )
    return unwrapApiResponse(response.data)
  },

  async verifyResponse(params: {
    creatorUserId: number
    formId: string
    targetCode?: string
    afterTimestamp?: string
  }): Promise<GoogleFormVerifyResult> {
    const query = new URLSearchParams()
    query.set('creatorUserId', String(params.creatorUserId))
    query.set('formId', params.formId)
    if (params.targetCode) query.set('targetCode', params.targetCode)
    if (params.afterTimestamp) query.set('afterTimestamp', params.afterTimestamp)

    const response = await http.post<ApiResponse<GoogleFormVerifyResult>>(
      `/google-forms/verify?${query.toString()}`
    )
    return unwrapApiResponse(response.data)
  }
}
