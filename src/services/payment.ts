import { supabase } from '../lib/supabase'
import { Database } from '../types/database'

type Payment = Database['public']['Tables']['payments']['Row']

declare global {
  interface Window {
    Razorpay: any
  }
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export class PaymentService {
  static async createOrder(amount: number, tokens: number) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Create order in your backend
    const response = await fetch(`${API_URL}/api/create-order`, {
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

    const order = await response.json()

    // Initialize Razorpay
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      name: 'JewelChat',
      description: `Purchase ${tokens} tokens`,
      order_id: order.id,
      handler: async (response: any) => {
        await this.handlePaymentSuccess(response, order.id)
      },
      prefill: {
        email: user.email,
      },
      theme: {
        color: '#6366f1',
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()

    razorpay.on('payment.failed', (response: any) => {
      this.handlePaymentFailure(response.error)
    })
  }

  private static async handlePaymentSuccess(response: any, orderId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Verify payment on your backend
    const verifyResponse = await fetch(`${API_URL}/api/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
      }),
    })

    if (!verifyResponse.ok) {
      throw new Error('Failed to verify payment')
    }

    const verification = await verifyResponse.json()

    if (verification.success) {
      // Update payment status in database
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          razorpay_payment_id: response.razorpay_payment_id,
          updated_at: new Date().toISOString(),
        })
        .eq('razorpay_order_id', orderId)

      if (error) throw error

      // Update user's token balance
      const { data: payment } = await supabase
        .from('payments')
        .select('tokens')
        .eq('razorpay_order_id', orderId)
        .single()

      if (payment) {
        const { error: updateError } = await supabase.rpc('add_tokens', {
          user_id: user.id,
          amount: payment.tokens,
        })

        if (updateError) throw updateError
      }
    }
  }

  private static handlePaymentFailure(error: any) {
    console.error('Payment failed:', error)
    // Handle payment failure (show error message to user)
  }

  static async getPaymentHistory() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  static async refundPayment(paymentId: string) {
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

    // Process refund through your backend
    const response = await fetch(`${API_URL}/api/refund-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to process refund')
    }

    const result = await response.json()

    if (result.success) {
      // Update payment status in database
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'refunded',
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId)

      if (error) throw error
    }
  }
} 