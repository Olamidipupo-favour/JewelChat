import { Router } from 'express'
import Razorpay from 'razorpay'

const router = Router()

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

router.post('/create-razorpay-order', async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
      notes,
    })

    res.json(order)
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

export default router 