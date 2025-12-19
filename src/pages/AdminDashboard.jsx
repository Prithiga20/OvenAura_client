import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Statistic, Table, Button, Typography } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined, ShoppingOutlined, UserOutlined, FileTextOutlined, WarningOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AdminSidebar from '../components/AdminSidebar';
import api from '../utils/api';
import toast from 'react-hot-toast';

const { Header, Content } = Layout;
const { Title } = Typography;

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/reports/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: '_id',
      key: '_id',
      render: (id) => `#${id.slice(-8)}`
    },
    {
      title: 'Customer',
      dataIndex: ['user', 'name'],
      key: 'customer'
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => items.length
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'total',
      render: (amount) => `₹${amount}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => status.charAt(0).toUpperCase() + status.slice(1)
    }
  ];

  const salesData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 }
  ];

  const categoryData = [
    { name: 'Cupcakes', value: 400, color: '#8884d8' },
    { name: 'Cookies', value: 300, color: '#82ca9d' },
    { name: 'Pastries', value: 300, color: '#ffc658' },
    { name: 'Burgers', value: 200, color: '#ff7300' }
  ];

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
          <Title level={3} className="mb-0 text-cafe-800">Dashboard</Title>
        </Header>

        <Content className="p-6 bg-gray-50">
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Products"
                  value={dashboardData.totalProducts || 0}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Orders"
                  value={dashboardData.totalOrders || 0}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Users"
                  value={dashboardData.totalUsers || 0}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Low Stock Items"
                  value={dashboardData.lowStockProducts || 0}
                  prefix={<WarningOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} lg={12}>
              <Card title="Weekly Sales">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#d97706" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Category Distribution">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <Card title="Recent Orders">
            <Table
              columns={orderColumns}
              dataSource={dashboardData.recentOrders || []}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;