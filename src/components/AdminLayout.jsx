import React, { useState } from 'react';
import { Layout, Button, Typography } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const { Header, Content } = Layout;
const { Title } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="min-h-screen">
      <AdminSidebar collapsed={collapsed} />
      <Layout>
        <Header className="bg-white p-0 flex items-center">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg w-16 h-16"
          />
          <Title level={3} className="mb-0 text-cafe-800">Admin Panel</Title>
        </Header>
        <Content className="p-6 bg-gray-50">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;