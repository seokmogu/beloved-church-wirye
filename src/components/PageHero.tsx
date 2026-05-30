import type { ReactNode } from 'react'

export interface PageHeroProps {
  /** English label shown above the title (e.g., "WEEKLY BULLETIN") */
  label: string
  /** Main title (e.g., "주보") */
  title: string
  /** Subtitle or description text */
  subtitle: string
  /** Additional className for custom styling */
  className?: string
  /** Children to render after the default content */
  children?: ReactNode
}

/**
 * Reusable page hero section with gradient background and decorative patterns.
 * Used across bulletin, announcement, and other top-level pages.
 */
export function PageHero({ label, title, subtitle, className = '', children }: PageHeroProps) {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-dark py-12 md:py-16 ${className}`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="container relative z-10 min-w-0 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-secondary [overflow-wrap:anywhere] md:text-lg md:tracking-[0.2em]">
          {label}
        </p>
        <h1 className="text-3xl font-bold leading-tight text-white [overflow-wrap:anywhere] md:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-2 max-w-3xl font-medium leading-relaxed text-white/80 [overflow-wrap:anywhere]">
          {subtitle}
        </p>
        {children}
      </div>
    </div>
  )
}
