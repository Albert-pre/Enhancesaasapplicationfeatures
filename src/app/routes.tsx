import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Contrats from './pages/Contrats';
import Produits from './pages/Produits';
import Revenus from './pages/Revenus';
import Simulation from './pages/Simulation';
import Parametres from './pages/Parametres';
import PL from './pages/PL';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ResetPassword from './pages/auth/ResetPassword';

// Wrapper component for protected routes
function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  // Auth routes (public)
  {
    path: '/auth/login',
    Component: Login,
  },
  {
    path: '/auth/signup',
    Component: Signup,
  },
  {
    path: '/auth/reset-password',
    Component: ResetPassword,
  },
  // Protected routes
  {
    path: '/',
    Component: ProtectedLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'contrats', Component: Contrats },
      { path: 'produits', Component: Produits },
      { path: 'revenus', Component: Revenus },
      { path: 'simulation', Component: Simulation },
      { path: 'pl', Component: PL },
      { path: 'parametres', Component: Parametres },
    ],
  },
]);
