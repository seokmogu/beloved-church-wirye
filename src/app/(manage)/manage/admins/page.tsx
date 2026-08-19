import {
  createManageAdminAction,
  resetManageAdminPasswordAction,
  setManageAdminActiveAction,
} from '@/app/(manage)/manage/admins/actions'
import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { formatKoreanDate } from '@/lib/manage/date'
import { listManageAdmins } from '@/lib/manage/better-auth'
import { requireManageUser } from '@/lib/manage/auth'

const errorMessages: Record<string, string> = {
  'duplicate-email': '이미 등록된 이메일입니다.',
  'invalid-email': '올바른 이메일 주소를 입력해 주세요.',
  'invalid-name': '이름을 80자 이내로 입력해 주세요.',
  'invalid-password': '비밀번호는 12자 이상으로 설정해 주세요.',
  'last-admin': '마지막 활성 관리자는 비활성화할 수 없습니다.',
  'not-found': '관리자 계정을 찾을 수 없습니다.',
  save: '관리자 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  'self-deactivation': '현재 로그인한 관리자는 직접 비활성화할 수 없습니다.',
}

const statusMessages: Record<string, string> = {
  access: '관리자 접근 상태를 변경했습니다.',
  created: '새 관리자 계정을 추가했습니다.',
  password: '비밀번호를 변경했습니다.',
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function ManageAdminsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireManageUser()
  const [admins, params] = await Promise.all([listManageAdmins(), searchParams])
  const error = firstParam(params.error)
  const status = firstParam(params.status)

  return (
    <ManageShell active="admins" user={user}>
      <PageHeader
        description="관리자 계정을 추가하고, 비밀번호와 사이트 관리 접근 권한을 안전하게 관리합니다."
        title="관리자 관리"
      />

      {error ? <div className="manage-alert danger" role="alert">{errorMessages[error] || errorMessages.save}</div> : null}
      {status ? <div className="manage-alert" role="status">{statusMessages[status]}</div> : null}

      <form action={createManageAdminAction} className="manage-form manage-admin-create-form">
        <div>
          <h2 className="manage-section-title">관리자 추가</h2>
          <p className="manage-field-hint">등록 직후 활성화되며, 입력한 이메일과 비밀번호로 바로 로그인할 수 있습니다.</p>
        </div>
        <div className="manage-field-grid cols-3">
          <div className="manage-field">
            <label htmlFor="admin-name">이름</label>
            <input autoComplete="name" id="admin-name" maxLength={80} name="name" required type="text" />
          </div>
          <div className="manage-field">
            <label htmlFor="admin-email">이메일</label>
            <input autoComplete="email" id="admin-email" name="email" required type="email" />
          </div>
          <div className="manage-field">
            <label htmlFor="admin-password">초기 비밀번호</label>
            <input autoComplete="new-password" id="admin-password" minLength={12} name="password" required type="password" />
          </div>
        </div>
        <div className="manage-form-actions">
          <button className="manage-button" type="submit">관리자 추가</button>
        </div>
      </form>

      <div className="manage-table-wrap">
        <table className="manage-table">
          <thead>
            <tr>
              <th>관리자</th>
              <th>이메일</th>
              <th>접근 상태</th>
              <th>등록일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => {
              const isCurrentUser = admin.id === user.id

              return (
                <tr key={admin.id}>
                  <td className="manage-table-title">
                    {admin.name}
                    {isCurrentUser ? <span className="manage-admin-current">현재 로그인</span> : null}
                  </td>
                  <td>{admin.email}</td>
                  <td>
                    <span className={`manage-badge${admin.isActive ? '' : ' draft'}`}>
                      {admin.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td>{formatKoreanDate(admin.createdAt)}</td>
                  <td>
                    <div className="manage-admin-actions">
                      <form action={setManageAdminActiveAction}>
                        <input name="id" type="hidden" value={admin.id} />
                        <input name="nextActive" type="hidden" value={admin.isActive ? 'false' : 'true'} />
                        <button className="manage-button secondary" disabled={isCurrentUser && admin.isActive} type="submit">
                          {admin.isActive ? '비활성화' : '활성화'}
                        </button>
                      </form>
                      <details className="manage-admin-password">
                        <summary>비밀번호 재설정</summary>
                        <form action={resetManageAdminPasswordAction}>
                          <input name="id" type="hidden" value={admin.id} />
                          <label className="sr-only" htmlFor={`password-${admin.id}`}>새 비밀번호</label>
                          <input autoComplete="new-password" id={`password-${admin.id}`} minLength={12} name="password" placeholder="새 비밀번호 (12자 이상)" required type="password" />
                          <button className="manage-button secondary" type="submit">저장</button>
                        </form>
                      </details>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </ManageShell>
  )
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}
