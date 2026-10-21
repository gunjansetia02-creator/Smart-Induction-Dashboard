// HR sign-in: one shared password (HR_DASHBOARD_PASSWORD) and a signed,
// httpOnly session cookie. The cookie is `<expiry>.<hmac>`, keyed on the
// password itself, so changing the password in Vercel signs everyone out.
// Web Crypto only, so this runs in proxy.ts as well as in route handlers.

export const HR_COOKIE = 'hr_session'
export const HR_SESSION_DAYS = 30

const encoder = new TextEncoder()

async function hmac(message: string, key: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey('raw', encoder.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message))
  return Array.from(new Uint8Array(sig), b => b.toString(16).padStart(2, '0')).join('')
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export function hrPasswordMatches(given: string): boolean {
  const password = process.env.HR_DASHBOARD_PASSWORD
  return Boolean(password) && safeEqual(given, password!)
}

export async function createHrSession(): Promise<string> {
  const exp = Date.now() + HR_SESSION_DAYS * 86_400_000
  return `${exp}.${await hmac(`hr:${exp}`, process.env.HR_DASHBOARD_PASSWORD!)}`
}

// Fails closed: no password configured means nobody is signed in.
export async function isValidHrSession(cookie: string | undefined): Promise<boolean> {
  const password = process.env.HR_DASHBOARD_PASSWORD
  if (!password || !cookie) return false
  const [exp, sig] = cookie.split('.')
  if (!exp || !sig || !(Number(exp) > Date.now())) return false
  return safeEqual(sig, await hmac(`hr:${exp}`, password))
}
