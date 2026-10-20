import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import { SurveyDraftForm } from '@/components/SurveyDraftForm'

vi.mock('@/hooks/queries/metadata/use-categories-query', () => ({
  useCategoriesQuery: () => ({ data: [] })
}))
vi.mock('@/hooks/queries/metadata/use-interests-query', () => ({
  useInterestsQuery: () => ({ data: [] })
}))

it('renders nullable defaults without crashing and preserves null optional fields on submit', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  const submit = vi.fn().mockResolvedValue(undefined)
  try {
    await act(async () => {
      root.render(<SurveyDraftForm pending={false} onSubmit={submit} />)
    })
    const fill = async (id: string, value: string) => {
      const input = host.querySelector<HTMLInputElement>(`[id="${id}"]`)!
      await act(async () => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
          input,
          value
        )
        input.dispatchEvent(new Event('input', { bubbles: true }))
      })
    }
    await fill('title', 'Khảo sát kiểm thử')
    await fill('externalFormUrl', 'https://docs.google.com/forms/d/e/test/viewform')
    await act(async () => {
      host
        .querySelector('form')!
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })
    expect(submit).toHaveBeenCalledOnce()
    expect(submit.mock.calls[0][0]).toMatchObject({
      description: null,
      questionCount: null,
      targeting: { minBirthYear: null, maxBirthYear: null }
    })
  } finally {
    await act(async () => root.unmount())
    host.remove()
  }
})
