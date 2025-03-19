import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { ApiService } from '../../services/api'
import { Card } from '../ui/card'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SystemSettings {
  maintenance_mode: boolean
  email_notifications: boolean
  payment_gateway: {
    enabled: boolean
    test_mode: boolean
    currency: string
  }
  pricing: {
    tokens_per_dollar: number
    minimum_purchase: number
    maximum_purchase: number
    free_tokens: number
  }
}

export default function Tokens() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [amount, setAmount] = useState('')
  const [tokens, setTokens] = useState(0)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await ApiService.getSystemSettings()
        if (error) throw error
        setSettings(data)
      } catch (err) {
        console.error('Error fetching system settings:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    if (settings && amount) {
      const numAmount = parseFloat(amount)
      if (!isNaN(numAmount)) {
        const calculatedTokens = Math.floor(numAmount * settings.pricing.tokens_per_dollar)
        setTokens(calculatedTokens)
      } else {
        setTokens(0)
      }
    }
  }, [amount, settings])

  async function handlePurchase() {
    if (!settings || !amount) return

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount)) {
      toast.error('Please enter a valid amount')
      return
    }

    if (numAmount < settings.pricing.minimum_purchase) {
      toast.error(`Minimum purchase amount is $${settings.pricing.minimum_purchase}`)
      return
    }

    if (numAmount > settings.pricing.maximum_purchase) {
      toast.error(`Maximum purchase amount is $${settings.pricing.maximum_purchase}`)
      return
    }

    setPurchasing(true)
    try {
      const { error } = await ApiService.purchaseTokens(tokens)
      if (error) throw error
      toast.success(`Successfully purchased ${tokens} tokens`)
      setAmount('')
      setTokens(0)
    } catch (err) {
      console.error('Error purchasing tokens:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to purchase tokens')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center text-red-500">
        Failed to load system settings
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Purchase Tokens</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount (USD)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder="0.00"
                min={settings.pricing.minimum_purchase}
                max={settings.pricing.maximum_purchase}
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tokens to Receive
            </label>
            <div className="mt-1">
              <div className="text-2xl font-semibold text-purple-600">
                {tokens.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500">
                {settings.pricing.tokens_per_dollar} tokens per dollar
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handlePurchase}
              disabled={purchasing || !amount || tokens === 0}
              className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {purchasing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Purchasing...
                </>
              ) : (
                'Purchase Tokens'
              )}
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Token Information</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Minimum Purchase</h3>
            <p className="mt-1 text-sm text-gray-900">
              ${settings.pricing.minimum_purchase} USD
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Maximum Purchase</h3>
            <p className="mt-1 text-sm text-gray-900">
              ${settings.pricing.maximum_purchase} USD
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Tokens per Dollar</h3>
            <p className="mt-1 text-sm text-gray-900">
              {settings.pricing.tokens_per_dollar} tokens
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Free Tokens for New Users</h3>
            <p className="mt-1 text-sm text-gray-900">
              {settings.pricing.free_tokens} tokens
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
} 