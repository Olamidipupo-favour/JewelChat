import { useState, useEffect } from 'react'
import { ApiService } from '../../services/api'
import { toast } from 'react-hot-toast'
import { Copy, RefreshCw, Trash2 } from 'lucide-react'

interface ApiKey {
  id: string
  name: string
  key: string
  created_at: string
  last_used: string | null
}

interface ApiUsage {
  id: string
  api_type: string
  tokens_used: number
  cost: number
  created_at: string
}

export default function ApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [usageLogs, setUsageLogs] = useState<ApiUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [newKeyName, setNewKeyName] = useState('')

  useEffect(() => {
    fetchApiKeys()
    fetchUsageLogs()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const { data, error } = await ApiService.getApiKeys()
      if (error) throw error
      setApiKeys(data)
    } catch (error) {
      console.error('Error fetching API keys:', error)
      toast.error('Failed to fetch API keys')
    }
  }

  const fetchUsageLogs = async () => {
    try {
      const { data, error } = await ApiService.getApiUsageLogs()
      if (error) throw error
      setUsageLogs(data)
    } catch (error) {
      console.error('Error fetching usage logs:', error)
      toast.error('Failed to fetch usage logs')
    } finally {
      setLoading(false)
    }
  }

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key')
      return
    }

    try {
      console.log('Creating API key with name:', newKeyName)
      const { data, error } = await ApiService.createApiKey(newKeyName)
      
      if (error) {
        console.error('Error details:', error)
        throw error
      }
      
      console.log('API key created successfully:', data)
      setApiKeys(prevKeys => [...prevKeys, data])
      setNewKeyName('')
      toast.success('API key created successfully')
    } catch (error) {
      console.error('Detailed error creating API key:', error)
      if (error instanceof Error) {
        toast.error(`Failed to create API key: ${error.message}`)
      } else {
        toast.error('Failed to create API key')
      }
    }
  }

  const deleteApiKey = async (keyId: string) => {
    try {
      const { error } = await ApiService.deleteApiKey(keyId)
      if (error) throw error
      setApiKeys(apiKeys.filter(key => key.id !== keyId))
      toast.success('API key deleted successfully')
    } catch (error) {
      console.error('Error deleting API key:', error)
      toast.error('Failed to delete API key')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* API Keys Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">API Keys</h2>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Enter API key name"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button
              onClick={createApiKey}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Key
            </button>
          </div>

          <div className="space-y-4">
            {apiKeys.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No API keys found. Create one to get started.</p>
            ) : (
              apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{key.name}</h3>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(key.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {key.key}
                      </code>
                      <button
                        onClick={() => copyToClipboard(key.key)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => deleteApiKey(key.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Usage Logs Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Usage Logs</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tokens Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usageLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No usage logs found.
                    </td>
                  </tr>
                ) : (
                  usageLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.api_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.tokens_used.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${log.cost.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 