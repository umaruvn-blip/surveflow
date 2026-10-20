import { HttpStatusCode } from '@/enums/http-status-code'

export function ForbiddenPage() {
  return (
    <main className='mx-auto max-w-md p-6'>
      <h1 className='mb-2 text-2xl font-semibold'>{HttpStatusCode.Forbidden} - Forbidden</h1>
      <p className='text-sm text-gray-600'>You do not have permission to access this page.</p>
    </main>
  )
}
