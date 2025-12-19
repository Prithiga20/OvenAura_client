import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography } from 'antd';
import { ShoppingOutlined, UserOutlined, FileTextOutlined, WarningOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const { Title } = Typography;

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/stats');
      setDashboardData(response.data.data);
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
      render: (items) => items?.length || 0
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
      render: (status) => status?.charAt(0).toUpperCase() + status?.slice(1)
    }
  ];

  const salesData = dashboardData.salesData?.map(item => ({
    name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][item._id - 1],
    sales: item.sales
  })) || [];

  const categoryData = dashboardData.categoryData?.map((item, index) => ({
    name: item._id,
    value: item.count,
    color: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'][index % 5]
  })) || [];

  return (
    <div>
      <Title level={2} className="mb-6">Dashboard</Title>
      
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={dashboardData.totalProducts || 0}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#3f8600' }}
              loading={loading}
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
              loading={loading}
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
              loading={loading}
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
              loading={loading}
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
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default Dashboard;