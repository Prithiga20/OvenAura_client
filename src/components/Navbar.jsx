import React from 'react';
import { Layout, Menu, Badge, Avatar, Dropdown } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LogoutOutlined, ProfileOutlined, CheckSquareOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const { Header } = Layout;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { cart } = useCart();

  const menuItems = [
    { key: '/user', label: 'Home' },
    { key: '/dashboard', label: 'Search' },
    { key: '/menu', label: 'Browse Menu' },
    { key: '/orders', label: 'Orders' },
    { key: '/todos', label: 'To-Do List' },
  ];

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<ProfileOutlined />} onClick={() => navigate('/profile')}>
        Profile
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="bg-white shadow-sm px-4 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-2xl font-serif text-cafe-800 mr-8">OvenAura</h1>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="border-none"
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <Badge count={cart.items?.length || 0}>
          <ShoppingCartOutlined 
            className="text-xl cursor-pointer text-cafe-600 hover:text-cafe-800"
            onClick={() => navigate('/cart')}
          />
        </Badge>
        
        <Dropdown overlay={userMenu} placement="bottomRight">
          <div className="flex items-center cursor-pointer">
            <Avatar icon={<UserOutlined />} className="mr-2" />
            <span className="text-cafe-800">{user?.name}</span>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default Navbar;