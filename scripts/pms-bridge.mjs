#!/usr/bin/env node
/**
 * PMS Bridge — runs locally on the Koenig network (Task Scheduler / PM2)
 * Polls PMS every 30 minutes for today's new joiners and POSTs to the
 * Vercel webhook, which then sends the welcome email + Teams invite.
 *
 * Requires these environment variables to be set (e.g. via .env.local
 * loaded through `node --env-file=.env.local scripts/pms-bridge.mjs`):
 *   PMS_API_KEY, PMS_USERNAME, PMS_PASSWORD, PMS_ROLE, WEBHOOK_SECRET
 *
 * Usage:
 *   node --env-file=.env.local scripts/pms-bridge.mjs           # run once
 *   node --env-file=.env.local scripts/pms-bridge.mjs --watch   # poll every 30 min
 */

const PMS_BASE     = 'https://api.koenig-solutions.com'
const PMS_API_KEY  = process.env.PMS_API_KEY
const PMS_USERNAME = process.env.PMS_USERNAME
const PMS_PASSWORD = process.env.PMS_PASSWORD
const PMS_ROLE     = process.env.PMS_ROLE

const WEBHOOK_URL    = process.env.DASHBOARD_URL ? `${process.env.DASHBOARD_URL}/api/webhook/new-joiner` : 'https://induction-dashboard.vercel.app/api/webhook/new-joiner'
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

if (!PMS_API_KEY || !PMS_USERNAME || !PMS_PASSWORD || !PMS_ROLE || !WEBHOOK_SECRET) {
  console.error('Missing required env vars: PMS_API_KEY, PMS_USERNAME, PMS_PASSWORD, PMS_ROLE, WEBHOOK_SECRET')
  process.exit(1)
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function todayIST() {
  const now = new Date()
  const ist = new Date(now.getTime() + (5 * 60 + 30) * 60 * 1000)
  return ist.toISOString().substring(0, 10)
}

function parseDOJ(doj) {
  if (!doj) return null
  if (/^\d{4}-\d{2}-\d{2}/.test(doj)) return new Date(doj.substring(0, 10))
  const parts = doj.split(/[\/\-]/)
  if (parts.length === 3 && parts[2].length === 4)
    return new Date(`${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`)
  return null
}

// ── PMS API calls ─────────────────────────────────────────────────────────────

async function getTokens() {
  const res = await fetch(`${PMS_BASE}/api/Kites/Operator/GetToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userName: PMS_USERNAME, userPassword: PMS_PASSWORD, userRole: PMS_ROLE }),
  })
  const data = await res.json()
  if (data.statuscode !== 200) throw new Error(`Token error: ${data.message}`)
  return data.content
}

async function fetchTodaysJoiners() {
  const { accessToken, deviceToken } = await getTokens()

  const url = `${PMS_BASE}/api/Kites/Operator/common?apikey=${PMS_API_KEY}&accessToken=${encodeURIComponent(accessToken)}&deviceToken=${encodeURIComponent(deviceToken)}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ EmpCode: '', PIPStatus: '', SearchName: '', SearchLinkedIn: '', SearchPhone: '' }),
  })

  const data = await res.json()
  if (data.statuscode !== 200) throw new Error(`Employee fetch error: ${data.message}`)

  const employees = typeof data.content === 'string' ? JSON.parse(data.content) : (data.content ?? [])
  const today = todayIST()

  return employees.filter(emp => {
    const doj = parseDOJ(emp['DOJ'])
    return doj && doj.toISOString().substring(0, 10) === today
  })
}

// ── Webhook trigger ───────────────────────────────────────────────────────────

async function triggerOnboarding(pmsJoiners) {
  const joiners = pmsJoiners
    .map(j => ({
      name:       j['Name']         ?? 'New Joiner',
      email:      j['Office Email'] ?? j['Personal Email'] ?? null,
      department: j['Department']   ?? undefined,
    }))
    .filter(j => {
      if (!j.email) { console.log(`⚠  Skipped ${j.name} — no email in PMS`); return false }
      return true
    })

  if (joiners.length === 0) return

  // Send ALL joiners in one request — one shared meeting for the batch
  const res = await fetch(WEBHOOK_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${WEBHOOK_SECRET}`,
    },
    body: JSON.stringify({ joiners }),
  })

  const result = await res.json()
  console.log(`✓  ${joiners.length} joiner(s) processed — 1 shared meeting`)
  console.log('   ', JSON.stringify(result, null, 2))
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  console.log(`[${new Date().toLocaleString('en-IN')}] Checking PMS for today's joiners...`)

  const joiners = await fetchTodaysJoiners()

  if (joiners.length === 0) {
    console.log('  No new joiners today.')
    return
  }

  console.log(`  Found ${joiners.length} new joiner(s) — sending as one batch...`)
  await triggerOnboarding(joiners)
}

const watch = process.argv.includes('--watch')

if (watch) {
  console.log('Running in watch mode — polling every 30 minutes...')
  run().catch(console.error)
  setInterval(() => run().catch(console.error), 30 * 60 * 1000)
} else {
  run().catch(err => { console.error(err); process.exit(1) })
}
