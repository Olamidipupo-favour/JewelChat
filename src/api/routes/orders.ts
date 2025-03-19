import { Router } from 'express'
import Razorpay from 'razorpay'
import { createHmac } from 'crypto'
import { supabase } from '../../lib/supabase.js'

const router = Router()

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID!,
  key_secret: process.env.VITE_RAZORPAY_KEY_SECRET!,
})

// Create a new order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, tokens, userId } = req.body

    // Create order in Razorpay
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    })

    // Create order record in database
    const { error } = await supabase
      .from('payments')
      .insert([
        {
          user_id: userId,
          amount,
          tokens,
          razorpay_order_id: order.id,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

    if (error) throw error

    res.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// Verify payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body

    // Verify payment signature
    const secret = process.env.VITE_RAZORPAY_KEY_SECRET!
    const generated_signature = createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex')

    const isValid = generated_signature === razorpay_signature

    if (!isValid) {
      throw new Error('Invalid payment signature')
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error verifying payment:', error)
    res.status(500).json({ error: 'Failed to verify payment' })
  }
})

export default router 