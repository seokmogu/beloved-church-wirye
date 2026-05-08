import canUseDOM from './canUseDOM'

export const getServerSideURL = () => {
  const url =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000')
  return url.trim()
}

export const getClientSideURL = () => {
  if (canUseDOM) {
    const protocol = window.location.protocol
    const domain = window.location.hostname
    const port = window.location.port

    return `${protocol}//${domain}${port ? `:${port}` : ''}`
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  return (process.env.NEXT_PUBLIC_SERVER_URL || '').trim()
}

export const getPayloadServerURL = () => {
  const explicitURL = process.env.PAYLOAD_SERVER_URL?.trim()

  if (explicitURL) {
    return explicitURL
  }

  return process.env.VERCEL ? getServerSideURL() : ''
}

const splitOrigins = (value?: string) =>
  value
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) || []

export const getPayloadAllowedOrigins = () => {
  const origins = new Set<string>()

  splitOrigins(process.env.NEXT_PUBLIC_SERVER_URL).forEach((origin) => origins.add(origin))
  splitOrigins(process.env.PAYLOAD_SERVER_URL).forEach((origin) => origins.add(origin))
  splitOrigins(process.env.PAYLOAD_PUBLIC_ORIGINS).forEach((origin) => origins.add(origin))

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    origins.add(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
  }

  if (!process.env.VERCEL) {
    origins.add('http://localhost:3000')
    origins.add('http://127.0.0.1:3000')
    origins.add('http://100.94.135.5:3000')
  }

  return Array.from(origins)
}
