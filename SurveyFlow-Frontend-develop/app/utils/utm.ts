import { attributionApi } from '@/apis/attribution.api'
import type { RecordAttributionPayload } from '@/types/attribution.type'

const UTM_STORAGE_KEY = 'sf_utm_data'
const UTM_SESSION_KEY = 'sf_utm_session_id'
const UTM_LAST_RECORDED_KEY = 'sf_utm_last_recorded'

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sessionId = localStorage.getItem(UTM_SESSION_KEY)
  if (!sessionId) {
    sessionId = `utm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem(UTM_SESSION_KEY, sessionId)
  }
  return sessionId
}

export function captureAndRecordUtm(): void {
  if (typeof window === 'undefined') return

  try {
    const urlParams = new URLSearchParams(window.location.search)
    const utmSource = urlParams.get('utm_source')

    const sessionId = getOrCreateSessionId()

    if (utmSource && utmSource.trim() !== '') {
      const payload: RecordAttributionPayload = {
        sessionId,
        utmSource: utmSource.trim().toLowerCase(),
        utmMedium: urlParams.get('utm_medium')?.trim().toLowerCase() || undefined,
        utmCampaign: urlParams.get('utm_campaign')?.trim() || undefined,
        utmContent: urlParams.get('utm_content')?.trim() || undefined,
        utmTerm: urlParams.get('utm_term')?.trim() || undefined,
        landingPage: window.location.pathname + window.location.search,
        referrerUrl: document.referrer || undefined
      }

      // Lưu trữ cục bộ
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(payload))

      // Tránh gửi lặp lại liên tục trong cùng 1 phiên với cùng 1 query
      const currentSignature = `${payload.utmSource}_${payload.utmMedium}_${payload.utmCampaign}_${window.location.pathname}`
      const lastSignature = sessionStorage.getItem(UTM_LAST_RECORDED_KEY)

      if (lastSignature !== currentSignature) {
        sessionStorage.setItem(UTM_LAST_RECORDED_KEY, currentSignature)
        attributionApi.recordVisit(payload).catch((err) => {
          console.warn('[UTM Tracker] Could not record visit:', err)
        })
      }
    }
  } catch (error) {
    console.error('[UTM Tracker] Error capturing UTM:', error)
  }
}

export function getStoredUtmData(): RecordAttributionPayload | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored) as RecordAttributionPayload
  } catch {
    return null
  }
}

const UTM_CONVERTED_KEY = 'sf_utm_converted'

export function triggerConversion(): void {
  if (typeof window === 'undefined') return
  const sessionId = localStorage.getItem(UTM_SESSION_KEY)
  const alreadyConverted = localStorage.getItem(UTM_CONVERTED_KEY)

  if (sessionId && alreadyConverted !== sessionId) {
    localStorage.setItem(UTM_CONVERTED_KEY, sessionId)
    attributionApi.markConversion(sessionId).catch((err) => {
      console.warn('[UTM Tracker] Could not mark conversion:', err)
    })
  }
}
