import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { queryClient } from '@/libs/query-client'
import { AuthSessionProvider } from '@/providers/auth-session-provider'
import { FeedbackDialog } from '@/components/Feedback'
import { captureAndRecordUtm } from '@/utils/utm'

type AppProviderProps = {
  children: React.ReactNode
}

function UtmTracker() {
  useEffect(() => {
    captureAndRecordUtm()
  }, [])
  return null
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSessionProvider>
        <UtmTracker />
        {children}
        <FeedbackDialog />
        <Toaster position='top-center' richColors />
      </AuthSessionProvider>
    </QueryClientProvider>
  )
}
