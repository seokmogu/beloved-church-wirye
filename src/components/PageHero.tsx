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
      className={`relative bg-gradient-to-br from-primary via-primary to-primary-dark py-16 overflow-hidden ${className}`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="container text-center relative z-10">
        <p className="text-secondary text-base md:text-lg font-semibold tracking-[0.2em] uppercase mb-3">
          {label}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
        <p className="text-white/80 font-medium mt-2">{subtitle}</p>
        {children}
      </div>
    </div>
  )
}
