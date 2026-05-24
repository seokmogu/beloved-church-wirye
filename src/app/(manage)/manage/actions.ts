'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireManageActionUser } from '@/lib/manage/auth'
import { dateInputToISO } from '@/lib/manage/date'
import { plaintextToLexical } from '@/lib/manage/lexical'
import { getManagePayload } from '@/lib/manage/payload'

const publicPaths = [
  '/',
  '/about',
  '/announcements',
  '/sermon',
  '/worship',
  '/bulletins',
  '/offering',
]

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

export async function saveSermonSettingsAction(formData: FormData) {
  await requireManageActionUser()
  const payload = await getManagePayload()

  await payload.updateGlobal({
    data: {
      youtubeChannelUrl: optionalString(formData, 'youtubeChannelUrl'),
      youtubeVideoCount: clampNumber(formData, 'youtubeVideoCount', 4, 1, 12),
    } as any,
    slug: 'site-settings',
  })

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

export async function saveHomeSettingsAction(formData: FormData) {
  await requireManageActionUser()
  const payload = await getManagePayload()

  await payload.updateGlobal({
    data: {
      churchName: optionalString(formData, 'churchName') || '사랑하는교회',
      englishName: optionalString(formData, 'englishName'),
      heroEyebrow: optionalString(formData, 'heroEyebrow'),
      heroPrimaryLabel: optionalString(formData, 'heroPrimaryLabel'),
      heroPrimaryUrl: optionalString(formData, 'heroPrimaryUrl'),
      heroSecondaryLabel: optionalString(formData, 'heroSecondaryLabel'),
      heroSecondaryUrl: optionalString(formData, 'heroSecondaryUrl'),
      heroSubtitle: optionalString(formData, 'heroSubtitle'),
      heroTitle: optionalString(formData, 'heroTitle'),
      homeSections: parseHomeSections(formData),
      subTagline: optionalString(formData, 'subTagline'),
      tagline: optionalString(formData, 'tagline'),
    } as any,
    slug: 'site-settings',
  })

  revalidateManageAndPublic('/manage/home')
  redirect('/manage/home')
}

export async function saveWorshipSettingsAction(formData: FormData) {
  await requireManageActionUser()
  const payload = await getManagePayload()

  await payload.updateGlobal({
    data: {
      address: optionalString(formData, 'address'),
      addressDetail: optionalString(formData, 'addressDetail'),
      mapLat: optionalNumber(formData, 'mapLat'),
      mapLng: optionalNumber(formData, 'mapLng'),
      parkingInfo: optionalString(formData, 'parkingInfo'),
      transitInfo: optionalString(formData, 'transitInfo'),
      visitorNotes: parseVisitorNotes(formData),
      worshipOrder: parseWorshipOrder(formData),
      worshipServices: parseWorshipServices(formData),
    } as any,
    slug: 'site-settings',
  })

  revalidateManageAndPublic('/manage/worship')
  redirect('/manage/worship')
}

export async function saveInstagramSettingsAction(formData: FormData) {
  await requireManageActionUser()
  const payload = await getManagePayload()

  await payload.updateGlobal({
    data: {
      instagramHandle: optionalString(formData, 'instagramHandle'),
      instagramPosts: parseInstagramPosts(formData),
      instagramUrl: optionalString(formData, 'instagramUrl'),
    } as any,
    slug: 'site-settings',
  })

  revalidateManageAndPublic('/manage/instagram')
  redirect('/manage/instagram')
}

export async function saveMenuAction(formData: FormData) {
  await requireManageActionUser()
  const payload = await getManagePayload()

  await payload.updateGlobal({
    data: {
      navItems: parseMenuItems(formData),
    } as any,
    slug: 'header',
  })

  revalidateManageAndPublic('/manage/menu')
  redirect('/manage/menu')
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

function clampNumber(formData: FormData, key: string, fallback: number, min: number, max: number) {
  const number = optionalNumber(formData, key) ?? fallback
  return Math.min(max, Math.max(min, number))
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

function indexedString(formData: FormData, key: string, index: number): string {
  const value = formData.get(`${key}-${index}`)
  return typeof value === 'string' ? value.trim() : ''
}

function parseHomeSections(formData: FormData) {
  const types = stringValues(formData, 'homeSectionType')

  return types
    .map((sectionType, index) => ({
      description: indexedString(formData, 'homeSectionDescription', index) || null,
      enabled: formData.get(`homeSectionEnabled-${index}`) === 'on',
      eyebrow: indexedString(formData, 'homeSectionEyebrow', index) || null,
      sectionType,
      title: indexedString(formData, 'homeSectionTitle', index) || null,
    }))
    .filter((section) =>
      ['intro', 'announcements', 'sermons', 'instagram', 'map'].includes(section.sectionType),
    )
}

function parseWorshipServices(formData: FormData) {
  const names = stringValues(formData, 'worshipServiceName')
  const times = stringValues(formData, 'worshipServiceTime')
  const descriptions = stringValues(formData, 'worshipServiceDescription')

  return names
    .map((name, index) => ({
      description: descriptions[index] || null,
      name,
      time: times[index] || '',
    }))
    .filter((service) => service.name && service.time)
}

function parseWorshipOrder(formData: FormData) {
  const titles = stringValues(formData, 'worshipOrderTitle')
  const descriptions = stringValues(formData, 'worshipOrderDescription')

  return titles
    .map((title, index) => ({
      description: descriptions[index] || null,
      title,
    }))
    .filter((item) => item.title)
}

function parseVisitorNotes(formData: FormData) {
  return stringValues(formData, 'visitorNote')
    .filter(Boolean)
    .map((text) => ({ text }))
}

function parseInstagramPosts(formData: FormData) {
  const types = stringValues(formData, 'instagramPostType')
  const postIds = stringValues(formData, 'instagramPostId')

  return postIds
    .map((postId, index) => ({
      postId,
      type: types[index] === 'reel' ? 'reel' : 'p',
    }))
    .filter((post) => post.postId)
}

function parseMenuItems(formData: FormData) {
  const labels = stringValues(formData, 'menuLabel')
  const types = stringValues(formData, 'menuType')
  const internalPaths = stringValues(formData, 'menuInternalPath')
  const urls = stringValues(formData, 'menuUrl')

  return labels
    .map((label, index) => {
      const type = types[index] === 'custom' ? 'custom' : 'internal'
      const link =
        type === 'custom'
          ? {
              label,
              newTab: formData.get(`menuNewTab-${index}`) === 'on',
              type,
              url: urls[index] || '',
            }
          : {
              internalPath: internalPaths[index] || '/',
              label,
              newTab: formData.get(`menuNewTab-${index}`) === 'on',
              type,
            }

      return { link }
    })
    .filter(
      (item) => item.link.label && ('url' in item.link ? item.link.url : item.link.internalPath),
    )
}
