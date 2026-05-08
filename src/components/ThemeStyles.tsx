import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Media, SiteSetting } from '@/payload-types'

const defaultTheme = {
  backgroundColor: '#f7f8f6',
  borderColor: '#d9ded6',
  cardBackgroundColor: '#ffffff',
  darkSectionBackgroundColor: '#143c2e',
  footerBackgroundColor: '#143c2e',
  headerBackgroundColor: '#123125',
  heroOverlayColor: '#0a1c15',
  heroOverlayOpacity: 82,
  mutedTextColor: '#5d675f',
  primaryColor: '#123125',
  primaryLightColor: '#1c4938',
  secondaryColor: '#f3ead6',
  sectionBackgroundColor: '#f7f8f6',
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
  const numberValue = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numberValue)) return fallback
  return Math.min(100, Math.max(0, numberValue))
}

function getMediaUrl(media: Media | number | null | undefined): string | null {
  return media && typeof media === 'object' && media.url ? media.url : null
}

function cssUrl(url: string | null): string {
  if (!url) return 'none'
  return `url(${JSON.stringify(url)})`
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
  --church-page-background-image: ${cssUrl(pageBackgroundImage)};
  --church-dark-section-background-image: ${cssUrl(darkSectionBackgroundImage)};
}

body {
  background-image: var(--church-page-background-image);
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
