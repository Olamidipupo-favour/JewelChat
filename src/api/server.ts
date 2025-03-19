import express from 'express'
import cors from 'cors'
import ordersRouter from './routes/orders.js'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api', ordersRouter)

// Start server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`)
}) 