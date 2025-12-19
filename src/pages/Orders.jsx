import React, { useState, useEffect } from 'react';
import { Layout, Card, List, Typography, Tag, Button, Empty, Timeline } from 'antd';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

const { Content } = Layout;
const { Title, Text } = Typography;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      confirmed: 'blue',
      preparing: 'purple',
      ready: 'green',
      delivered: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusSteps = (status) => {
    const steps = [
      { title: 'Order Placed', status: 'pending' },
      { title: 'Confirmed', status: 'confirmed' },
      { title: 'Preparing', status: 'preparing' },
      { title: 'Ready for Pickup', status: 'ready' },
      { title: 'Delivered', status: 'delivered' }
    ];

    const currentIndex = steps.findIndex(step => step.status === status);
    return steps.map((step, index) => ({
      ...step,
      color: index <= currentIndex ? 'green' : 'gray'
    }));
  };

  const downloadOrderReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Order History Report', 20, 20);
    
    let yPosition = 40;
    orders.forEach((order, index) => {
      doc.setFontSize(12);
      doc.text(`Order ${index + 1}:`, 20, yPosition);
      doc.text(`ID: ${order._id}`, 20, yPosition + 10);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, yPosition + 20);
      doc.text(`Status: ${order.status}`, 20, yPosition + 30);
      doc.text(`Total: ₹${order.totalAmount}`, 20, yPosition + 40);
      yPosition += 60;
      
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
    });
    
    doc.save('order-history.pdf');
    toast.success('Report downloaded successfully!');
  };

  if (orders.length === 0 && !loading) {
    return (
      <Layout className="min-h-screen">
        <Navbar />
        <Content className="p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <Card>
              <Empty
                description="No orders found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Title level={2} className="text-cafe-800 font-serif">My Orders</Title>
            <Button
              icon={<DownloadOutlined />}
              onClick={downloadOrderReport}
              className="btn-primary"
            >
              Download Report
            </Button>
          </div>

          <List
            dataSource={orders}
            renderItem={(order) => (
              <Card className="mb-4" key={order._id}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Text strong className="text-lg">Order #{order._id.slice(-8)}</Text>
                        <div className="text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Tag color={getStatusColor(order.status)} className="text-sm px-3 py-1">
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Tag>
                    </div>

                    <List
                      size="small"
                      dataSource={order.items}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            }
                            title={item.product.name}
                            description={
                              <div>
                                {item.size && <span>Size: {item.size} | </span>}
                                Qty: {item.quantity} | ₹{item.price}
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between">
                        <Text strong>Total Amount:</Text>
                        <Text strong className="text-primary-600 text-lg">₹{order.totalAmount}</Text>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Title level={5} className="mb-4">Order Tracking</Title>
                    <Timeline size="small">
                      {getStatusSteps(order.status).map((step, index) => (
                        <Timeline.Item key={index} color={step.color}>
                          <Text className={step.color === 'green' ? 'text-green-600' : 'text-gray-400'}>
                            {step.title}
                          </Text>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </div>
                </div>
              </Card>
            )}
          />
        </div>
      </Content>
    </Layout>
  );
};

export default Orders;