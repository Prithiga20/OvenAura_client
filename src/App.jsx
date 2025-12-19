import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import UserHome from './pages/UserHome';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductsPage from './pages/admin/ProductsPage';
import StaffPage from './pages/admin/StaffPage';
import OrdersPage from './pages/admin/OrdersPage';
import ReportsPage from './pages/admin/ReportsPage';
import MenuManagement from './pages/admin/MenuManagement';
import Menu from './pages/Menu';
import BrowseMenu from './pages/BrowseMenu';
import CategoryItems from './pages/CategoryItems';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import TodoList from './pages/TodoList';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/user" />;
  
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/user'} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/user" />} />
      <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      <Route path="/user" element={<ProtectedRoute><UserHome /></ProtectedRoute>} />
      <Route path="/user/home" element={<ProtectedRoute><UserHome /></ProtectedRoute>} />
      
      {/* Menu Routes */}
      <Route path="/menu" element={<ProtectedRoute><BrowseMenu /></ProtectedRoute>} />
      <Route path="/browse-menu" element={<ProtectedRoute><BrowseMenu /></ProtectedRoute>} />
      <Route path="/menu/category/:categoryId" element={<ProtectedRoute><CategoryItems /></ProtectedRoute>} />
      <Route path="/menu/item/:itemId" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
      
      {/* Admin Routes with Nested Routing */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="menu" element={<MenuManagement />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
      
      <Route path="/product/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/todos" element={<ProtectedRoute><TodoList /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
};

function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#d97706' } }}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <AppRoutes />
              <Toaster position="top-right" />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;