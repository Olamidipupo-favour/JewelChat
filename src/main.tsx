import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AuthRoute } from './components/auth/AuthRoute'
import { AdminRoute } from './components/auth/AdminRoute'
import { DashboardRoute } from './components/auth/DashboardRoute'
import DashboardLayout from './components/admin/DashboardLayout'
import { UserDashboardLayout } from './components/user/DashboardLayout'
import { Login } from './components/auth/Login'
import SignUp from './components/auth/SignUp'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'
import App from './App'
import AdminOverview from './components/admin/Overview'
import UserOverview from './components/user/Overview'
import Profile from './components/user/Profile'
import Payments from './components/user/Payments'
import Settings from './components/user/Settings'
import ApiKeys from './components/user/ApiKeys'
import Users from './components/admin/Users'
import ApiUsage from './components/admin/ApiUsage'
import Pricing from './components/admin/Pricing'
import AdminSettings from './components/admin/Settings'
import BlogPage from './components/BlogPage'
import DeepResearchPage from './components/DeepResearchPage'
import DevelopConceptsPage from './components/DevelopConceptsPage'
import ConceptGenerator from './components/ConceptGenerator'
import EditConcept from './components/EditConcept'
import VariationsLanding from './components/VariationsLanding'
import ImageVariations from './components/ImageVariations'
import EasyVariation from './components/EasyVariation'
import AdvancedVariation from './components/AdvancedVariation'
import ImageCollection from './components/ImageCollection'
import NotFound from './components/NotFound'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPage />} />
          <Route path="/deep-research" element={<DeepResearchPage />} />
          <Route path="/develop-concepts" element={<DevelopConceptsPage />} />
          <Route path="/concept-generator" element={<ConceptGenerator />} />
          <Route path="/edit-concept" element={<EditConcept />} />
          <Route path="/variations" element={<VariationsLanding />} />
          <Route path="/image-variations" element={<ImageVariations />} />
          <Route path="/easy-variation" element={<EasyVariation />} />
          <Route path="/advanced-variation" element={<AdvancedVariation />} />
          <Route path="/image-collection" element={<ImageCollection />} />

          {/* Auth Routes */}
          <Route element={<AuthRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><DashboardLayout /></AdminRoute>}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<Users />} />
            <Route path="api-usage" element={<ApiUsage />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* User Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardRoute><UserDashboardLayout /></DashboardRoute>}>
            <Route index element={<UserOverview />} />
            <Route path="api-keys" element={<ApiKeys />} />
            <Route path="profile" element={<Profile />} />
            <Route path="payments" element={<Payments />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* App Routes */}
          <Route path="/" element={<App />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>
)