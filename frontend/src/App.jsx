import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import CatalogPage from './pages/CatalogPage';
import ChefAssistantPage from './pages/ChefAssistantPage';
import OrdersPage from './pages/OrdersPage';
import RecipeFeedPage from './pages/RecipeFeedPage';
import DashboardPage from './pages/DashboardPage';
import CartPage from './pages/CartPage';
import MainLayout from './pages/MainLayout';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <div className="min-h-screen bg-white">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Customer Routes with MainLayout */}
                <Route element={<MainLayout />}>
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/recipes" element={<RecipeFeedPage />} />
                  <Route path="/chef" element={<ChefAssistantPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                </Route>

                <Route path="/dashboard/*" element={<DashboardPage />} />
              </Routes>
            </div>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
