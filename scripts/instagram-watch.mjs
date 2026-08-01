#!/usr/bin/env node
// Watches the church's public Instagram profile for new posts without a Meta access token.
// It uses the same unauthenticated web query that the logged-out profile page uses, then
// pushes {postId, type, publishedAt} to the church site's authenticated endpoint.

import { readFileSync, writeFileSync, mkdirSync, appendFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const IG_APP_ID = '936619743392459'
const IG_USER_ID = '58190049810'
const IG_TIMELINE_DOC_ID = '7950326061742207'
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
const MAX_POSTS = 12
const PUSH_URL = 'https://www.belovedchurch.co.kr/api/instagram-push'

const SECRET_PATH = join(homedir(), '.config/instagram-watch/secret')
const STATE_PATH = join(homedir(), 'scripts/instagram-watch/state.json')
const LOG_PATH = join(homedir(), 'Library/Logs/instagram-watch.log')

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`
  mkdirSync(join(homedir(), 'Library/Logs'), { recursive: true })
  appendFileSync(LOG_PATH, line)
  process.stdout.write(line)
}

function readSecret() {
  return readFileSync(SECRET_PATH, 'utf8').trim()
}

function readState() {
  if (!existsSync(STATE_PATH)) return { postIds: [] }
  try {
    const state = JSON.parse(readFileSync(STATE_PATH, 'utf8'))
    return {
      ...state,
      postIds: Array.isArray(state.postIds) ? state.postIds : [],
    }
  } catch {
    return { postIds: [] }
  }
}

function writeState(state) {
  mkdirSync(join(homedir(), 'scripts/instagram-watch'), { recursive: true })
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2))
}

function recordFailure(error) {
  const previous = readState()
  writeState({
    ...previous,
    consecutiveFailures: (Number(previous.consecutiveFailures) || 0) + 1,
    lastError: error instanceof Error ? error.message : String(error),
    lastFailureAt: new Date().toISOString(),
  })
}

async function fetchLatestPosts() {
  const url = new URL('https://www.instagram.com/graphql/query/')
  url.searchParams.set('doc_id', IG_TIMELINE_DOC_ID)
  url.searchParams.set(
    'variables',
    JSON.stringify({
      first: MAX_POSTS,
      id: IG_USER_ID,
      include_clips_attribution_info: false,
    }),
  )

  const res = await fetch(url, {
    headers: {
      accept: '*/*',
      'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'user-agent': USER_AGENT,
      'x-ig-app-id': IG_APP_ID,
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) throw new Error(`instagram fetch failed: HTTP ${res.status}`)

  const json = await res.json()
  const edges = json?.data?.user?.edge_owner_to_timeline_media?.edges
  if (!Array.isArray(edges) || edges.length === 0) {
    throw new Error('instagram response had no posts (possible block/login-wall)')
  }

  return edges
    .map((edge) => edge?.node)
    .filter((node) => node?.shortcode)
    .map((node) => ({
      postId: node.shortcode,
      publishedAt: node.taken_at_timestamp
        ? new Date(node.taken_at_timestamp * 1000).toISOString()
        : null,
      type: node.product_type === 'clips' ? 'reel' : 'p',
    }))
    .sort((a, b) => Date.parse(b.publishedAt ?? 0) - Date.parse(a.publishedAt ?? 0))
    .slice(0, MAX_POSTS)
}

async function pushPosts(secret, posts) {
  const res = await fetch(PUSH_URL, {
    body: JSON.stringify({ posts }),
    headers: {
      authorization: `Bearer ${secret}`,
      'content-type': 'application/json',
    },
    method: 'POST',
    signal: AbortSignal.timeout(15000),
  })

  const body = await res.text()
  if (!res.ok) throw new Error(`push failed: HTTP ${res.status} ${body}`)
  return body
}

async function main() {
  const posts = await fetchLatestPosts()
  const currentIds = posts.map((post) => post.postId)

  const previous = readState()
  const unchanged =
    previous.postIds.length === currentIds.length &&
    previous.postIds.every((id, i) => id === currentIds[i])

  if (unchanged) {
    log(`no change (${currentIds.length} posts, newest ${currentIds[0]})`)
    return
  }

  const secret = readSecret()
  const responseBody = await pushPosts(secret, posts)
  writeState({
    consecutiveFailures: 0,
    lastSuccessAt: new Date().toISOString(),
    postIds: currentIds,
    updatedAt: new Date().toISOString(),
  })
  log(`pushed ${posts.length} posts (newest ${currentIds[0]}) -> ${responseBody}`)
}

main().catch((error) => {
  recordFailure(error)
  log(`ERROR: ${error.message}`)
  process.exitCode = 1
})
