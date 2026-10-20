export interface RecordAttributionPayload {
  sessionId?: string
  utmSource: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  landingPage?: string
  referrerUrl?: string
}

export interface SourceAttribution {
  source: string
  visits: number
  conversions: number
  conversionRate: number
}

export interface CampaignAttribution {
  campaign: string
  visits: number
  conversions: number
  conversionRate: number
}

export interface RecentVisit {
  id: number
  utmSource: string
  utmMedium?: string
  utmCampaign?: string
  landingPage?: string
  converted: boolean
  userId?: number
  createdAt: string
}

export interface AttributionStats {
  totalVisits: number
  totalConversions: number
  overallConversionRate: number
  sourceBreakdown: SourceAttribution[]
  campaignBreakdown: CampaignAttribution[]
  recentVisits: RecentVisit[]
}
