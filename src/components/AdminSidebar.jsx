import React from 'react';
import { Layout, Menu } from 'antd';
import { DashboardOutlined, ShoppingOutlined, TeamOutlined, FileTextOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Sider } = Layout;

const AdminSidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/products',
      icon: <ShoppingOutlined />,
      label: 'Products',
    },
    {
      key: '/admin/menu',
      icon: <MenuOutlined />,
      label: 'Menu Management',
    },
    {
      key: '/admin/staff',
      icon: <TeamOutlined />,
      label: 'Staff',
    },
    {
      key: '/admin/orders',
      icon: <FileTextOutlined />,
      label: 'Orders',
    },
    {
      key: '/admin/reports',
      icon: <FileTextOutlined />,
      label: 'Reports',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
    } else {
      navigate(key);
    }
  };

  return (
    <Sider trigger={null} collapsible collapsed={collapsed} className="min-h-screen">
      <div className="p-4 text-center">
        <h2 className="text-white font-serif text-xl">
          {collapsed ? 'OA' : 'OvenAura Admin'}
        </h2>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  );
};

export default AdminSidebar;