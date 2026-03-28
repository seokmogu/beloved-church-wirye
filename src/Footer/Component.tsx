import Link from 'next/link'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'

export async function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-[#1B3A2D] text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Church info */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <h3 className="text-xl font-bold">사랑하는교회</h3>
              <p className="text-white/60 text-sm">Beloved Church Wirye</p>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed">
              위례사업소 3길 21-4
              <br />
              (BELOVED LOUNGE)
            </p>
          </div>

          {/* Worship schedule */}
          <div>
            <h4 className="font-semibold text-[#C9A84C] mb-4">예배 안내</h4>
            <div className="space-y-2 text-sm text-white/70">
              <div className="flex justify-between max-w-[200px]">
                <span>주일예배</span>
                <span className="text-white">12:00</span>
              </div>
              <div className="flex justify-between max-w-[200px]">
                <span>저녁예배</span>
                <span className="text-white">20:00</span>
              </div>
            </div>
          </div>

          {/* Social links */}
          <div>
            <h4 className="font-semibold text-[#C9A84C] mb-4">소셜 미디어</h4>
            <div className="flex flex-col gap-3 text-sm">
              <a
                href="https://www.youtube.com/@BelovedChurchWirye"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                @BelovedChurchWirye
              </a>
              <a
                href="https://www.instagram.com/beloved_ch_/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                @beloved_ch_
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs">
            &copy; {new Date().getFullYear()} 사랑하는교회. All rights reserved.
          </p>
          <ThemeSelector />
        </div>
      </div>
    </footer>
  )
}
