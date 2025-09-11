'use client'
import { useState } from 'react'
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

export function ManualSyncButton() {
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(null)
  const [syncResult, setSyncResult] = useState(null)

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/cron/sync-data', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        setLastSync(new Date().toLocaleString())
        setSyncResult({
          type: 'success',
          message: `Successfully synced ${data.successful} stores`,
          details: data.failed > 0 ? `${data.failed} stores failed` : null
        })
        // Refresh page after a short delay to show success message
        setTimeout(() => window.location.reload(), 2000)
      } else {
        setSyncResult({
          type: 'error',
          message: data.error || 'Sync failed',
          details: null
        })
      }
    } catch (error) {
      setSyncResult({
        type: 'error',
        message: 'Network error occurred',
        details: error.message
      })
    }

    setSyncing(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Data Sync</h3>
          <p className="text-sm text-gray-600">
            Manually sync data from your Shopify store
          </p>
        </div>
        <div className="p-3 bg-blue-100 rounded-lg">
          <RefreshCw className="h-5 w-5 text-blue-600" />
        </div>
      </div>

      {lastSync && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Last sync:</strong> {lastSync}
          </p>
        </div>
      )}

      {syncResult && (
        <div className={`mb-4 p-3 rounded-lg flex items-start space-x-2 ${
          syncResult.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {syncResult.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className={`text-sm font-medium ${
              syncResult.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {syncResult.message}
            </p>
            {syncResult.details && (
              <p className={`text-xs mt-1 ${
                syncResult.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {syncResult.details}
              </p>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleSync}
        disabled={syncing}
        className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? 'Syncing Data...' : 'Sync Now'}
      </button>

      <p className="text-xs text-gray-500 mt-2 text-center">
        This will update customers, products, and orders from Shopify
      </p>
    </div>
  )
}