import { ArrowLeft, ExternalLink, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'
import { formatKoreanDate } from '@/lib/manage/date'
import { getManagePayload } from '@/lib/manage/payload'
import type { Newcomer } from '@/payload-types'

const baptismLabels: Record<NonNullable<Newcomer['baptismStatus']>, string> = {
  baptized: '받음',
  notBaptized: '안 받음',
}

const faithExperienceLabels: Record<NonNullable<Newcomer['faithExperience']>, string> = {
  firstTime: '교회가 처음',
  returning: '오래 쉬었어요',
  transfer: '교회 이동',
}

const genderLabels: Record<Newcomer['gender'], string> = {
  female: '여',
  male: '남',
}

const interestLabels: Record<NonNullable<Newcomer['interests']>[number], string> = {
  bibleStudy: '성경공부',
  notSure: '아직 잘 모르겠어요',
  prayer: '기도회',
  service: '봉사',
  smallGroup: '소그룹',
  worship: '찬양팀',
  youngAdults: '청년부',
}

const roleLabels: Record<NonNullable<Newcomer['churchRoles']>[number], string> = {
  deacon: '집사',
  elder: '장로',
  kwonsa: '권사',
  pastor: '목회자',
}

const sourceLabels: Record<Newcomer['source'], string> = {
  other: '기타',
  passingBy: '지나가다가',
  referral: '전도/소개',
  search: '인터넷 검색',
  sns: 'SNS',
  youtube: '유튜브',
}

const sourceChannelLabels: Record<NonNullable<Newcomer['sourceChannels']>[number], string> = {
  other: '기타',
  referral: '전도/소개',
  search: '인터넷 검색',
  sns: 'SNS',
  youtube: '유튜브',
}

const statusLabels: Record<NonNullable<Newcomer['status']>, string> = {
  contacted: '연락 완료',
  pending: '대기 중',
  registered: '등록 완료',
  visited: '방문 완료',
}

const statusTone: Record<NonNullable<Newcomer['status']>, string> = {
  contacted: 'info',
  pending: 'warning',
  registered: 'success',
  visited: 'success',
}

export default async function ManageNewcomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireManageUser()
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isInteger(numericId)) notFound()

  const payload = await getManagePayload()
  const doc = await payload.findByID({ collection: 'newcomers', id: numericId }).catch(() => null)
  if (!doc) notFound()

  const status = doc.status || 'pending'

  return (
    <ManageShell active="newcomers" user={user}>
      <PageHeader
        description={`${statusLabels[status]} · ${formatKoreanDate(doc.visitDate || doc.createdAt)}`}
        title={doc.name}
      >
        <Link className="manage-button secondary" href="/manage/newcomers">
          <ArrowLeft />
          목록
        </Link>
        <Link className="manage-button secondary" href="/newcomer" target="_blank">
          <ExternalLink />
          등록 폼
        </Link>
      </PageHeader>

      <section className="manage-detail-hero" aria-label="새가족 등록 요약">
        <div>
          <span className="manage-kicker">새가족 등록카드</span>
          <h2>{doc.name}</h2>
          <p>
            {doc.phone}
            {doc.schoolOrWork ? ` · ${doc.schoolOrWork}` : ''}
          </p>
        </div>
        <div className="manage-detail-actions">
          <span className={`manage-badge ${statusTone[status]}`}>{statusLabels[status]}</span>
          <Link className="manage-button secondary" href={`tel:${doc.phone}`}>
            <Phone />
            전화
          </Link>
          {doc.email ? (
            <Link className="manage-button secondary" href={`mailto:${doc.email}`}>
              <Mail />
              메일
            </Link>
          ) : null}
        </div>
      </section>

      <div className="manage-detail-layout">
        <DetailSection title="기본 정보">
          <DetailItem label="이름">{doc.name}</DetailItem>
          <DetailItem label="성별">{genderLabels[doc.gender]}</DetailItem>
          <DetailItem label="연락처">{doc.phone}</DetailItem>
          <DetailItem label="이메일">{doc.email}</DetailItem>
          <DetailItem label="생년월일">{formatKoreanDate(doc.birthDate)}</DetailItem>
          <DetailItem label="나이">{doc.age}</DetailItem>
          <DetailItem label="학교/직장">{doc.schoolOrWork}</DetailItem>
          <DetailItem label="주소">{doc.address}</DetailItem>
        </DetailSection>

        <DetailSection title="등록 정보">
          <DetailItem label="등록신청일">{formatKoreanDate(doc.visitDate)}</DetailItem>
          <DetailItem label="대표 방문경로">{sourceLabels[doc.source]}</DetailItem>
          <DetailItem label="방문경로">{formatList(doc.sourceChannels, sourceChannelLabels)}</DetailItem>
          <DetailItem label="경로 상세">{doc.sourceDetail}</DetailItem>
          <DetailItem label="신앙경력">
            {doc.faithExperience ? faithExperienceLabels[doc.faithExperience] : null}
          </DetailItem>
          <DetailItem label="기존교회">{doc.previousChurch}</DetailItem>
          <DetailItem label="MBTI">{doc.mbti}</DetailItem>
          <DetailItem label="세례">
            {doc.baptismStatus ? baptismLabels[doc.baptismStatus] : null}
          </DetailItem>
          <DetailItem label="직분">{formatList(doc.churchRoles, roleLabels)}</DetailItem>
          <DetailItem label="관심 사역">{formatList(doc.interests, interestLabels)}</DetailItem>
        </DetailSection>

        <DetailSection title="동의/서약">
          <ConsentItem label="개인정보 사용 동의" value={doc.privacyConsent} />
          <ConsentItem label="단체카톡방 초대 동의" value={doc.groupChatConsent} />
          <ConsentItem label="금품 거래 및 사업 목적 사적 연락 금지" value={doc.conductConsent} />
          <ConsentItem label="비신앙적/이단적 행위 금지" value={doc.faithCommunityConsent} />
        </DetailSection>

        <DetailSection title="메모">
          <DetailItem full label="문의사항 또는 기도제목">
            {doc.message}
          </DetailItem>
          <DetailItem full label="관리자 메모">
            {doc.notes}
          </DetailItem>
        </DetailSection>

        <DetailSection title="시스템 정보">
          <DetailItem label="상태">
            <span className={`manage-badge ${statusTone[status]}`}>{statusLabels[status]}</span>
          </DetailItem>
          <DetailItem label="접수 시각">{formatKoreanDateTime(doc.createdAt)}</DetailItem>
          <DetailItem label="수정 시각">{formatKoreanDateTime(doc.updatedAt)}</DetailItem>
          <DetailItem label="레코드 ID">{doc.id}</DetailItem>
        </DetailSection>
      </div>
    </ManageShell>
  )
}

function ConsentItem({ label, value }: { label: string; value: boolean }) {
  return (
    <DetailItem label={label}>
      <span className={`manage-badge ${value ? 'success' : 'draft'}`}>
        {value ? '동의' : '미동의'}
      </span>
    </DetailItem>
  )
}

function DetailItem({
  children,
  full,
  label,
}: {
  children: ReactNode
  full?: boolean
  label: string
}) {
  return (
    <div className={full ? 'manage-detail-item is-full' : 'manage-detail-item'}>
      <dt>{label}</dt>
      <dd>{isEmpty(children) ? <span className="manage-muted">-</span> : children}</dd>
    </div>
  )
}

function DetailSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="manage-detail-section">
      <h2>{title}</h2>
      <dl className="manage-detail-list">{children}</dl>
    </section>
  )
}

function formatKoreanDateTime(value: string | null | undefined): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('ko-KR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    timeZone: 'Asia/Seoul',
    year: 'numeric',
  }).format(date)
}

function formatList<T extends string>(
  values: readonly T[] | null | undefined,
  labels: Record<T, string>,
): string | null {
  if (!values?.length) return null
  return values.map((value) => labels[value] || value).join(', ')
}

function isEmpty(value: ReactNode): boolean {
  return value === null || value === undefined || value === ''
}
