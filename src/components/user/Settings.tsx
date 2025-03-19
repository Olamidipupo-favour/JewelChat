import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { ApiService } from '../../services/api'
import { Card } from '../../components/ui/card'
import { Lock, Bell, Trash2 } from 'lucide-react'

export default function Settings() {
  const { signOut } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData(e.currentTarget)
      const currentPassword = formData.get('currentPassword') as string
      const newPassword = formData.get('newPassword') as string
      const confirmPassword = formData.get('confirmPassword') as string

      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match')
      }

      const { error } = await ApiService.updatePassword(currentPassword, newPassword)
      if (error) throw error

      setSuccess('Password updated successfully')
      e.currentTarget.reset()
    } catch (err) {
      console.error('Error updating password:', err)
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await ApiService.deleteAccount()
      if (error) throw error

      await signOut()
    } catch (err) {
      console.error('Error deleting account:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <div className="mt-1 flex items-center">
              <Lock className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="mt-1 flex items-center">
              <Lock className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div className="mt-1 flex items-center">
              <Lock className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {success && (
            <div className="text-green-500 text-sm">{success}</div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">Email Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Trash2 className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">Delete Account</span>
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Delete Account
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
} 