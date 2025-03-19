import { useState, useEffect } from 'react'
import { ApiService } from '../../services/api'
import { Card } from '../../components/ui/card'
import { Activity, TrendingUp, Clock, DollarSign } from 'lucide-react'

interface ApiUsageStats {
  total_requests: number
  total_tokens: number
  total_cost: number
  average_response_time: number
}

export default function ApiUsage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<ApiUsageStats>({
    total_requests: 0,
    total_tokens: 0,
    total_cost: 0,
    average_response_time: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      setLoading(true)
      const { data, error } = await ApiService.getApiUsageStats()
      if (error) throw error
      setStats(data)
    } catch (err) {
      console.error('Error fetching API usage stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch API usage stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.total_requests}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Tokens</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.total_tokens}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Avg Response Time</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.average_response_time}ms</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Cost</h3>
              <p className="text-2xl font-semibold text-gray-900">₹{stats.total_cost.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Usage by Type</h2>
        {/* Add a chart or table here to show usage by API type */}
      </Card>
    </div>
  )
} 