// Microsoft Graph API client — authenticated via client credentials (app-only)
// Requires Azure AD app registration with Mail.Send + Calendars.ReadWrite permissions

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0'

async function getAccessToken(): Promise<string> {
  const tenantId     = process.env.GRAPH_TENANT_ID!
  const clientId     = process.env.GRAPH_CLIENT_ID!
  const clientSecret = process.env.GRAPH_CLIENT_SECRET!

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'client_credentials',
        client_id:     clientId,
        client_secret: clientSecret,
        scope:         'https://graph.microsoft.com/.default',
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Graph token error: ${err}`)
  }

  const data = await res.json()
  return data.access_token as string
}

export async function graphPost(path: string, body: unknown): Promise<Response> {
  const token = await getAccessToken()
  return fetch(`${GRAPH_BASE}${path}`, {
    method:  'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

export async function graphPatch(path: string, body: unknown): Promise<Response> {
  const token = await getAccessToken()
  return fetch(`${GRAPH_BASE}${path}`, {
    method:  'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

export async function graphGet(path: string): Promise<Response> {
  const token = await getAccessToken()
  return fetch(`${GRAPH_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}
