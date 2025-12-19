import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, DatePicker, Button, Table, Statistic, Empty } from 'antd';
import { DownloadOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const ReportsPage = () => {
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/analytics');
      setAnalytics(response.data.data || {});
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const salesData = analytics.monthlySales || [];
  const topProducts = analytics.topProducts || [];
  
  const refreshAnalytics = () => {
    fetchAnalytics();
  };

  const productColumns = [
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Units Sold',
      dataIndex: 'sales',
      key: 'sales'
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue) => `₹${revenue.toLocaleString()}`
    }
  ];

  const downloadReport = (format) => {
    toast.success(`Downloading ${format.toUpperCase()} report...`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Reports & Analytics</Title>
        <div className="flex gap-2">
          <Button 
            icon={<FileExcelOutlined />} 
            onClick={() => downloadReport('excel')}
          >
            Excel
          </Button>
          <Button 
            icon={<FilePdfOutlined />} 
            onClick={() => downloadReport('pdf')}
          >
            PDF
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <Card>
            <div className="flex justify-between items-center mb-4">
              <Title level={4}>Filter Reports</Title>
              <RangePicker 
                onChange={setDateRange}
                className="mr-2"
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={analytics.totalRevenue || 0}
              prefix="₹"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={analytics.totalOrders || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Today Orders"
              value={analytics.todayOrders || 0}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Orders"
              value={analytics.pendingOrders || 0}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card 
            title="Monthly Sales Trend" 
            extra={
              <Button size="small" onClick={refreshAnalytics} loading={loading}>
                Refresh
              </Button>
            }
          >
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value}`, 'Sales']} />
                  <Line type="monotone" dataKey="sales" stroke="#d97706" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No sales data available
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="Monthly Orders"
            extra={
              <Button size="small" onClick={refreshAnalytics} loading={loading}>
                Refresh
              </Button>
            }
          >
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#1890ff" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No order data available
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title="Top Selling Products"
            extra={
              <Button size="small" onClick={refreshAnalytics} loading={loading}>
                Refresh
              </Button>
            }
          >
            <Table
              columns={productColumns}
              dataSource={topProducts}
              rowKey={(record, index) => record.name || index}
              pagination={false}
              locale={{
                emptyText: 'No product sales data available'
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReportsPage;