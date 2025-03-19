import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { ApiService } from '../../services/api'
import { Card } from '../../components/ui/card'
import { CreditCard, Download } from 'lucide-react'

interface Payment {
  id: string
  amount: number
  tokens: number
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}

export default function Payments() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])

  useEffect(() => {
    fetchPayments()
  }, [])

  async function fetchPayments() {
    try {
      setLoading(true)
      const { data, error } = await ApiService.getPayments()
      if (error) throw error
      setPayments(data || [])
    } catch (err) {
      console.error('Error fetching payments:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch payments')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = async (paymentId: string) => {
    try {
      const { data, error } = await ApiService.downloadInvoice(paymentId)
      if (error) throw error
      
      // Create a blob from the PDF data
      const blob = new Blob([data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${paymentId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error downloading invoice:', err)
      setError(err instanceof Error ? err.message : 'Failed to download invoice')
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
      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-full">
            <CreditCard className="w-6 h-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Available Tokens</h3>
            <p className="text-2xl font-semibold text-gray-900">{profile?.tokens || 0}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
        {payments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No payment history found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tokens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{payment.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.tokens}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleDownloadInvoice(payment.id)}
                        className="text-purple-600 hover:text-purple-900 flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
} 