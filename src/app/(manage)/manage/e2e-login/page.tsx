import { redirect } from 'next/navigation'

import { getManageAuthState } from '@/lib/manage/auth'
import { isManagePreviewE2ETestAuthEnabled } from '@/lib/manage/preview-e2e-auth'

import { startManagePreviewE2ETestAction } from './actions'

type E2ELoginSearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function ManagePreviewE2ELoginPage({
  searchParams,
}: {
  searchParams: E2ELoginSearchParams
}) {
  if (!isManagePreviewE2ETestAuthEnabled()) redirect('/manage/login')

  const state = await getManageAuthState()
  if (state.user) redirect('/manage')

  const params = await searchParams
  const invalidToken = params.error === 'invalid'

  return (
    <main className="manage-login-page">
      <section className="manage-login-panel">
        <h1>Preview E2E 인증</h1>
        <p>개발 Preview 자동 검증 전용입니다.</p>
        {invalidToken ? <div className="manage-alert danger">검증 토큰이 올바르지 않습니다.</div> : null}
        <form action={startManagePreviewE2ETestAction} className="manage-form">
          <div className="manage-field">
            <label htmlFor="token">Preview E2E 토큰</label>
            <input autoComplete="off" id="token" name="token" required type="password" />
          </div>
          <div className="manage-form-actions">
            <button type="submit">개발 검증 시작</button>
          </div>
        </form>
      </section>
    </main>
  )
}
