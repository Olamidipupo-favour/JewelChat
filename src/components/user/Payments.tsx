import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { ApiService } from '../../services/api'
import { Card } from '../../components/ui/card'
import { CreditCard, Download, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Payment {
  id: string
  amount: number
  tokens: number
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}

interface TokenPackage {
  id: string
  name: string
  tokens: number
  price: number
  description: string
}

const tokenPackages: TokenPackage[] = [
  {
    id: 'basic',
    name: 'Basic',
    tokens: 1000,
    price: 9.99,
    description: 'Perfect for getting started',
  },
  {
    id: 'pro',
    name: 'Professional',
    tokens: 5000,
    price: 39.99,
    description: 'Best value for regular users',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tokens: 15000,
    price: 99.99,
    description: 'For power users and businesses',
  },
]

export default function Payments() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [showPackages, setShowPackages] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  useEffect(() => {
    fetchPayments()
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      setRazorpayLoaded(true)
    }
    script.onerror = () => {
      toast.error('Failed to load payment system. Please try again later.')
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
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

  const handleBuyTokens = async (pkg: TokenPackage) => {
    if (!razorpayLoaded) {
      toast.error('Payment system is still loading. Please try again in a moment.')
      return
    }

    try {
      setLoading(true)
      await ApiService.createOrder(pkg.price, pkg.tokens)
      toast.success('Payment initiated successfully!')
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Failed to initiate payment. Please try again.')
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
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Available Tokens</h3>
              <p className="text-2xl font-semibold text-gray-900">{profile?.tokens || 0}</p>
            </div>
          </div>
          <button
            onClick={() => setShowPackages(!showPackages)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Buy Tokens
          </button>
        </div>
      </Card>

      {showPackages && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Token Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tokenPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="relative rounded-lg border border-gray-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900">{pkg.name}</h3>
                  <p className="mt-2 text-sm text-gray-500">{pkg.description}</p>
                  <p className="mt-4 text-3xl font-bold text-gray-900">
                    ${pkg.price.toFixed(2)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {pkg.tokens.toLocaleString()} tokens
                  </p>
                </div>

                <button
                  onClick={() => handleBuyTokens(pkg)}
                  disabled={loading || !razorpayLoaded}
                  className="mt-8 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : !razorpayLoaded ? 'Loading...' : 'Buy Now'}
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

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
                      ${payment.amount.toFixed(2)}
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