import { supabase } from '../lib/supabase'
import { Database } from '../types/database'

type ApiUsage = Database['public']['Tables']['api_usage']['Row']
type ApiPricing = Database['public']['Tables']['api_pricing']['Row']

export class ApiService {
  static async trackApiUsage(
    apiType: 'stable_diffusion' | 'perplexity' | 'gpt4' | 'chat',
    tokensUsed: number
  ) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get API pricing
    const { data: pricing, error: pricingError } = await supabase
      .from('api_pricing')
      .select('*')
      .eq('api_type', apiType)
      .single()

    if (pricingError) throw pricingError

    // Calculate cost
    const cost = (tokensUsed / pricing.tokens_per_request) * pricing.cost_per_token

    // Record API usage
    const { error: usageError } = await supabase.from('api_usage').insert({
      user_id: user.id,
      api_type: apiType,
      tokens_used: tokensUsed,
      cost: cost,
    })

    if (usageError) throw usageError

    // Deduct tokens from user's balance
    const { error: updateError } = await supabase.rpc('deduct_tokens', {
      user_id: user.id,
      amount: tokensUsed,
    })

    if (updateError) throw updateError
  }

  static async getApiUsageStats(startDate: Date, endDate: Date) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('api_usage')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })

    if (error) throw error

    // Calculate statistics
    const stats = {
      totalTokens: 0,
      totalCost: 0,
      usageByType: {} as Record<string, { tokens: number; cost: number }>,
    }

    data.forEach((usage) => {
      stats.totalTokens += usage.tokens_used
      stats.totalCost += usage.cost
      if (!stats.usageByType[usage.api_type]) {
        stats.usageByType[usage.api_type] = { tokens: 0, cost: 0 }
      }
      stats.usageByType[usage.api_type].tokens += usage.tokens_used
      stats.usageByType[usage.api_type].cost += usage.cost
    })

    return stats
  }

  static async getAdminStats(startDate: Date, endDate: Date) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Verify user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    // Get all API usage
    const { data: usageData, error: usageError } = await supabase
      .from('api_usage')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })

    if (usageError) throw usageError

    // Get all payments
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('status', 'completed')

    if (paymentError) throw paymentError

    // Calculate statistics
    const stats = {
      totalRevenue: 0,
      totalApiCost: 0,
      totalTokensSold: 0,
      totalTokensUsed: 0,
      revenueByDay: {} as Record<string, number>,
      costByDay: {} as Record<string, number>,
      usageByType: {} as Record<string, { tokens: number; cost: number }>,
    }

    // Calculate payment statistics
    paymentData.forEach((payment) => {
      stats.totalRevenue += payment.amount
      stats.totalTokensSold += payment.tokens
      const date = new Date(payment.created_at).toISOString().split('T')[0]
      stats.revenueByDay[date] = (stats.revenueByDay[date] || 0) + payment.amount
    })

    // Calculate API usage statistics
    usageData.forEach((usage) => {
      stats.totalApiCost += usage.cost
      stats.totalTokensUsed += usage.tokens_used
      const date = new Date(usage.created_at).toISOString().split('T')[0]
      stats.costByDay[date] = (stats.costByDay[date] || 0) + usage.cost
      if (!stats.usageByType[usage.api_type]) {
        stats.usageByType[usage.api_type] = { tokens: 0, cost: 0 }
      }
      stats.usageByType[usage.api_type].tokens += usage.tokens_used
      stats.usageByType[usage.api_type].cost += usage.cost
    })

    return stats
  }

  static async updateApiPricing(
    apiType: 'stable_diffusion' | 'perplexity' | 'gpt4' | 'chat',
    tokensPerRequest: number,
    costPerToken: number
  ) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Verify user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const { error } = await supabase
      .from('api_pricing')
      .update({
        tokens_per_request: tokensPerRequest,
        cost_per_token: costPerToken,
        updated_at: new Date().toISOString(),
      })
      .eq('api_type', apiType)

    if (error) throw error
  }
} 