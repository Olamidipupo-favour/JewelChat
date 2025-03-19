import { useState, useEffect } from 'react'
import { ApiService } from '../../services/api'
import { Card } from '../../components/ui/card'
import { Save, Bell, Shield, CreditCard } from 'lucide-react'

interface SystemSettings {
  maintenance_mode: boolean
  email_notifications: boolean
  payment_gateway: {
    enabled: boolean
    test_mode: boolean
  }
  security: {
    require_2fa: boolean
    max_login_attempts: number
  }
}

export default function AdminSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [settings, setSettings] = useState<SystemSettings>({
    maintenance_mode: false,
    email_notifications: true,
    payment_gateway: {
      enabled: true,
      test_mode: true,
    },
    security: {
      require_2fa: false,
      max_login_attempts: 5,
    },
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await ApiService.updateSystemSettings(settings)
      if (error) throw error

      setSuccess('Settings updated successfully')
    } catch (err) {
      console.error('Error updating system settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to update system settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Email Notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.email_notifications}
                  onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Gateway</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Enable Payments</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.payment_gateway.enabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    payment_gateway: {
                      ...settings.payment_gateway,
                      enabled: e.target.checked,
                    },
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Test Mode</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.payment_gateway.test_mode}
                  onChange={(e) => setSettings({
                    ...settings,
                    payment_gateway: {
                      ...settings.payment_gateway,
                      test_mode: e.target.checked,
                    },
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Require 2FA</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.require_2fa}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: {
                      ...settings.security,
                      require_2fa: e.target.checked,
                    },
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            <div>
              <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-gray-700">
                Max Login Attempts
              </label>
              <input
                type="number"
                id="maxLoginAttempts"
                value={settings.security.max_login_attempts}
                onChange={(e) => setSettings({
                  ...settings,
                  security: {
                    ...settings.security,
                    max_login_attempts: Number(e.target.value),
                  },
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                min="1"
                max="10"
              />
            </div>
          </div>
        </Card>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        {success && (
          <div className="text-green-500 text-sm">{success}</div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
} 