'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireManageActionUser } from '@/lib/manage/auth'
import { dateInputToISO } from '@/lib/manage/date'
import { plaintextToLexical } from '@/lib/manage/lexical'
import { getManagePayload } from '@/lib/manage/payload'

const publicPaths = ['/', '/announcements', '/sermon', '/bulletins', '/offering']

export async function saveAnnouncementAction(formData: FormData) {
  await requireManageActionUser()
  const payload = await getManagePayload()
  const id = optionalNumber(formData, 'id')
  const data = {
    content: plaintextToLexical(stringValue(formData, 'content')),
    googleDriveLink: optionalString(formData, 'googleDriveLink'),
    isPinned: checkboxValue(formData, 'isPinned'),
    publishedAt: dateInputToISO(stringValue(formData, 'publishedAt')),
    title: requiredString(formData, 'title'),
  }

  if (id) {
    await payload.update({ collection: 'announcements', data: data as any, id })
  } else {
    await payload.create({ collection: 'announcements', data: data as any })
  }

  revalidateManageAndPublic('/manage/announcements')
  redirect('/manage/announcements')
}

export async function deleteAnnouncementAction(formData: FormData) {
  await requireManageActionUser()
  const id = requiredNumber(formData, 'id')
  const payload = await getManagePayload()

  await payload.delete({ collection: 'announcements', id })
  revalidateManageAndPublic('/manage/announcements')
  redirect('/manage/announcements')
}

export async function saveSermonAction(formData: FormData) {
  await requireManageActionUser()
  const payload = await getManagePayload()
  const id = optionalNumber(formData, 'id')
  const youtubeUrl = requiredString(formData, 'youtubeUrl')
  const youtubeId = extractYouTubeId(youtubeUrl)
  const data = {
    description: optionalString(formData, 'description'),
    preacher: optionalString(formData, 'preacher') || '사랑하는교회',
    scriptureRef: optionalString(formData, 'scriptureRef'),
    sermonDate: dateInputToISO(stringValue(formData, 'sermonDate')),
    sermonSeries: optionalString(formData, 'sermonSeries'),
    status: stringValue(formData, 'status') === 'draft' ? 'draft' : 'published',
    thumbnail: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : undefined,
    title: requiredString(formData, 'title'),
    youtubeId,
    youtubeUrl,
  }

  if (id) {
    await payload.update({ collection: 'sermons', data: data as any, id })
  } else {
    await payload.create({ collection: 'sermons', data: data as any })
  }

  revalidateManageAndPublic('/manage/sermons')
  redirect('/manage/sermons')
}

export async function deleteSermonAction(formData: FormData) {
  await requireManageActionUser()
  const id = requiredNumber(formData, 'id')
  const payload = await getManagePayload()

  await payload.delete({ collection: 'sermons', id })
  revalidateManageAndPublic('/manage/sermons')
  redirect('/manage/sermons')
}

export async function saveBulletinAction(formData: FormData) {
  await requireManageActionUser()
  const payload = await getManagePayload()
  const id = optionalNumber(formData, 'id')
  const data = {
    date: dateInputToISO(stringValue(formData, 'date')),
    description: optionalString(formData, 'description'),
    isPublic: checkboxValue(formData, 'isPublic'),
    title: optionalString(formData, 'title'),
  }

  if (id) {
    await payload.update({ collection: 'bulletins', data: data as any, id })
  } else {
    await payload.create({ collection: 'bulletins', data: data as any })
  }

  revalidateManageAndPublic('/manage/bulletins')
  redirect('/manage/bulletins')
}

export async function deleteBulletinAction(formData: FormData) {
  await requireManageActionUser()
  const id = requiredNumber(formData, 'id')
  const payload = await getManagePayload()

  await payload.delete({ collection: 'bulletins', id })
  revalidateManageAndPublic('/manage/bulletins')
  redirect('/manage/bulletins')
}

export async function saveBannerAction(formData: FormData) {
  await requireManageActionUser()
  const payload = await getManagePayload()
  const endFallback = new Date()
  endFallback.setDate(endFallback.getDate() + 30)

  await payload.updateGlobal({
    data: {
      backgroundColor: optionalString(formData, 'backgroundColor') || '#1B3A2D',
      enabled: checkboxValue(formData, 'enabled'),
      endDate: dateInputToISO(stringValue(formData, 'endDate'), {
        endOfDay: true,
        fallback: endFallback,
      }),
      startDate: optionalString(formData, 'startDate')
        ? dateInputToISO(stringValue(formData, 'startDate'))
        : null,
      subtext: optionalString(formData, 'subtext'),
      text: requiredString(formData, 'text'),
      textColor: optionalString(formData, 'textColor') || '#ffffff',
    } as any,
    slug: 'special-banner',
  })

  revalidateManageAndPublic('/manage/banner')
  redirect('/manage/banner')
}

export async function saveOfferingAction(formData: FormData) {
  await requireManageActionUser()
  const payload = await getManagePayload()

  await payload.updateGlobal({
    data: {
      bankAccounts: parseBankAccounts(formData),
      bibleReference: optionalString(formData, 'bibleReference'),
      bibleVerse: optionalString(formData, 'bibleVerse'),
      introText: optionalString(formData, 'introText'),
      notes: optionalString(formData, 'notes'),
      offeringTypes: parseOfferingTypes(formData),
    } as any,
    slug: 'offering-page',
  })

  revalidateManageAndPublic('/manage/offering')
  redirect('/manage/offering')
}

function revalidateManageAndPublic(managePath: string) {
  revalidatePath(managePath)
  publicPaths.forEach((path) => revalidatePath(path))
}

function stringValue(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function optionalString(formData: FormData, key: string): string | null {
  const value = stringValue(formData, key)
  return value || null
}

function requiredString(formData: FormData, key: string): string {
  const value = stringValue(formData, key)
  if (!value) throw new Error(`${key} 값이 필요합니다.`)
  return value
}

function optionalNumber(formData: FormData, key: string): number | undefined {
  const value = stringValue(formData, key)
  if (!value) return undefined
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

function requiredNumber(formData: FormData, key: string): number {
  const value = optionalNumber(formData, key)
  if (!value) throw new Error(`${key} 값이 필요합니다.`)
  return value
}

function checkboxValue(formData: FormData, key: string): boolean {
  return formData.get(key) === 'on'
}

function extractYouTubeId(url: string): string | undefined {
  return url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  )?.[1]
}

function parseBankAccounts(formData: FormData) {
  const bankNames = stringValues(formData, 'bankName')
  const accountNumbers = stringValues(formData, 'accountNumber')
  const accountHolders = stringValues(formData, 'accountHolder')

  return bankNames
    .map((bankName, index) => ({
      accountHolder: accountHolders[index] || '',
      accountNumber: accountNumbers[index] || '',
      bankName,
    }))
    .filter((account) => account.bankName && account.accountNumber && account.accountHolder)
}

function parseOfferingTypes(formData: FormData) {
  const titles = stringValues(formData, 'offeringTypeTitle')
  const descriptions = stringValues(formData, 'offeringTypeDescription')

  return titles
    .map((title, index) => ({
      description: descriptions[index] || '',
      title,
    }))
    .filter((type) => type.title && type.description)
}

function stringValues(formData: FormData, key: string): string[] {
  return formData.getAll(key).map((value) => (typeof value === 'string' ? value.trim() : ''))
}
