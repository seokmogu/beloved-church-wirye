'use server'

import { Buffer } from 'node:buffer'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireManageActionUser } from '@/lib/manage/auth'
import { InstagramSyncConfigError, syncInstagramPosts } from '@/lib/instagram'
import { dateInputToISO } from '@/lib/manage/date'
import { plaintextToLexical } from '@/lib/manage/lexical'
import { getManagePayload } from '@/lib/manage/payload'

const publicPaths = [
  '/',
  '/about',
  '/about/leaders',
  '/announcements',
  '/newcomer',
  '/church-news',
  '/church-news/videos',
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

export async function saveChurchVideoAction(formData: FormData) {
  await requireManageActionUser()
  const payload = await getManagePayload()
  const id = optionalNumber(formData, 'id')
  const youtubeUrl = requiredString(formData, 'youtubeUrl')
  const youtubeId = extractYouTubeId(youtubeUrl)
  const data = {
    description: optionalString(formData, 'description'),
    status: stringValue(formData, 'status') === 'draft' ? 'draft' : 'published',
    thumbnail: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : undefined,
    title: requiredString(formData, 'title'),
    videoDate: dateInputToISO(stringValue(formData, 'videoDate')),
    youtubeId,
    youtubeUrl,
  }

  if (id) {
    await payload.update({ collection: 'church-videos', data: data as any, id })
  } else {
    await payload.create({ collection: 'church-videos', data: data as any })
  }

  revalidateManageAndPublic('/manage/videos')
  redirect('/manage/videos')
}

export async function deleteChurchVideoAction(formData: FormData) {
  await requireManageActionUser()
  const id = requiredNumber(formData, 'id')
  const payload = await getManagePayload()

  await payload.delete({ collection: 'church-videos', id })
  revalidateManageAndPublic('/manage/videos')
  redirect('/manage/videos')
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

export async function saveChurchNewsAction(formData: FormData) {
  await requireManageActionUser()
  const payload = await getManagePayload()
  const id = optionalNumber(formData, 'id')

  try {
    const title = optionalString(formData, 'title')
    const uploadedImages = await uploadMediaFilesFromForm(
      payload,
      formData,
      'imageFiles',
      title || '교회소식 이미지',
    )
    const data = {
      date: dateInputToISO(stringValue(formData, 'date')),
      description: optionalString(formData, 'description'),
      images: parseChurchNewsImages(formData, uploadedImages),
      isPublic: checkboxValue(formData, 'isPublic'),
      title,
    }

    if (id) {
      await payload.update({ collection: 'church-news', data: data as any, id })
    } else {
      await payload.create({ collection: 'church-news', data: data as any })
    }
  } catch (error) {
    console.error('Failed to save church news:', error)
    redirect(churchNewsErrorPath(id, isUploadStorageError(error) ? 'storage' : 'upload'))
  }

  revalidateManageAndPublic('/manage/church-news')
  redirect('/manage/church-news')
}

export async function deleteChurchNewsAction(formData: FormData) {
  await requireManageActionUser()
  const id = requiredNumber(formData, 'id')
  const payload = await getManagePayload()

  await payload.delete({ collection: 'church-news', id })
  revalidateManageAndPublic('/manage/church-news')
  redirect('/manage/church-news')
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
  const offeringData = {
    bankAccounts: parseBankAccounts(formData),
    bibleReference: optionalString(formData, 'bibleReference'),
    bibleVerse: optionalString(formData, 'bibleVerse'),
    introText: optionalString(formData, 'introText'),
    notes: optionalString(formData, 'notes'),
    offeringTypes: parseOfferingTypes(formData),
  }

  await payload.updateGlobal({
    data: offeringData as any,
    slug: 'offering-page',
  })

  revalidateManageAndPublic('/manage/offering')
  redirect('/manage/offering')
}

export async function saveHomeSettingsAction(formData: FormData) {
  await requireManageActionUser()
  const payload = await getManagePayload()
  const currentSettings = (await payload.findGlobal({
    slug: 'site-settings',
    depth: 0,
  })) as unknown as Record<string, unknown>
  const currentDesign = currentSettings.design as Record<string, unknown> | null | undefined

  const heroImageUpload = await uploadMediaFromForm(
    payload,
    formData,
    'heroImageFile',
    optionalString(formData, 'heroTitle') || '홈 히어로 배경 이미지',
  )
  const pageBackgroundUpload = await uploadMediaFromForm(
    payload,
    formData,
    'pageBackgroundImageFile',
    '전체 페이지 배경 이미지',
  )
  const darkSectionBackgroundUpload = await uploadMediaFromForm(
    payload,
    formData,
    'darkSectionBackgroundImageFile',
    '어두운 섹션 배경 이미지',
  )

  await payload.updateGlobal({
    data: {
      churchName: optionalString(formData, 'churchName') || '사랑하는교회',
      design: parseDesignSettings(formData, currentDesign, {
        darkSectionBackgroundImage: darkSectionBackgroundUpload,
        pageBackgroundImage: pageBackgroundUpload,
      }),
      englishName: optionalString(formData, 'englishName'),
      heroEyebrow: optionalString(formData, 'heroEyebrow'),
      heroImage: checkboxValue(formData, 'clearHeroImage')
        ? null
        : heroImageUpload || mediaRelationValue(currentSettings.heroImage),
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

export async function saveLeadersSettingsAction(formData: FormData) {
  await requireManageActionUser()
  const payload = await getManagePayload()
  const currentSettings = (await payload.findGlobal({
    slug: 'site-settings',
    depth: 0,
  })) as unknown as Record<string, unknown>
  const pastorPhotoUpload = await uploadMediaFromForm(
    payload,
    formData,
    'pastorPhotoFile',
    optionalString(formData, 'pastorName') || '담임목사 사진',
  )

  await payload.updateGlobal({
    data: {
      pastorBio: optionalString(formData, 'pastorBio'),
      pastorName: optionalString(formData, 'pastorName') || '담임목사',
      pastorPhoto: checkboxValue(formData, 'clearPastorPhoto')
        ? null
        : pastorPhotoUpload || mediaRelationValue(currentSettings.pastorPhoto),
      pastorQuote: optionalString(formData, 'pastorQuote'),
      pastorTitle: optionalString(formData, 'pastorTitle'),
    } as any,
    slug: 'site-settings',
  })

  revalidateManageAndPublic('/manage/leaders')
  redirect('/manage/leaders')
}

export async function saveInstagramSettingsAction(formData: FormData) {
  await requireManageActionUser()
  const payload = await getManagePayload()
  const currentSettings = (await payload.findGlobal({
    slug: 'site-settings',
    depth: 0,
  })) as {
    instagramPosts?: Array<{
      caption?: unknown
      hashtags?: unknown
      publishedAt?: unknown
      thumbnail?: unknown
      thumbnailUrl?: unknown
    } | null> | null
  }

  await payload.updateGlobal({
    data: {
      instagramHandle: optionalString(formData, 'instagramHandle'),
      instagramPosts: await parseInstagramPosts(payload, formData, currentSettings.instagramPosts),
      instagramUrl: optionalString(formData, 'instagramUrl'),
    } as any,
    slug: 'site-settings',
  })

  revalidateManageAndPublic('/manage/instagram')
  redirect('/manage/instagram')
}

export async function syncInstagramSettingsAction() {
  await requireManageActionUser()
  const payload = await getManagePayload()
  let syncedCount = 0

  try {
    const result = await syncInstagramPosts(payload)
    syncedCount = result.count
  } catch (error) {
    if (error instanceof InstagramSyncConfigError) {
      redirect('/manage/instagram?sync=missing-config')
    }

    console.error('Failed to sync Instagram posts:', error)
    redirect('/manage/instagram?sync=failed')
  }

  revalidateManageAndPublic('/manage/instagram')
  redirect(`/manage/instagram?sync=success&count=${syncedCount}`)
}

export async function saveMenuAction(formData: FormData) {
  await requireManageActionUser()
  const payload = await getManagePayload()

  try {
    await payload.updateGlobal({
      data: {
        navItems: parseMenuItems(formData),
      } as any,
      slug: 'header',
    })
  } catch (error) {
    console.error('Failed to save menu:', error)
    redirect('/manage/menu?error=save')
  }

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

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
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

async function uploadMediaFromForm(
  payload: Awaited<ReturnType<typeof getManagePayload>>,
  formData: FormData,
  key: string,
  alt: string,
): Promise<number | string | null> {
  const value = formData.get(key)
  if (!value || typeof value === 'string') return null

  const file = value as File
  if (!file.size) return null

  const uploaded = await payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data: Buffer.from(await file.arrayBuffer()),
      mimetype: file.type || 'application/octet-stream',
      name: file.name || `${key}.upload`,
      size: file.size,
    },
  } as any)

  return uploaded.id
}

async function uploadMediaFilesFromForm(
  payload: Awaited<ReturnType<typeof getManagePayload>>,
  formData: FormData,
  key: string,
  altPrefix: string,
): Promise<Array<{ caption: null; image: number | string }>> {
  const files = formData
    .getAll(key)
    .filter(isUploadableFile)
    .filter((file) => file.size > 0)
  const uploadedImages: Array<{ caption: null; image: number | string }> = []
  assertUploadStorageConfigured(files.length)

  for (const [index, file] of files.entries()) {
    const uploaded = await payload.create({
      collection: 'media',
      data: { alt: `${altPrefix} ${index + 1}` },
      file: {
        data: Buffer.from(await file.arrayBuffer()),
        mimetype: file.type || 'application/octet-stream',
        name: file.name || `${key}-${index + 1}.upload`,
        size: file.size,
      },
    } as any)

    uploadedImages.push({ caption: null, image: uploaded.id })
  }

  return uploadedImages
}

function assertUploadStorageConfigured(fileCount: number) {
  if (fileCount === 0) return
  if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('UPLOAD_STORAGE_NOT_CONFIGURED')
  }
}

function isUploadStorageError(error: unknown): boolean {
  return error instanceof Error && error.message === 'UPLOAD_STORAGE_NOT_CONFIGURED'
}

function churchNewsErrorPath(id: number | undefined, error: 'storage' | 'upload'): string {
  const path = id ? `/manage/church-news/${id}` : '/manage/church-news/new'
  return `${path}?error=${error}`
}

function isUploadableFile(value: FormDataEntryValue): value is File {
  return (
    typeof value === 'object' &&
    value !== null &&
    'arrayBuffer' in value &&
    'size' in value &&
    'name' in value
  )
}

function parseChurchNewsImages(
  formData: FormData,
  uploadedImages: Array<{ caption: null; image: number | string }>,
) {
  const rowIds = stringValues(formData, 'churchNewsImageRowId')
  const imageIds = stringValues(formData, 'churchNewsImageId')
  const captions = stringValues(formData, 'churchNewsImageCaption')
  const preUploadedImages = stringValues(formData, 'uploadedChurchNewsImageId')
    .filter(Boolean)
    .map((imageId) => ({
      caption: null,
      image: relationValueFromString(imageId),
    }))
  const existingImages = imageIds
    .map((imageId, index) => {
      if (!imageId || formData.get(`churchNewsRemoveImage-${index}`) === 'on') return null

      const item: {
        caption: string | null
        id?: string
        image: number | string
      } = {
        caption: captions[index] || null,
        image: relationValueFromString(imageId),
      }

      if (rowIds[index]) item.id = rowIds[index]
      return item
    })
    .filter((item): item is { caption: string | null; id?: string; image: number | string } =>
      Boolean(item),
    )

  return [...existingImages, ...preUploadedImages, ...uploadedImages]
}

function relationValueFromString(value: string): number | string {
  const numberValue = Number(value)
  return Number.isInteger(numberValue) ? numberValue : value
}

function mediaRelationValue(value: unknown): number | string | null {
  if (!value) return null
  if (typeof value === 'number' || typeof value === 'string') return value
  if (typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: number | string }).id
    return id ?? null
  }
  return null
}

function currentNumber(value: unknown, fallback: number): number {
  const numberValue = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

function currentString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function parseDesignSettings(
  formData: FormData,
  currentDesign: Record<string, unknown> | null | undefined,
  uploads: {
    darkSectionBackgroundImage: number | string | null
    pageBackgroundImage: number | string | null
  },
) {
  const current = currentDesign || {}

  return {
    ...current,
    backgroundColor:
      optionalString(formData, 'backgroundColor') ||
      currentString(current.backgroundColor, '#f7f8f6'),
    bodyFontSize: clampNumber(
      formData,
      'bodyFontSize',
      currentNumber(current.bodyFontSize, 16),
      13,
      24,
    ),
    borderColor:
      optionalString(formData, 'borderColor') || currentString(current.borderColor, '#d9ded6'),
    cardBackgroundColor:
      optionalString(formData, 'cardBackgroundColor') ||
      currentString(current.cardBackgroundColor, '#ffffff'),
    darkSectionBackgroundColor:
      optionalString(formData, 'darkSectionBackgroundColor') ||
      currentString(current.darkSectionBackgroundColor, '#143c2e'),
    darkSectionBackgroundImage: checkboxValue(formData, 'clearDarkSectionBackgroundImage')
      ? null
      : uploads.darkSectionBackgroundImage ||
        mediaRelationValue(current.darkSectionBackgroundImage),
    footerBackgroundColor:
      optionalString(formData, 'footerBackgroundColor') ||
      currentString(current.footerBackgroundColor, '#143c2e'),
    headerBackgroundColor:
      optionalString(formData, 'headerBackgroundColor') ||
      currentString(current.headerBackgroundColor, '#123125'),
    heroOverlayColor:
      optionalString(formData, 'heroOverlayColor') ||
      currentString(current.heroOverlayColor, '#0a1c15'),
    heroOverlayOpacity: clampNumber(
      formData,
      'heroOverlayOpacity',
      currentNumber(current.heroOverlayOpacity, 82),
      0,
      100,
    ),
    heroSubtitleFontSize: clampNumber(
      formData,
      'heroSubtitleFontSize',
      currentNumber(current.heroSubtitleFontSize, 30),
      16,
      64,
    ),
    heroTitleFontSize: clampNumber(
      formData,
      'heroTitleFontSize',
      currentNumber(current.heroTitleFontSize, 88),
      36,
      128,
    ),
    mutedTextColor:
      optionalString(formData, 'mutedTextColor') ||
      currentString(current.mutedTextColor, '#5d675f'),
    pageBackgroundImage: checkboxValue(formData, 'clearPageBackgroundImage')
      ? null
      : uploads.pageBackgroundImage || mediaRelationValue(current.pageBackgroundImage),
    primaryColor:
      optionalString(formData, 'primaryColor') || currentString(current.primaryColor, '#123125'),
    primaryLightColor:
      optionalString(formData, 'primaryLightColor') ||
      currentString(current.primaryLightColor, '#1c4938'),
    secondaryColor:
      optionalString(formData, 'secondaryColor') ||
      currentString(current.secondaryColor, '#f3ead6'),
    sectionBackgroundColor:
      optionalString(formData, 'sectionBackgroundColor') ||
      currentString(current.sectionBackgroundColor, '#f7f8f6'),
    sectionTitleFontSize: clampNumber(
      formData,
      'sectionTitleFontSize',
      currentNumber(current.sectionTitleFontSize, 48),
      24,
      80,
    ),
    showHeroPattern: checkboxValue(formData, 'showHeroPattern'),
    textColor: optionalString(formData, 'textColor') || currentString(current.textColor, '#171a17'),
  }
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

async function parseInstagramPosts(
  payload: Awaited<ReturnType<typeof getManagePayload>>,
  formData: FormData,
  currentPosts:
    | Array<{
        caption?: unknown
        hashtags?: unknown
        publishedAt?: unknown
        thumbnail?: unknown
        thumbnailUrl?: unknown
      } | null>
    | null
    | undefined,
) {
  const types = stringValues(formData, 'instagramPostType')
  const postIds = stringValues(formData, 'instagramPostId')
  const captions = stringValues(formData, 'instagramPostCaption')
  const dates = stringValues(formData, 'instagramPostPublishedAt')
  const hashtags = stringValues(formData, 'instagramPostHashtags')
  const posts = await Promise.all(
    postIds.map(async (postId, index) => {
      if (!postId) return null

      const uploadedThumbnail = await uploadMediaFromForm(
        payload,
        formData,
        `instagramPostThumbnailFile-${index}`,
        `Instagram 게시물 ${postId} 썸네일`,
      )
      const currentThumbnail =
        mediaRelationValue(indexedString(formData, 'instagramPostThumbnail', index)) ||
        mediaRelationValue(currentPosts?.[index]?.thumbnail)
      const thumbnail = checkboxValue(formData, `instagramPostClearThumbnail-${index}`)
        ? null
        : uploadedThumbnail || currentThumbnail
      const thumbnailUrl =
        !thumbnail && !checkboxValue(formData, `instagramPostClearThumbnail-${index}`)
          ? indexedString(formData, 'instagramPostThumbnailUrl', index) ||
            stringOrNull(currentPosts?.[index]?.thumbnailUrl)
          : null

      return {
        caption:
          optionalIndexedString(captions, index) || stringOrNull(currentPosts?.[index]?.caption),
        hashtags:
          optionalIndexedString(hashtags, index) || stringOrNull(currentPosts?.[index]?.hashtags),
        postId,
        publishedAt:
          optionalDateInputToISO(dates[index]) || stringOrNull(currentPosts?.[index]?.publishedAt),
        thumbnail,
        thumbnailUrl,
        type: types[index] === 'reel' ? 'reel' : 'p',
      }
    }),
  )

  return posts.filter((post): post is NonNullable<typeof post> => Boolean(post))
}

function optionalDateInputToISO(value: string | undefined): string | null {
  return value ? dateInputToISO(value) : null
}

function optionalIndexedString(values: string[], index: number): string | null {
  const value = values[index]?.trim()
  return value || null
}

function parseMenuItems(formData: FormData) {
  const labels = stringValues(formData, 'menuLabel')
  const types = stringValues(formData, 'menuType')
  const internalPaths = stringValues(formData, 'menuInternalPath')
  const urls = stringValues(formData, 'menuUrl')

  return labels
    .map((label, index) => {
      const link = buildMenuLink({
        internalPath: internalPaths[index],
        label,
        newTab: formData.get(`menuNewTab-${index}`) === 'on',
        type: types[index],
        url: urls[index],
      })

      if (!link) return null

      const children = parseChildMenuItems(formData, index)
      return children.length ? { children, link } : { link }
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
}

function parseChildMenuItems(formData: FormData, parentIndex: number) {
  const labels = stringValues(formData, `menuChildLabel-${parentIndex}`)
  const types = stringValues(formData, `menuChildType-${parentIndex}`)
  const internalPaths = stringValues(formData, `menuChildInternalPath-${parentIndex}`)
  const urls = stringValues(formData, `menuChildUrl-${parentIndex}`)

  return labels
    .map((label, childIndex) =>
      buildMenuLink({
        internalPath: internalPaths[childIndex],
        label,
        newTab: formData.get(`menuChildNewTab-${parentIndex}-${childIndex}`) === 'on',
        type: types[childIndex],
        url: urls[childIndex],
      }),
    )
    .filter((link): link is NonNullable<typeof link> => Boolean(link))
    .map((link) => ({ link }))
}

function buildMenuLink({
  internalPath,
  label,
  newTab,
  type,
  url,
}: {
  internalPath?: string
  label: string
  newTab: boolean
  type?: string
  url?: string
}) {
  const normalizedLabel = label.trim()
  if (!normalizedLabel) return null

  if (type === 'custom') {
    const normalizedUrl = url?.trim() || ''
    return normalizedUrl
      ? { label: normalizedLabel, newTab, type: 'custom' as const, url: normalizedUrl }
      : null
  }

  return {
    internalPath: internalPath?.trim() || '/',
    label: normalizedLabel,
    newTab,
    type: 'internal' as const,
  }
}
