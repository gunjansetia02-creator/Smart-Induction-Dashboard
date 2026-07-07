export async function GET() {
  const PMS_BASE = 'https://api.koenig-solutions.com'
  const PMS_USERNAME = process.env.PMS_USERNAME
  const PMS_PASSWORD = process.env.PMS_PASSWORD
  const PMS_ROLE = process.env.PMS_ROLE

  if (!PMS_USERNAME || !PMS_PASSWORD || !PMS_ROLE) {
    return Response.json({ success: false, error: 'PMS credentials missing from environment' }, { status: 500 })
  }

  console.log('[TEST-PMS] Testing PMS API connection...')
  console.log('[TEST-PMS] Username:', PMS_USERNAME)
  console.log('[TEST-PMS] Role:', PMS_ROLE)

  try {
    const tokenUrl = `${PMS_BASE}/api/Kites/Operator/GetToken`
    console.log('[TEST-PMS] Calling:', tokenUrl)

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: PMS_USERNAME,
        userPassword: PMS_PASSWORD,
        userRole: PMS_ROLE,
      }),
    })

    console.log('[TEST-PMS] Response Status:', tokenRes.status)
    const tokenData = await tokenRes.json()
    console.log('[TEST-PMS] Response Data:', JSON.stringify(tokenData, null, 2))

    return Response.json({
      success: tokenRes.ok,
      status: tokenRes.status,
      data: tokenData,
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
