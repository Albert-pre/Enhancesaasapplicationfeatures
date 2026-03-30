import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Contrats from './pages/Contrats';
import Produits from './pages/Produits';
import Revenus from './pages/Revenus';
import Simulation from './pages/Simulation';
import Parametres from './pages/Parametres';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'contrats', Component: Contrats },
      { path: 'produits', Component: Produits },
      { path: 'revenus', Component: Revenus },
      { path: 'simulation', Component: Simulation },
      { path: 'parametres', Component: Parametres },
    ],
  },
]);
