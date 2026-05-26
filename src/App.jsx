import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LineAuthProvider } from './context/LineAuthContext'
import { CartProvider } from './context/CartContext'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import CategoryPage from './pages/CategoryPage'
import ProductPage from './pages/ProductPage'
import VendorsPage from './pages/VendorsPage'
import OrdersPage from './pages/OrdersPage'
import CartPage from './pages/CartPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <LineAuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Marketplace public routes — admin routes are in a separate project */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="category/:slug" element={<CategoryPage />} />
              <Route path="product/:id" element={<ProductPage />} />
              <Route path="vendors" element={<VendorsPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </LineAuthProvider>
  )
}
