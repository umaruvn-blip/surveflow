import { AdminGuard } from '@/components/AdminGuard'
import { AdminTrackingPage } from '@/pages/AdminTrackingPage'

export default function AdminTrackingRoute() {
  return (
    <AdminGuard>
      <AdminTrackingPage />
    </AdminGuard>
  )
}
