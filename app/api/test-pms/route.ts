export async function GET() {
  const PMS_BASE = 'https://api.koenig-solutions.com'
  const PMS_USERNAME = process.env.PMS_USERNAME
  const PMS_PASSWORD = process.env.PMS_PASSWORD
  const PMS_ROLE = process.env.PMS_ROLE
  const PMS_API_KEY = process.env.PMS_API_KEY

  if (!PMS_USERNAME || !PMS_PASSWORD || !PMS_ROLE || !PMS_API_KEY) {
    return Response.json({ success: false, error: 'PMS credentials missing from environment' }, { status: 500 })
  }

  console.log('[TEST-PMS] Testing PMS API connection...')
  console.log('[TEST-PMS] Username:', PMS_USERNAME)
  console.log('[TEST-PMS] Role:', PMS_ROLE)
  console.log('[TEST-PMS] API Key raw:', JSON.stringify(PMS_API_KEY))

  try {
    const tokenUrl = `${PMS_BASE}/api/Kites/Operator/GetToken`
    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: PMS_USERNAME, userPassword: PMS_PASSWORD, userRole: PMS_ROLE }),
    })
    const tokenData = await tokenRes.json()
    console.log('[TEST-PMS] Token response:', JSON.stringify(tokenData))

    if (tokenData.statuscode !== 200) {
      return Response.json({ success: false, step: 'token', data: tokenData })
    }

    const { accessToken, deviceToken } = tokenData.content
    const empUrl = `${PMS_BASE}/api/Kites/Operator/common?apikey=${PMS_API_KEY}&accessToken=${encodeURIComponent(accessToken)}&deviceToken=${encodeURIComponent(deviceToken)}`
    console.log('[TEST-PMS] Employee fetch URL:', empUrl)

    const empRes = await fetch(empUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ EmpCode: '', PIPStatus: '', SearchName: '', SearchLinkedIn: '', SearchPhone: '' }),
    })
    const empText = await empRes.text()
    console.log('[TEST-PMS] Employee fetch status:', empRes.status)
    console.log('[TEST-PMS] Employee fetch body (first 500 chars):', empText.slice(0, 500))

    return Response.json({
      success: empRes.ok,
      step: 'employee-fetch',
      status: empRes.status,
      bodyPreview: empText.slice(0, 300),
    })
  } catch (error) {
    console.error('[TEST-PMS] Error:', error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
