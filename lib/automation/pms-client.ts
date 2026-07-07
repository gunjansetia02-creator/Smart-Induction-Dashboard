const PMS_BASE     = 'https://api.koenig-solutions.com'
const PMS_API_KEY  = process.env.PMS_API_KEY
const PMS_USERNAME = process.env.PMS_USERNAME
const PMS_PASSWORD = process.env.PMS_PASSWORD
const PMS_ROLE     = process.env.PMS_ROLE
const TEST_MODE    = process.env.PMS_TEST_MODE === 'true' // Enable with PMS_TEST_MODE=true

function requireCredentials() {
  if (!PMS_API_KEY || !PMS_USERNAME || !PMS_PASSWORD || !PMS_ROLE) {
    throw new Error('PMS credentials missing: set PMS_API_KEY, PMS_USERNAME, PMS_PASSWORD, PMS_ROLE in your environment.')
  }
}

export interface PMSEmployee {
  'Emp Code':               string | null
  'Name':                   string | null
  'Designation':            string | null
  'DOJ':                    string | null
  'LinkedIn Profile':       string | null
  'LinkedIn ID':            string | null
  'Phone':                  string | null
  'Personal Email':         string | null
  'Office Email':           string | null
  'PIP Status':             string | null
  'Role':                   string | null
  'Reporting Manager':      string | null
  'Reporting Manager Email':string | null
  'Department':             string | null
  'Base Location':          string | null
  'UAN':                    string | null
}

interface TokenContent {
  accessToken: string
  deviceToken: string
  Username:    string
  Role:        string
}

async function getTokens(): Promise<TokenContent> {
  requireCredentials()
  console.log('[PMS] Requesting token with retry logic...')

  const maxRetries = 3
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${PMS_BASE}/api/Kites/Operator/GetToken`, {
        method:  'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'Koenig-Induction-Dashboard/1.0'
        },
        body: JSON.stringify({
          userName:     PMS_USERNAME,
          userPassword: PMS_PASSWORD,
          userRole:     PMS_ROLE,
        }),
      })

      if (!res.ok) {
        console.warn(`[PMS] Token request failed (attempt ${attempt}/${maxRetries}): HTTP ${res.status}`)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          continue
        }
        throw new Error(`PMS token request failed: ${res.status}`)
      }

      const data = await res.json()
      if (data.statuscode !== 200) {
        console.warn(`[PMS] Token error (attempt ${attempt}/${maxRetries}): ${data.message}`)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          continue
        }
        throw new Error(`PMS token error: ${data.message}`)
      }

      console.log('[PMS] Token received successfully')
      return data.content as TokenContent
    } catch (error) {
      if (attempt === maxRetries) throw error
      console.warn(`[PMS] Retry attempt ${attempt + 1}/${maxRetries}`)
    }
  }
  
  throw new Error('PMS token failed after all retries')
}

export async function fetchAllEmployees(): Promise<PMSEmployee[]> {
  try {
    console.log('[PMS] Fetching all employees...')
    
    // TEST MODE: Use simulated response
    if (TEST_MODE) {
      console.log('[PMS] TEST MODE ENABLED - Using simulated employee data')
      const testRes = await fetch('http://localhost:3000/api/test-pms-success')
      const testData = await testRes.json()
      
      const employees = testData.data.map((emp: any) => ({
        'Emp Code': emp.EmpCode,
        'Name': `${emp.FirstName} ${emp.LastName}`,
        'Designation': 'Employee',
        'DOJ': emp.DOJ,
        'Department': emp.DeptName,
        'Phone': emp.Phone,
        'Office Email': emp.Email,
        'Personal Email': emp.Email,
      }))
      
      console.log(`[PMS] TEST MODE - Loaded ${employees.length} test employees`)
      return employees
    }
    
    const { accessToken, deviceToken } = await getTokens()

    const url = `${PMS_BASE}/api/Kites/Operator/common?apikey=${PMS_API_KEY}&accessToken=${encodeURIComponent(accessToken)}&deviceToken=${encodeURIComponent(deviceToken)}`

    const res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        EmpCode:       '',
        PIPStatus:     '',
        SearchName:    '',
        SearchLinkedIn:'',
        SearchPhone:   '',
      }),
    })

    if (!res.ok) throw new Error(`PMS employee fetch failed: ${res.status}`)

    const data = await res.json()
    if (data.statuscode !== 200) throw new Error(`PMS employee error: ${data.message}`)

    // PMS returns content as a JSON string, not a parsed array
    const raw = data.content ?? '[]'
    const employees: PMSEmployee[] = typeof raw === 'string' ? JSON.parse(raw) : raw
    console.log(`[PMS] Fetched ${employees.length} employees successfully`)
    return employees
  } catch (error) {
    console.error('[PMS] Error fetching employees:', error instanceof Error ? error.message : String(error))
    throw error
  }
}

// Parse DOJ from Indian format DD/MM/YYYY, DD-MM-YYYY, or ISO YYYY-MM-DD
export function parseDOJ(doj: string | null): Date | null {
  if (!doj) return null

  // ISO: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  if (/^\d{4}-\d{2}-\d{2}/.test(doj)) {
    return new Date(doj.substring(0, 10))
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const parts = doj.split(/[\/\-]/)
  if (parts.length === 3 && parts[2].length === 4) {
    return new Date(`${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`)
  }

  return null
}

// Return today's date in IST as YYYY-MM-DD string
export function todayIST(): string {
  // IST = UTC + 5:30
  const now = new Date()
  const ist = new Date(now.getTime() + (5 * 60 + 30) * 60 * 1000)
  return ist.toISOString().substring(0, 10)
}

export function filterTodaysJoiners(employees: PMSEmployee[]): PMSEmployee[] {
  const today = todayIST()
  return employees.filter(emp => {
    const doj = parseDOJ(emp['DOJ'])
    if (!doj) return false
    return doj.toISOString().substring(0, 10) === today
  })
}
