'use client'

import { useEffect } from 'react'

const mappings = [
  ['primaryColor', '--preview-primary'],
  ['primaryLightColor', '--preview-primary-light'],
  ['secondaryColor', '--preview-secondary'],
  ['backgroundColor', '--preview-background'],
  ['sectionBackgroundColor', '--preview-section-bg'],
  ['darkSectionBackgroundColor', '--preview-dark-section-bg'],
  ['cardBackgroundColor', '--preview-card-bg'],
  ['textColor', '--preview-text'],
  ['mutedTextColor', '--preview-muted'],
  ['borderColor', '--preview-border'],
  ['heroOverlayColor', '--preview-hero-overlay'],
] as const

const sizeMappings = [
  ['heroTitleFontSize', '--preview-hero-title-size'],
  ['heroSubtitleFontSize', '--preview-hero-subtitle-size'],
  ['sectionTitleFontSize', '--preview-section-title-size'],
  ['bodyFontSize', '--preview-body-size'],
] as const

const imageMappings = [
  ['heroImageFile', 'clearHeroImage', '--preview-hero-bg-image'],
  ['pageBackgroundImageFile', 'clearPageBackgroundImage', '--preview-page-bg-image'],
  ['darkSectionBackgroundImageFile', 'clearDarkSectionBackgroundImage', '--preview-dark-section-bg-image'],
] as const

export function HomeVisualEditorBridge() {
  useEffect(() => {
    const form = document.getElementById('home-visual-editor') as HTMLFormElement | null
    if (!form) return

    const objectUrls = new Map<string, string>()

    const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement | null

    const apply = () => {
      mappings.forEach(([name, variable]) => {
        const value = field(name)?.value
        if (value) form.style.setProperty(variable, value)
      })

      sizeMappings.forEach(([name, variable]) => {
        const value = field(name)?.value
        if (value) form.style.setProperty(variable, `${value}px`)
      })

      const opacity = field('heroOverlayOpacity')?.value
      if (opacity) form.style.setProperty('--preview-hero-overlay-opacity', String(Number(opacity) / 100))

      form.dataset.showPattern = field('showHeroPattern')?.checked === false ? 'false' : 'true'

      imageMappings.forEach(([, clearName, variable]) => {
        if (field(clearName)?.checked) {
          form.style.setProperty(variable, 'none')
        }
      })
    }

    const applyImage = (fileName: string, clearName: string, variable: string) => {
      const input = field(fileName)
      const file = input?.files?.[0]
      if (field(clearName)?.checked) {
        form.style.setProperty(variable, 'none')
        return
      }
      if (!file) return
      const currentUrl = objectUrls.get(fileName)
      if (currentUrl) URL.revokeObjectURL(currentUrl)
      const nextUrl = URL.createObjectURL(file)
      objectUrls.set(fileName, nextUrl)
      form.style.setProperty(variable, `url("${nextUrl}")`)
    }

    form.addEventListener('input', apply)
    form.addEventListener('change', apply)
    const imageListeners = imageMappings.map(([fileName, clearName, variable]) => {
      const input = field(fileName)
      const listener = () => applyImage(fileName, clearName, variable)
      input?.addEventListener('change', listener)
      return { input, listener }
    })
    apply()

    return () => {
      form.removeEventListener('input', apply)
      form.removeEventListener('change', apply)
      imageListeners.forEach(({ input, listener }) => input?.removeEventListener('change', listener))
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  return null
}
