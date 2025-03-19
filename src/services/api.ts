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
    apiTypeOrUpdates: 'stable_diffusion' | 'perplexity' | 'gpt4' | 'chat' | Array<{ id: string; tokens_per_request: number; cost_per_token: number }>,
    tokensPerRequest?: number,
    costPerToken?: number
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

    if (Array.isArray(apiTypeOrUpdates)) {
      const { error } = await supabase
        .from('api_pricing')
        .upsert(apiTypeOrUpdates)

      if (error) throw error
      return { error: null }
    }

    const { error } = await supabase
      .from('api_pricing')
      .update({
        tokens_per_request: tokensPerRequest,
        cost_per_token: costPerToken,
        updated_at: new Date().toISOString(),
      })
      .eq('api_type', apiTypeOrUpdates)

    if (error) throw error
    return { error: null }
  }

  static async getUserStats() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (paymentsError) throw paymentsError

    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const lastPayment = payments[0] || null

    return {
      totalTokens: user.user_metadata.tokens || 0,
      totalPayments,
      lastPayment,
    }
  }

  static async getPayments() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    return await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
  }

  static async downloadInvoice(paymentId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    return await supabase
      .from('payments')
      .select('invoice_url')
      .eq('id', paymentId)
      .eq('user_id', user.id)
      .single()
  }

  static async updatePassword(currentPassword: string, newPassword: string) {
    return await supabase.auth.updateUser({
      password: newPassword
    })
  }

  static async deleteAccount() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Delete user's data
    await supabase
      .from('payments')
      .delete()
      .eq('user_id', user.id)

    await supabase
      .from('api_usage')
      .delete()
      .eq('user_id', user.id)

    await supabase
      .from('users')
      .delete()
      .eq('id', user.id)

    // Delete the auth user
    return await supabase.auth.admin.deleteUser(user.id)
  }

  static async getApiUsageStats() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data, error } = await supabase
      .from('api_usage')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    const stats = {
      total_requests: data.length,
      total_tokens: data.reduce((sum, usage) => sum + usage.tokens_used, 0),
      total_cost: data.reduce((sum, usage) => sum + usage.cost, 0),
      average_response_time: 0, // This would need to be calculated from actual response times
    }

    return { data: stats, error: null }
  }

  static async getApiPricing() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    return await supabase
      .from('api_pricing')
      .select('*')
      .order('api_type')
  }

  static async getSystemSettings() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .single()

    if (error) throw error
    return { data, error: null }
  }

  static async updateSystemSettings(settings: {
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
  }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data, error } = await supabase
      .from('system_settings')
      .upsert(settings)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  }
} 