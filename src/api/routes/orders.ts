import { Router } from 'express'
import Razorpay from 'razorpay'
import { createHmac } from 'crypto'
import { supabase } from '../../lib/supabase.js'

const router = Router()

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Create a new order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, tokens, userId } = req.body

    // Create order in Razorpay
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to cents
      currency: 'USD',
      receipt: `order_${Date.now()}`,
    })

    // Store order details in database
    const { error } = await supabase
      .from('orders')
      .insert([
        {
          razorpay_order_id: order.id,
          user_id: userId,
          amount,
          tokens,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])

    if (error) throw error

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// Verify payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (razorpay_signature !== expectedSignature) {
      throw new Error('Invalid signature')
    }

    // Update order status
    const { error } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('razorpay_order_id', razorpay_order_id)

    if (error) throw error

    // Update user tokens
    const { data: order } = await supabase
      .from('orders')
      .select('tokens, user_id')
      .eq('razorpay_order_id', razorpay_order_id)
      .single()

    if (order) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ tokens: order.tokens })
        .eq('id', order.user_id)

      if (updateError) throw updateError
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error verifying payment:', error)
    res.status(500).json({ error: 'Failed to verify payment' })
  }
})

export default router 