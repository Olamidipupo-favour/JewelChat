import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AuthRoute } from './components/auth/AuthRoute'
import { AdminRoute } from './components/auth/AdminRoute'
import { DashboardRoute } from './components/auth/DashboardRoute'
import { AdminDashboardLayout } from './components/admin/AdminDashboardLayout'
import { UserDashboardLayout } from './components/user/DashboardLayout'
import { Login } from './components/auth/Login'
import { Register } from './components/auth/Register'
import AdminOverview from './components/admin/Overview'
import UserOverview from './components/user/Overview'
import Profile from './components/user/Profile'
import Payments from './components/user/Payments'
import Settings from './components/user/Settings'
import Users from './components/admin/Users'
import ApiUsage from './components/admin/ApiUsage'
import Pricing from './components/admin/Pricing'
import AdminSettings from './components/admin/Settings'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
          
          <Route path="/admin" element={<AdminRoute><AdminDashboardLayout /></AdminRoute>}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<Users />} />
            <Route path="api-usage" element={<ApiUsage />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="/dashboard" element={<DashboardRoute><UserDashboardLayout /></DashboardRoute>}>
            <Route index element={<UserOverview />} />
            <Route path="profile" element={<Profile />} />
            <Route path="payments" element={<Payments />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>
)