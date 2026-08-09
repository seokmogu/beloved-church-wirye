import crypto from 'node:crypto'
import fs from 'node:fs'
import http from 'node:http'

const [credentialsPath, refreshTokenPath] = process.argv.slice(2)
const redirectUri = 'http://localhost:3818/google-analytics-callback'

if (!credentialsPath || !refreshTokenPath) {
  throw new Error('Usage: node scripts/authorize-google-analytics.mjs <oauth-client-json> <refresh-token-output>')
}

const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8')).web
const state = crypto.randomBytes(24).toString('hex')
const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')

authorizationUrl.search = new URLSearchParams({
  access_type: 'offline',
  client_id: credentials.client_id,
  include_granted_scopes: 'true',
  prompt: 'consent',
  redirect_uri: redirectUri,
  response_type: 'code',
  scope: 'https://www.googleapis.com/auth/analytics.readonly',
  state,
}).toString()

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, redirectUri)

  if (requestUrl.pathname !== '/google-analytics-callback' || requestUrl.searchParams.get('state') !== state) {
    response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' })
    response.end('Invalid analytics authorization response.')
    return
  }

  const code = requestUrl.searchParams.get('code')
  if (!code) {
    response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' })
    response.end('Analytics authorization was not completed.')
    return
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      body: new URLSearchParams({
        client_id: credentials.client_id,
        client_secret: credentials.client_secret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      method: 'POST',
    })
    const token = await tokenResponse.json()

    if (!tokenResponse.ok || !token.refresh_token) throw new Error('Refresh token missing')

    fs.writeFileSync(refreshTokenPath, token.refresh_token, { mode: 0o600 })
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end('<h1>Google Analytics 연결 완료</h1><p>이 창을 닫아도 됩니다.</p>')
    server.close()
  } catch {
    response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
    response.end('Analytics authorization could not be completed.')
  }
})

server.listen(3818, '127.0.0.1', () => {
  process.stdout.write(authorizationUrl.toString())
})
