import type { Metadata } from 'next'

export function canonicalAlternates(pathname: string): Metadata['alternates'] {
  const normalizedPath =
    pathname === '/' ? '/' : `/${pathname.split('/').filter(Boolean).join('/')}`

  return { canonical: normalizedPath }
}
