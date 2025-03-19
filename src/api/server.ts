import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import ordersRouter from './routes/orders.js'
import razorpayRouter from './routes/razorpay.js'

// Load environment variables
dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api', ordersRouter)
app.use('/api', razorpayRouter)

// Start server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`)
}) 