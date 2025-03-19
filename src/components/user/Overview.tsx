import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { ApiService } from '../../services/api'
import { Card } from '../../components/ui/card'
import { Activity, CreditCard, Settings, User } from 'lucide-react'

interface Payment {
  id: string
  amount: number
  created_at: string
  status: string
}

interface Stats {
  totalTokens: number
  totalPayments: number
  lastPayment: Payment | null
}

export default function Overview() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats>({
    totalTokens: 0,
    totalPayments: 0,
    lastPayment: null,
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const data = await ApiService.getUserStats()
      setStats(data)
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Available Tokens</h3>
              <p className="text-2xl font-semibold text-gray-900">{profile?.tokens || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Payments</h3>
              <p className="text-2xl font-semibold text-gray-900">₹{stats.totalPayments}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Account Type</h3>
              <p className="text-2xl font-semibold text-gray-900 capitalize">{profile?.role || 'user'}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        {stats.lastPayment ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Last Payment</p>
                <p className="text-sm text-gray-500">
                  {new Date(stats.lastPayment.created_at).toLocaleDateString()}
                </p>
              </div>
              <p className="text-sm font-medium text-green-600">
                ₹{stats.lastPayment.amount}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No recent activity</p>
        )}
      </Card>
    </div>
  )
} 