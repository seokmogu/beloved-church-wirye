import Link from 'next/link'

import type { Footer as FooterType, SiteSetting } from '@/payload-types'
import { Logo } from '@/components/Logo/Logo'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { hasPayloadRuntimeConfig } from '@/utilities/payloadRuntime'
import { resolveCMSLink } from '@/utilities/resolveCMSLink'

function lines(value?: string | null): string[] {
  return (value ?? '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function Footer() {
  let footer: FooterType = { id: 0, navItems: [] }
  let settings: SiteSetting | null = null

  if (hasPayloadRuntimeConfig()) {
    try {
      ;[footer, settings] = await Promise.all([
        getCachedGlobal('footer', 1)() as Promise<FooterType>,
        getCachedGlobal('site-settings', 1)() as Promise<SiteSetting>,
      ])
    } catch (error) {
      console.error('Failed to fetch footer globals:', error)
    }
  }

  const logo = settings?.logo
  const logoUrl = typeof logo === 'object' && logo?.url ? logo.url : undefined
  const churchName = settings?.churchName ?? '사랑하는교회'
  const englishName = settings?.englishName ?? 'Beloved Church Wirye'
  const addressLines = lines(footer?.address) || []
  const scheduleLines = lines(footer?.worshipSchedule)
  const legalText = footer?.legalText ?? 'All rights reserved.'
  const navItems = footer?.navItems ?? []

  const socialLinks = [
    settings?.youtubeChannelUrl
      ? { href: settings.youtubeChannelUrl, label: 'YouTube', value: settings.youtubeChannelUrl }
      : null,
    settings?.instagramUrl
      ? {
          href: settings.instagramUrl,
          label: 'Instagram',
          value: settings.instagramHandle ?? settings.instagramUrl,
        }
      : null,
  ].filter(Boolean) as { href: string; label: string; value: string }[]

  return (
    <footer
      className="mt-auto border-t border-border text-white"
      style={{ backgroundColor: 'var(--church-footer-bg)' }}
    >
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.15fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="inline-flex flex-col gap-3 hover:opacity-85 transition-opacity"
            >
              <Logo alt={churchName} src={logoUrl} />
              <span>
                <span className="block text-xl font-bold">{churchName}</span>
                <span className="block text-sm text-white/60">{englishName}</span>
              </span>
            </Link>

            {addressLines.length > 0 && (
              <address className="mt-5 not-italic text-sm leading-relaxed text-white/70">
                {addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            )}

            {footer?.churchPhone && (
              <p className="mt-3 text-sm text-white/70">{footer.churchPhone}</p>
            )}
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-secondary">예배안내</h4>
            <div className="space-y-2 text-sm text-white/70">
              {scheduleLines.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-secondary">링크</h4>
            <div className="flex flex-col gap-2 text-sm">
              {navItems.map((item, index) => {
                const resolved = resolveCMSLink(item.link)
                if (!resolved) return null
                const newTabProps = resolved.newTab
                  ? { rel: 'noopener noreferrer', target: '_blank' }
                  : {}

                return (
                  <Link
                    key={index}
                    href={resolved.href}
                    className="text-white/70 hover:text-white transition-colors"
                    {...newTabProps}
                  >
                    {resolved.label}
                  </Link>
                )
              })}

              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {item.label} · {item.value}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/45">
            &copy; {new Date().getFullYear()} {churchName}. {legalText}
          </p>
          {footer?.showThemeSelector !== false && <ThemeSelector />}
        </div>
      </div>
    </footer>
  )
}
