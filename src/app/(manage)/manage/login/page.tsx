import { redirect } from 'next/navigation'

import { getManageAuthState } from '@/lib/manage/auth'

import { signInAction } from './actions'

const errorMessages: Record<string, string> = {
  config: 'Supabase Auth 설정이 아직 완료되지 않았습니다.',
  forbidden: '허용된 관리자 계정이 아닙니다.',
  invalid: '아이디 또는 비밀번호를 확인해 주세요.',
}

type LoginSearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function ManageLoginPage({
  searchParams,
}: {
  searchParams: LoginSearchParams
}) {
  const params = await searchParams
  const state = await getManageAuthState()
  const next = getStringParam(params.next) || '/manage'
  const error = getStringParam(params.error)

  if (state.user) redirect(sanitizeNext(next))

  return (
    <main className="manage-login-page">
      <section className="manage-login-panel">
        <h1>관리자 로그인</h1>
        <p>사랑하는교회 위례 콘텐츠 관리</p>

        {error ? (
          <div className="manage-alert danger">{errorMessages[error] || errorMessages.invalid}</div>
        ) : null}

        {!state.configured ? (
          <div className="manage-alert" role="alert">
            <strong>Supabase Auth 설정 필요</strong>
            <ul>
              {state.missingEnv.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        ) : (
          <form action={signInAction} className="manage-form">
            <input name="next" type="hidden" value={sanitizeNext(next)} />
            <div className="manage-field">
              <label htmlFor="login">아이디 또는 이메일</label>
              <input autoComplete="username" id="login" name="login" required type="text" />
            </div>
            <div className="manage-field">
              <label htmlFor="password">비밀번호</label>
              <input
                autoComplete="current-password"
                id="password"
                name="password"
                required
                type="password"
              />
            </div>
            <div className="manage-form-actions">
              <button className="manage-button" type="submit">
                로그인
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  )
}

function getStringParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

function sanitizeNext(value: string): string {
  if (!value.startsWith('/manage')) return '/manage'
  if (value.startsWith('/manage/login')) return '/manage'
  return value
}
