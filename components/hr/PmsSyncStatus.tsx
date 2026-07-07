'use client'

import { useState } from 'react'

export function PmsSyncStatus({ live, error }: { live?: boolean; error?: string } = {}) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/sync-pms-data', { method: 'POST' })
      const data = await response.json()
      
      setSyncResult({
        success: response.ok,
        message: data.message || data.error || 'Sync completed'
      })
      
      // Auto-refresh after successful sync
      if (response.ok) {
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (error) {
      setSyncResult({
        success: false,
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const boxClass = live
    ? 'mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'
    : 'mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg'
  const textClass = live ? 'text-[12px] text-blue-900' : 'text-[12px] text-amber-900'

  return (
    <div className={boxClass}>
      <div className="flex items-center justify-between">
        <div className={textClass}>
          <strong>PMS Integration Status:</strong>
          {' '}
          {live ? (
            <span>✅ Connected to PMS! Displaying real employee data from your payroll system.</span>
          ) : (
            <span>⚠️ Could not reach PMS API — showing fallback demo data.{error ? ` (${error})` : ''}</span>
          )}
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="px-3 py-1.5 text-[11px] font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition-colors"
        >
          {isSyncing ? 'Syncing...' : 'Sync PMS Data'}
        </button>
      </div>
      {syncResult && (
        <div className={`mt-2 text-[11px] ${syncResult.success ? 'text-green-700' : 'text-red-700'}`}>
          {syncResult.message}
        </div>
      )}
    </div>
  )
}
