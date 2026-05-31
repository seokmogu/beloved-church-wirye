import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Media, SiteSetting } from '@/payload-types'

const defaultTheme = {
  backgroundColor: '#f7f8f6',
  bodyFontSize: 16,
  borderColor: '#d9ded6',
  cardBackgroundColor: '#ffffff',
  darkSectionBackgroundColor: '#143c2e',
  footerBackgroundColor: '#143c2e',
  headerBackgroundColor: '#123125',
  heroOverlayColor: '#0a1c15',
  heroOverlayOpacity: 82,
  heroSubtitleFontSize: 30,
  heroTitleFontSize: 88,
  mutedTextColor: '#5d675f',
  primaryColor: '#123125',
  primaryLightColor: '#1c4938',
  secondaryColor: '#f3ead6',
  sectionBackgroundColor: '#f7f8f6',
  sectionTitleFontSize: 48,
  showHeroPattern: true,
  textColor: '#171a17',
}

function normalizeHex(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed) ? trimmed : fallback
}

function hexToRgb(value: string): [number, number, number] {
  const hex = value.replace('#', '')
  const normalized =
    hex.length === 3
      ? hex
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : hex

  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ]
}

function normalizeOpacity(value: unknown, fallback: number): number {
  return normalizeNumber(value, fallback, 0, 100)
}

function normalizeNumber(value: unknown, fallback: number, min: number, max: number): number {
  const numberValue = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numberValue)) return fallback
  return Math.min(max, Math.max(min, numberValue))
}

function getMediaUrl(media: Media | number | null | undefined): string | null {
  return media && typeof media === 'object' && media.url ? media.url : null
}

function cssUrl(url: string | null): string {
  if (!url) return 'none'
  return `url(${JSON.stringify(url)})`
}

function getRelativeLuminance(value: string): number {
  const [red, green, blue] = hexToRgb(value).map((channel) => {
    const normalized = channel / 255
    return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function getContrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = getRelativeLuminance(foreground)
  const backgroundLuminance = getRelativeLuminance(background)
  const light = Math.max(foregroundLuminance, backgroundLuminance)
  const dark = Math.min(foregroundLuminance, backgroundLuminance)

  return (light + 0.05) / (dark + 0.05)
}

function pickReadableColor(background: string, candidates: string[], minimumRatio = 4.5): string {
  const scored = candidates.map((color) => ({
    color,
    ratio: getContrastRatio(color, background),
  }))

  return (
    scored.find((candidate) => candidate.ratio >= minimumRatio)?.color ??
    scored.sort((a, b) => b.ratio - a.ratio)[0]?.color ??
    candidates[0]
  )
}

function buildThemeCSS(settings: SiteSetting | null): string {
  const design = settings?.design
  const primary = normalizeHex(design?.primaryColor, defaultTheme.primaryColor)
  const primaryLight = normalizeHex(design?.primaryLightColor, defaultTheme.primaryLightColor)
  const secondary = normalizeHex(design?.secondaryColor, defaultTheme.secondaryColor)
  const background = normalizeHex(design?.backgroundColor, defaultTheme.backgroundColor)
  const sectionBackground = normalizeHex(
    design?.sectionBackgroundColor,
    defaultTheme.sectionBackgroundColor,
  )
  const darkSectionBackground = normalizeHex(
    design?.darkSectionBackgroundColor,
    defaultTheme.darkSectionBackgroundColor,
  )
  const card = normalizeHex(design?.cardBackgroundColor, defaultTheme.cardBackgroundColor)
  const text = normalizeHex(design?.textColor, defaultTheme.textColor)
  const mutedText = normalizeHex(design?.mutedTextColor, defaultTheme.mutedTextColor)
  const border = normalizeHex(design?.borderColor, defaultTheme.borderColor)
  const headerBackground = normalizeHex(
    design?.headerBackgroundColor,
    defaultTheme.headerBackgroundColor,
  )
  const footerBackground = normalizeHex(
    design?.footerBackgroundColor,
    defaultTheme.footerBackgroundColor,
  )
  const heroOverlay = normalizeHex(design?.heroOverlayColor, defaultTheme.heroOverlayColor)
  const heroOverlayOpacity = normalizeOpacity(
    design?.heroOverlayOpacity,
    defaultTheme.heroOverlayOpacity,
  )
  const [overlayR, overlayG, overlayB] = hexToRgb(heroOverlay)
  const opacityStart = heroOverlayOpacity / 100
  const opacityMid = Math.max(0, opacityStart * 0.72)
  const opacityEnd = Math.max(0, opacityStart * 0.34)
  const pageBackgroundImage = getMediaUrl(
    design?.pageBackgroundImage as Media | number | null | undefined,
  )
  const darkSectionBackgroundImage = getMediaUrl(
    design?.darkSectionBackgroundImage as Media | number | null | undefined,
  )
  const patternOpacity = design?.showHeroPattern === false ? 0 : 0.18
  const heroTitleFontSize = normalizeNumber(
    design?.heroTitleFontSize,
    defaultTheme.heroTitleFontSize,
    36,
    128,
  )
  const heroSubtitleFontSize = normalizeNumber(
    design?.heroSubtitleFontSize,
    defaultTheme.heroSubtitleFontSize,
    16,
    64,
  )
  const sectionTitleFontSize = normalizeNumber(
    design?.sectionTitleFontSize,
    defaultTheme.sectionTitleFontSize,
    24,
    80,
  )
  const bodyFontSize = normalizeNumber(design?.bodyFontSize, defaultTheme.bodyFontSize, 13, 24)
  const sectionAccentText = pickReadableColor(sectionBackground, [
    secondary,
    primary,
    text,
    '#ffffff',
    '#171a17',
  ])
  const sectionMutedText = pickReadableColor(sectionBackground, [
    mutedText,
    text,
    primary,
    '#ffffff',
    '#171a17',
  ])
  const cardAccentText = pickReadableColor(card, [secondary, primary, text, '#ffffff', '#171a17'])
  const plainAccentText = pickReadableColor('#ffffff', [secondary, primary, text, '#171a17'])

  return `
:root {
  --background: ${background};
  --foreground: ${text};
  --card: ${card};
  --card-foreground: ${text};
  --popover: ${card};
  --popover-foreground: ${text};
  --primary: ${primary};
  --primary-foreground: #ffffff;
  --secondary: ${secondary};
  --secondary-foreground: ${primary};
  --muted: ${sectionBackground};
  --muted-foreground: ${mutedText};
  --accent: ${secondary};
  --accent-foreground: ${primary};
  --border: ${border};
  --input: ${border};
  --ring: ${secondary};
  --church-primary-light: ${primaryLight};
  --church-secondary-dark: color-mix(in srgb, ${secondary} 82%, black);
  --church-section-bg: ${sectionBackground};
  --church-section-accent-text: ${sectionAccentText};
  --church-section-muted-text: ${sectionMutedText};
  --church-card-accent-text: ${cardAccentText};
  --church-plain-accent-text: ${plainAccentText};
  --church-dark-section-bg: ${darkSectionBackground};
  --church-header-bg: ${headerBackground};
  --church-footer-bg: ${footerBackground};
  --church-hero-from: ${primary};
  --church-hero-mid: ${primaryLight};
  --church-hero-to: ${primary};
  --church-hero-overlay-start: rgba(${overlayR}, ${overlayG}, ${overlayB}, ${opacityStart});
  --church-hero-overlay-mid: rgba(${overlayR}, ${overlayG}, ${overlayB}, ${opacityMid});
  --church-hero-overlay-end: rgba(${overlayR}, ${overlayG}, ${overlayB}, ${opacityEnd});
  --church-hero-pattern-opacity: ${patternOpacity};
  --church-hero-title-size: ${heroTitleFontSize}px;
  --church-hero-subtitle-size: ${heroSubtitleFontSize}px;
  --church-section-title-size: ${sectionTitleFontSize}px;
  --church-body-size: ${bodyFontSize}px;
  --church-page-background-image: ${cssUrl(pageBackgroundImage)};
  --church-dark-section-background-image: ${cssUrl(darkSectionBackgroundImage)};
}

body {
  background-image: var(--church-page-background-image);
  font-size: var(--church-body-size);
  background-position: center top;
  background-repeat: no-repeat;
  background-size: cover;
}
`
}

export async function ThemeStyles() {
  let settings: SiteSetting | null = null

  try {
    settings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting
  } catch (error) {
    console.error('Failed to fetch theme settings:', error)
  }

  return <style id="church-theme" dangerouslySetInnerHTML={{ __html: buildThemeCSS(settings) }} />
}
