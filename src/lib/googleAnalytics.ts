import 'server-only'

type MetricValue = { value?: string | null }
type DimensionValue = { value?: string | null }
type ReportRow = {
  dimensionValues?: DimensionValue[]
  metricValues?: MetricValue[]
}

type RunReportResponse = {
  rows?: ReportRow[]
}

export type GoogleAnalyticsFunnel = {
  formStarts: number
  landingPageViews: number
  leadConversions: number
  newcomerCtaClicks: number
  newcomerPageViews: number
}

export type GoogleAnalyticsAcquisitionChannel = {
  activeUsers: number
  leadConversions: number
  name: string
  sessions: number
}

export type GoogleAnalyticsSummary =
  | {
      status: 'ready'
      activeUsers: number
      acquisitionChannels: GoogleAnalyticsAcquisitionChannel[]
      clicks: number
      funnel: GoogleAnalyticsFunnel
      leadConversions: number
      newcomerPageViews: number
      pageViews: number
    }
  | {
      status: 'not-configured' | 'unavailable'
    }

const analyticsScope = 'https://www.googleapis.com/auth/analytics.readonly'
const dateRanges = [{ endDate: 'today', startDate: '28daysAgo' }]
const funnelEventNames = [
  'landing_page_view',
  'newcomer_cta_click',
  'form_start',
  'generate_lead',
] as const

function getMetricValue(data: RunReportResponse, index = 0) {
  const value = data.rows?.[0]?.metricValues?.[index]?.value
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : 0
}

function getDimensionValue(row: ReportRow, index = 0) {
  return row.dimensionValues?.[index]?.value || ''
}

function eventCountByName(data: RunReportResponse) {
  return new Map(
    (data.rows ?? []).map((row) => [getDimensionValue(row), getMetricValue({ rows: [row] })]),
  )
}

function eventNameFilter(value: string) {
  return {
    filter: {
      fieldName: 'eventName',
      stringFilter: { matchType: 'EXACT', value },
    },
  }
}

async function getAccessToken() {
  const clientId = process.env.GOOGLE_ANALYTICS_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_ANALYTICS_OAUTH_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_ANALYTICS_OAUTH_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) return null

  const response = await fetch('https://oauth2.googleapis.com/token', {
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    cache: 'no-store',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    method: 'POST',
  })

  if (!response.ok) throw new Error('Google Analytics OAuth token refresh failed')

  const data = (await response.json()) as { access_token?: string }
  if (!data.access_token) throw new Error('Google Analytics OAuth access token missing')

  return data.access_token
}

async function runReport(accessToken: string, body: Record<string, unknown>) {
  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID
  if (!propertyId) throw new Error('Google Analytics property ID missing')

  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`,
    {
      body: JSON.stringify(body),
      cache: 'no-store',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      method: 'POST',
    },
  )

  if (!response.ok) throw new Error('Google Analytics Data API request failed')

  return (await response.json()) as RunReportResponse
}

export async function getGoogleAnalyticsSummary(): Promise<GoogleAnalyticsSummary> {
  if (
    !process.env.GOOGLE_ANALYTICS_PROPERTY_ID ||
    !process.env.GOOGLE_ANALYTICS_OAUTH_CLIENT_ID ||
    !process.env.GOOGLE_ANALYTICS_OAUTH_CLIENT_SECRET ||
    !process.env.GOOGLE_ANALYTICS_OAUTH_REFRESH_TOKEN
  ) {
    return { status: 'not-configured' }
  }

  try {
    const accessToken = await getAccessToken()
    if (!accessToken) return { status: 'not-configured' }

    const [overview, clicks, newcomerPageViews, funnelEvents, acquisitionChannels, channelLeads] =
      await Promise.all([
        runReport(accessToken, {
          dateRanges,
          metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
        }),
        runReport(accessToken, {
          dateRanges,
          dimensionFilter: eventNameFilter('ui_click'),
          metrics: [{ name: 'eventCount' }],
        }),
        runReport(accessToken, {
          dateRanges,
          dimensionFilter: {
            filter: {
              fieldName: 'pagePath',
              stringFilter: { matchType: 'EXACT', value: '/newcomer' },
            },
          },
          metrics: [{ name: 'screenPageViews' }],
        }),
        runReport(accessToken, {
          dateRanges,
          dimensionFilter: {
            filter: {
              fieldName: 'eventName',
              inListFilter: { caseSensitive: true, values: [...funnelEventNames] },
            },
          },
          dimensions: [{ name: 'eventName' }],
          metrics: [{ name: 'eventCount' }],
        }),
        runReport(accessToken, {
          dateRanges,
          dimensions: [{ name: 'sessionDefaultChannelGroup' }],
          limit: 6,
          metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
          orderBys: [{ desc: true, metric: { metricName: 'sessions' } }],
        }),
        runReport(accessToken, {
          dateRanges,
          dimensionFilter: eventNameFilter('generate_lead'),
          dimensions: [{ name: 'sessionDefaultChannelGroup' }],
          metrics: [{ name: 'eventCount' }],
        }),
      ])

    const funnelCounts = eventCountByName(funnelEvents)
    const leadsByChannel = eventCountByName(channelLeads)
    const channels = (acquisitionChannels.rows ?? []).map((row) => {
      const name = getDimensionValue(row) || 'Unassigned'

      return {
        activeUsers: getMetricValue({ rows: [row] }, 1),
        leadConversions: leadsByChannel.get(name) ?? 0,
        name,
        sessions: getMetricValue({ rows: [row] }),
      }
    })

    const leadConversions = funnelCounts.get('generate_lead') ?? 0
    const newcomerViews = getMetricValue(newcomerPageViews)

    return {
      activeUsers: getMetricValue(overview, 1),
      acquisitionChannels: channels,
      clicks: getMetricValue(clicks),
      funnel: {
        formStarts: funnelCounts.get('form_start') ?? 0,
        landingPageViews: funnelCounts.get('landing_page_view') ?? 0,
        leadConversions,
        newcomerCtaClicks: funnelCounts.get('newcomer_cta_click') ?? 0,
        newcomerPageViews: newcomerViews,
      },
      leadConversions,
      newcomerPageViews: newcomerViews,
      pageViews: getMetricValue(overview),
      status: 'ready',
    }
  } catch {
    return { status: 'unavailable' }
  }
}

export { analyticsScope }
