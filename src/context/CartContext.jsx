import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data.cart || response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart({ items: [], totalAmount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity) => {
    try {
      // Check if user is logged in
      if (!user) {
        throw new Error('Please login to add items to cart');
      }

      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to add items to cart');
      }


      
      const response = await api.post('/cart/add', {
        productId,
        quantity: quantity || 1
      });
      
      setCart(response.data.cart || response.data);
      return response.data;
    } catch (error) {
      console.error('Add to cart error:', error.response?.data || error.message);
      throw error;
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      const response = await api.put(`/cart/update/${itemId}`, { quantity });
      setCart(response.data.cart || response.data);
      return response.data;
    } catch (error) {
      console.error('Update cart error:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await api.delete(`/cart/remove/${itemId}`);
      setCart(response.data.cart || response.data);
      return response.data;
    } catch (error) {
      console.error('Remove from cart error:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      setCart({ items: [], totalAmount: 0 });
    } catch (error) {
      throw error;
    }
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};