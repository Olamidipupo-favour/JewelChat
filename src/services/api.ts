import { supabase } from '../lib/supabase'
import { Database } from '../types/database'
import { v4 as uuidv4 } from 'uuid'

type ApiUsage = Database['public']['Tables']['api_usage']['Row']
type ApiPricing = Database['public']['Tables']['api_pricing']['Row']
type Payment = Database['public']['Tables']['payments']['Row']
type ApiKey = Database['public']['Tables']['api_keys']['Row']

// Helper function to convert string to Uint8Array
function stringToUint8Array(str: string): Uint8Array {
  const arr = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i)
  }
  return arr
}

// Helper function to convert Uint8Array to hex string
async function arrayBufferToHex(buffer: ArrayBuffer): Promise<string> {
  const hashArray = Array.from(new Uint8Array(buffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Helper function to create HMAC

async function createHmac(message: string, key: string): Promise<string> {
  const keyData = stringToUint8Array(key)
  const messageData = stringToUint8Array(message)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageData
  )

  return arrayBufferToHex(signature)
}

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

  static async getApiUsageStats() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Verify user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const { data, error } = await supabase
      .from('api_usage')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
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

  static async updateApiPricing(updates: Array<{ id: string; tokens_per_request: number; cost_per_token: number }>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Verify user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const { data, error } = await supabase
      .from('api_pricing')
      .upsert(updates)
      .select()

    if (error) throw error
    return data
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

    // Get payment details
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('user_id', user.id)
      .single()

    if (paymentError) throw paymentError
    if (!payment) throw new Error('Payment not found')

    // Get user details
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single()

    if (userError) throw userError
    if (!userData) throw new Error('User not found')

    // Create invoice PDF
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF()

    // Add company header
    pdf.setFontSize(20)
    pdf.text('JewelChat', 20, 20)
    pdf.setFontSize(12)
    pdf.text('123 Jewel Street', 20, 30)
    pdf.text('Gem City, GC 12345', 20, 37)

    // Add invoice details
    pdf.setFontSize(16)
    pdf.text('INVOICE', 20, 50)
    pdf.setFontSize(12)
    pdf.text(`Invoice #: ${payment.id}`, 20, 60)
    pdf.text(`Date: ${new Date(payment.created_at).toLocaleDateString()}`, 20, 67)

    // Add customer details
    pdf.setFontSize(14)
    pdf.text('Bill To:', 20, 80)
    pdf.setFontSize(12)
    pdf.text(userData.email, 20, 87)

    // Add payment details
    pdf.setFontSize(14)
    pdf.text('Payment Details:', 20, 100)
    pdf.setFontSize(12)
    pdf.text(`Amount: $${payment.amount.toFixed(2)}`, 20, 107)
    pdf.text(`Tokens: ${payment.tokens}`, 20, 114)
    pdf.text(`Status: ${payment.status.toUpperCase()}`, 20, 121)

    // Add footer
    pdf.setFontSize(10)
    pdf.text('Thank you for your business!', 20, 140)
    pdf.text('For support, contact support@jewelchat.com', 20, 147)

    // Convert to blob
    const pdfBlob = pdf.output('blob')
    return pdfBlob
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

  static async createOrder(amount: number, tokens: number) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Create order in Razorpay
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        tokens,
        userId: user.id,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create order')
    }

    const { orderId, amount: orderAmount, currency } = await response.json()

    // Initialize Razorpay payment
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderAmount,
      currency: 'USD',
      name: 'JewelChat',
      description: `Purchase ${tokens} tokens`,
      order_id: orderId,
      handler: async (response: any) => {
        try {
          // Verify payment
          const verifyResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(response),
          })

          if (!verifyResponse.ok) {
            throw new Error('Payment verification failed')
          }

          // Update user's tokens
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('tokens')
            .eq('id', user.id)
            .single()

          if (userError) throw userError

          const { error: updateError } = await supabase
            .from('users')
            .update({ tokens: (userData?.tokens || 0) + tokens })
            .eq('id', user.id)

          if (updateError) throw updateError

          toast.success('Payment successful!')
        } catch (error) {
          console.error('Error verifying payment:', error)
          toast.error('Payment verification failed')
        }
      },
      prefill: {
        name: user.email,
        email: user.email,
      },
      theme: {
        color: '#4F46E5',
      },
    }

    const razorpay = new (window as any).Razorpay(options)
    razorpay.open()
  }

  static async getOrders() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return payments
  }

  static async getApiKeys() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  }

  static async createApiKey(name: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      console.log('Generating API key for user:', user.id)
      
      // Generate a random API key
      const key = `jk_${uuidv4().replace(/-/g, '')}`
      console.log('Generated key (first 8 chars):', key.substring(0, 8))

      const { data, error } = await supabase
        .from('api_keys')
        .insert([
          {
            user_id: user.id,
            name,
            key,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('API key created in database')
      return { data, error: null }
    } catch (error) {
      console.error('Error in createApiKey:', error)
      throw error
    }
  }

  static async deleteApiKey(id: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
    return { error: null }
  }

  static async getApiUsageLogs() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('api_usage')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error
    return { data, error: null }
  }
} 