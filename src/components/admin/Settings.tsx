import { useState, useEffect } from 'react'
import { ApiService } from '../../services/api'
import { Card } from '../../components/ui/card'
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

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<SystemSettings>({
    maintenance_mode: false,
    email_notifications: true,
    payment_gateway: {
      enabled: true,
      test_mode: true,
      currency: 'USD'
    },
    pricing: {
      tokens_per_dollar: 100,
      minimum_purchase: 10,
      maximum_purchase: 1000,
      free_tokens: 50
    }
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      setLoading(true)
      const { data, error } = await ApiService.getSystemSettings()
      if (error) throw error
      setSettings(data)
    } catch (err) {
      console.error('Error fetching system settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch system settings')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await ApiService.updateSystemSettings(settings)
      toast.success('Settings updated successfully')
    } catch (err) {
      console.error('Error updating settings:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to update settings')
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
              <p className="text-sm text-gray-500">Put the system in maintenance mode</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, maintenance_mode: !prev.maintenance_mode }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                settings.maintenance_mode ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.maintenance_mode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Email Notifications</label>
              <p className="text-sm text-gray-500">Enable email notifications for users</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, email_notifications: !prev.email_notifications }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                settings.email_notifications ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.email_notifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Payment Gateway</label>
              <p className="text-sm text-gray-500">Enable/disable payment processing</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings(prev => ({
                ...prev,
                payment_gateway: {
                  ...prev.payment_gateway,
                  enabled: !prev.payment_gateway.enabled
                }
              }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                settings.payment_gateway.enabled ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.payment_gateway.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Test Mode</label>
              <p className="text-sm text-gray-500">Enable test mode for payments</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings(prev => ({
                ...prev,
                payment_gateway: {
                  ...prev.payment_gateway,
                  test_mode: !prev.payment_gateway.test_mode
                }
              }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                settings.payment_gateway.test_mode ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.payment_gateway.test_mode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tokens per Dollar</label>
            <input
              type="number"
              value={settings.pricing.tokens_per_dollar}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                pricing: {
                  ...prev.pricing,
                  tokens_per_dollar: parseInt(e.target.value)
                }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Minimum Purchase (USD)</label>
            <input
              type="number"
              value={settings.pricing.minimum_purchase}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                pricing: {
                  ...prev.pricing,
                  minimum_purchase: parseInt(e.target.value)
                }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Maximum Purchase (USD)</label>
            <input
              type="number"
              value={settings.pricing.maximum_purchase}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                pricing: {
                  ...prev.pricing,
                  maximum_purchase: parseInt(e.target.value)
                }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Free Tokens for New Users</label>
            <input
              type="number"
              value={settings.pricing.free_tokens}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                pricing: {
                  ...prev.pricing,
                  free_tokens: parseInt(e.target.value)
                }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
} 