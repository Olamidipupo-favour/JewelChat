import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { ApiService } from '../../services/api'
import { Card } from '../../components/ui/card'
import { User, Mail, CreditCard, Activity } from 'lucide-react'

export default function Profile() {
  const { profile, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData(e.currentTarget)
      const updates = {
        email: formData.get('email') as string,
      }

      await updateProfile(updates)
      setSuccess('Profile updated successfully')
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Account Type</h3>
              <p className="text-2xl font-semibold text-gray-900 capitalize">{profile?.role || 'user'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Available Tokens</h3>
              <p className="text-2xl font-semibold text-gray-900">{profile?.tokens || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {new Date(profile?.created_at || '').toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={profile?.email || ''}
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
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
} 