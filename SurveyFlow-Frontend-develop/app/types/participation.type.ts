export type Participation = {
  publicId: string
  surveyId: number
  userId: number
  status: 'RESERVED' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED' | 'VALID'
  rewardCredit: number
  externalFormUrl: string | null
  slotReservedAt: string
  codeAvailableAt: string
  slotExpiresAt: string
}
export type CompletionCode = {
  participationPublicId: string
  completionCode: string
  issuedAt: string
  expiresAt: string
}
