import { useState, useEffect } from 'react'
import { ApiService } from '../../services/api'
import { Card } from '../../components/ui/card'
import { DollarSign, Save } from 'lucide-react'

interface Pricing {
  id: string
  api_type: string
  tokens_per_request: number
  cost_per_token: number
}

export default function Pricing() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pricing, setPricing] = useState<Pricing[]>([])

  useEffect(() => {
    fetchPricing()
  }, [])

  async function fetchPricing() {
    try {
      setLoading(true)
      const { data, error } = await ApiService.getApiPricing()
      if (error) throw error
      setPricing(data)
    } catch (err) {
      console.error('Error fetching API pricing:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch API pricing')
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
      const formData = new FormData(e.currentTarget)
      const updates = pricing.map(item => ({
        id: item.id,
        tokens_per_request: Number(formData.get(`tokens_${item.id}`)),
        cost_per_token: Number(formData.get(`cost_${item.id}`)),
      }))

      const { error } = await ApiService.updateApiPricing(updates)
      if (error) throw error

      setSuccess('Pricing updated successfully')
      await fetchPricing()
    } catch (err) {
      console.error('Error updating API pricing:', err)
      setError(err instanceof Error ? err.message : 'Failed to update API pricing')
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
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Pricing</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tokens per Request
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost per Token
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pricing.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.api_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        name={`tokens_${item.id}`}
                        defaultValue={item.tokens_per_request}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                        <input
                          type="number"
                          step="0.000001"
                          name={`cost_${item.id}`}
                          defaultValue={item.cost_per_token}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              disabled={saving}
              className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
} 