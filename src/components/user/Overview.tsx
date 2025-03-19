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
  totalIncome: number
  totalTokens: number
  lastPayment: Payment | null
}

export default function Overview() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalTokens: 0,
    lastPayment: null as Payment | null,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const { data: payments, error } = await ApiService.getPayments()
      if (error) throw error

      // Calculate total income excluding pending payments
      const totalIncome = payments
        .filter(payment => payment.status === 'completed')
        .reduce((sum, payment) => sum + payment.amount, 0)

      // Calculate total tokens
      const totalTokens = payments
        .filter(payment => payment.status === 'completed')
        .reduce((sum, payment) => sum + payment.tokens, 0)

      // Get the most recent completed payment
      const lastPayment = payments
        .filter(payment => payment.status === 'completed')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null

      setStats({
        totalIncome,
        totalTokens,
        lastPayment,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Income</p>
            <p className="text-2xl font-semibold text-gray-900">${stats.totalIncome.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <CreditCard className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Tokens</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalTokens.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">API Usage</p>
            <p className="text-2xl font-semibold text-gray-900">0</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <Settings className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Account Status</p>
            <p className="text-2xl font-semibold text-gray-900">Active</p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-full">
            <User className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </Card>

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
                ${stats.lastPayment.amount.toFixed(2)}
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