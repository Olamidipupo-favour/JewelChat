import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App.tsx';
import BlogPage from './pages/BlogPage.tsx';
import DeepResearchPage from './pages/DeepResearchPage.tsx';
import DevelopConceptsPage from './pages/DevelopConceptsPage.tsx';
import ConceptGenerator from './pages/ConceptGenerator.tsx';
import EditConcept from './pages/EditConcept.tsx';
import VariationsLanding from './pages/VariationsLanding.tsx';
import ImageVariations from './pages/ImageVariations.tsx';
import EasyVariation from './pages/EasyVariation.tsx';
import AdvancedVariation from './pages/AdvancedVariation.tsx';
import ImageCollection from './pages/ImageCollection.tsx';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import ForgotPassword from './components/auth/ForgotPassword';
import DashboardLayout from './components/admin/DashboardLayout';
import Overview from './components/admin/Overview';
import Users from './components/admin/Users';
import Payments from './components/admin/Payments';
import Settings from './components/admin/Settings';
import { AdminRoute } from './components/auth/AdminRoute';
import './index.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <App />
      </AuthProvider>
    ),
  },
  {
    path: "/login",
    element: (
      <AuthProvider>
        <Login />
      </AuthProvider>
    ),
  },
  {
    path: "/signup",
    element: (
      <AuthProvider>
        <SignUp />
      </AuthProvider>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <AuthProvider>
        <ForgotPassword />
      </AuthProvider>
    ),
  },
  {
    path: "/admin",
    element: (
      <AuthProvider>
        <AdminRoute>
          <DashboardLayout />
        </AdminRoute>
      </AuthProvider>
    ),
    children: [
      {
        index: true,
        element: <Overview />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "payments",
        element: <Payments />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
  {
    path: "/blog",
    element: <BlogPage />,
  },
  {
    path: "/blog/:slug",
    element: <BlogPage />,
  },
  {
    path: "/deep-research",
    element: <DeepResearchPage />,
  },
  {
    path: "/develop-concepts",
    element: <DevelopConceptsPage />,
  },
  {
    path: "/concept-generator",
    element: <ConceptGenerator />,
  },
  {
    path: "/edit-concept",
    element: <EditConcept />,
  },
  {
    path: "/variations",
    element: <VariationsLanding />,
  },
  {
    path: "/image-variations",
    element: <ImageVariations />,
  },
  {
    path: "/easy-variation",
    element: <EasyVariation />,
  },
  {
    path: "/advanced-variation",
    element: <AdvancedVariation />,
  },
  {
    path: "/image-collection",
    element: <ImageCollection />,
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);