import { useEffect, useState } from 'react'
import { ApiService } from '../../services/api'
import { Database } from '../../types/database'
import { supabase } from '../../lib/supabase'

type ApiPricing = Database['public']['Tables']['api_pricing']['Row']

const API_TYPES = [
  { id: 'stable_diffusion', name: 'Stable Diffusion' },
  { id: 'perplexity', name: 'Perplexity AI' },
  { id: 'gpt4', name: 'GPT-4' },
  { id: 'chat', name: 'Chat' },
]

export default function Settings() {
  const [pricing, setPricing] = useState<ApiPricing[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    tokens_per_request: 0,
    cost_per_token: 0,
  })

  useEffect(() => {
    fetchPricing()
  }, [])

  async function fetchPricing() {
    try {
      const { data, error } = await supabase
        .from('api_pricing')
        .select('*')
        .order('api_type', { ascending: true })

      if (error) throw error
      setPricing(data || [])
    } catch (error) {
      console.error('Error fetching pricing:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdatePricing(apiType: string) {
    try {
      await ApiService.updateApiPricing(
        apiType as 'stable_diffusion' | 'perplexity' | 'gpt4' | 'chat',
        formData.tokens_per_request,
        formData.cost_per_token
      )
      await fetchPricing()
      setEditingId(null)
    } catch (error) {
      console.error('Error updating pricing:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your application settings and API pricing.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  API Type
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Tokens per Request
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Cost per Token
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {API_TYPES.map((type) => {
                const currentPricing = pricing.find((p) => p.api_type === type.id)
                const isEditing = editingId === type.id

                return (
                  <tr key={type.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {type.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {isEditing ? (
                        <input
                          type="number"
                          value={formData.tokens_per_request}
                          onChange={(e) =>
                            setFormData({ ...formData, tokens_per_request: Number(e.target.value) })
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      ) : (
                        currentPricing?.tokens_per_request
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.0001"
                          value={formData.cost_per_token}
                          onChange={(e) =>
                            setFormData({ ...formData, cost_per_token: Number(e.target.value) })
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      ) : (
                        `$${currentPricing?.cost_per_token.toFixed(4)}`
                      )}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleUpdatePricing(type.id)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(type.id)
                            setFormData({
                              tokens_per_request: currentPricing?.tokens_per_request || 0,
                              cost_per_token: currentPricing?.cost_per_token || 0,
                            })
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Environment Variables</h2>
        <div className="mt-4">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    Variable
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    Token Price
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    ${import.meta.env.VITE_TOKEN_PRICE}
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    Min Token Purchase
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {import.meta.env.VITE_MIN_TOKEN_PURCHASE}
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    Max Token Purchase
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {import.meta.env.VITE_MAX_TOKEN_PURCHASE}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 