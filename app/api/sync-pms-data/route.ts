import { fetchAllEmployees, parseDOJ } from '@/lib/automation/pms-client'
import { writeFileSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'

const CACHE_FILE = join(process.cwd(), '.pms-cache.json')
const CACHE_TTL = 3600000 // 1 hour

interface CachedData {
  timestamp: number
  employees: any[]
}

function saveCacheFile(data: any) {
  try {
    const cacheData: CachedData = {
      timestamp: Date.now(),
      employees: data
    }
    writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2))
    console.log('[SYNC] PMS data cached successfully')
  } catch (error) {
    console.error('[SYNC] Failed to save cache file:', error)
  }
}

function loadCacheFile(): CachedData | null {
  try {
    if (!existsSync(CACHE_FILE)) return null
    
    const content = readFileSync(CACHE_FILE, 'utf-8')
    const data = JSON.parse(content) as CachedData
    
    // Check if cache is still valid
    if (Date.now() - data.timestamp > CACHE_TTL) {
      console.log('[SYNC] Cache expired')
      return null
    }
    
    console.log(`[SYNC] Loaded ${data.employees.length} employees from cache`)
    return data
  } catch (error) {
    console.error('[SYNC] Failed to load cache file:', error)
    return null
  }
}

export async function POST() {
  try {
    console.log('[SYNC] Starting PMS data sync...')
    
    // Try to fetch from PMS
    try {
      const employees = await fetchAllEmployees()
      
      if (employees.length > 0) {
        saveCacheFile(employees)
        console.log(`[SYNC] Successfully fetched and cached ${employees.length} employees`)
        
        return Response.json({
          success: true,
          message: `Synced ${employees.length} employees from PMS`,
          count: employees.length,
          source: 'live-pms',
          timestamp: new Date().toISOString()
        })
      }
    } catch (pmsError) {
      console.warn('[SYNC] PMS API call failed, checking cache...')
      
      // Fallback to cached data
      const cached = loadCacheFile()
      if (cached) {
        return Response.json({
          success: true,
          message: `Using cached data (${cached.employees.length} employees)`,
          count: cached.employees.length,
          source: 'cache',
          timestamp: new Date(cached.timestamp).toISOString(),
          warning: 'PMS API unreachable, using cached data'
        })
      }
      
      // No cache and PMS failed - return helpful error
      const errorMsg = pmsError instanceof Error ? pmsError.message : String(pmsError)
      console.log('[SYNC] No cache available, returning error details')
      
      return Response.json(
        {
          success: false,
          message: 'PMS API is currently unreachable',
          error: errorMsg,
          solution: errorMsg.includes('Permission') 
            ? 'Your server IP needs to be whitelisted in PMS admin settings. See PMS_INTEGRATION_GUIDE.md for details.'
            : 'Check PMS API credentials and connectivity.',
          status: 'pending-ip-whitelist'
        },
        { status: 503 } // Service Unavailable - temporary
      )
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[SYNC] Unexpected error:', errorMsg)
    
    return Response.json(
      {
        success: false,
        message: 'Sync failed with unexpected error',
        error: errorMsg,
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Check cache first
    const cached = loadCacheFile()
    if (cached) {
      return Response.json({
        success: true,
        source: 'cache',
        count: cached.employees.length,
        timestamp: new Date(cached.timestamp).toISOString(),
        employees: cached.employees
      })
    }
    
    // Try live PMS API
    console.log('[SYNC] No cache found, fetching from PMS...')
    const employees = await fetchAllEmployees()
    saveCacheFile(employees)
    
    return Response.json({
      success: true,
      source: 'live-pms',
      count: employees.length,
      timestamp: new Date().toISOString(),
      employees
    })
  } catch (error) {
    console.error('[SYNC] GET request failed:', error)
    
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
