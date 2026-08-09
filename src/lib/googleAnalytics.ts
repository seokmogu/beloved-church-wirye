import 'server-only'

type MetricValue = { value?: string | null }

type RunReportResponse = {
  rows?: Array<{
    metricValues?: MetricValue[]
  }>
}

export type GoogleAnalyticsSummary =
  | {
      status: 'ready'
      activeUsers: number
      clicks: number
      leadConversions: number
      newcomerPageViews: number
      pageViews: number
    }
  | {
      status: 'not-configured' | 'unavailable'
    }

const analyticsScope = 'https://www.googleapis.com/auth/analytics.readonly'
const dateRanges = [{ endDate: 'today', startDate: '28daysAgo' }]

function getMetricValue(data: RunReportResponse, index = 0) {
  const value = data.rows?.[0]?.metricValues?.[index]?.value
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : 0
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

    const [overview, clicks, leadConversions, newcomerPageViews] = await Promise.all([
      runReport(accessToken, {
        dateRanges,
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
      }),
      runReport(accessToken, {
        dateRanges,
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            stringFilter: { matchType: 'EXACT', value: 'ui_click' },
          },
        },
        metrics: [{ name: 'eventCount' }],
      }),
      runReport(accessToken, {
        dateRanges,
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            stringFilter: { matchType: 'EXACT', value: 'generate_lead' },
          },
        },
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
    ])

    return {
      activeUsers: getMetricValue(overview, 1),
      clicks: getMetricValue(clicks),
      leadConversions: getMetricValue(leadConversions),
      newcomerPageViews: getMetricValue(newcomerPageViews),
      pageViews: getMetricValue(overview),
      status: 'ready',
    }
  } catch {
    return { status: 'unavailable' }
  }
}

export { analyticsScope }
