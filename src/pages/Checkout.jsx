import React, { useState } from 'react';
import { Layout, Card, Form, Input, Button, Typography, List, Divider, Steps } from 'antd';
import { CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Step } = Steps;

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart, loading: cartLoading } = useCart();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [orderData, setOrderData] = useState(null);

  // Handle loading state
  if (cartLoading) {
    return (
      <Layout className="min-h-screen">
        <Navbar />
        <Content className="p-6 bg-gray-50">
          <div className="flex justify-center items-center min-h-96">
            <div>Loading checkout...</div>
          </div>
        </Content>
      </Layout>
    );
  }

  // Handle empty cart
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Layout className="min-h-screen">
        <Navbar />
        <Content className="p-6 bg-gray-50">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <Title level={3} className="text-cafe-800">Your cart is empty</Title>
              <Text className="text-gray-600 block mb-6">
                Add some items to your cart before proceeding to checkout.
              </Text>
              <Button type="primary" onClick={() => navigate('/dashboard')}>
                Start Shopping
              </Button>
            </Card>
          </div>
        </Content>
      </Layout>
    );
  }

  const onFinish = async (values) => {
    try {
      setLoading(true);
      
      const orderPayload = {
        items: cart.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: cart.totalAmount,
        customerName: values.customerName,
        phoneNumber: values.phoneNumber
      };
      
      const response = await api.post('/orders', orderPayload);
      setOrderData(response.data.data);
      setCurrentStep(1);
      await clearCart();
      
      // Trigger analytics refresh
      window.dispatchEvent(new CustomEvent('orderUpdated'));
      
      toast.success('Order placed successfully!');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to place order';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (currentStep === 1) {
    return (
      <Layout className="min-h-screen">
        <Navbar />
        <Content className="p-6 bg-gray-50">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
              <Title level={2} className="text-green-600">Order Confirmed!</Title>
              <Text className="text-lg mb-4 block">
                Your pickup order has been placed successfully.
              </Text>
              <Text className="text-gray-600 block mb-6">
                Order ID: {orderData?._id}
              </Text>
              <div className="space-x-4">
                <Button type="primary" onClick={() => navigate('/orders')}>
                  View Orders
                </Button>
                <Button onClick={() => navigate('/dashboard')}>
                  Continue Shopping
                </Button>
              </div>
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
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/cart')}
            className="mb-4"
          >
            Back to Cart
          </Button>

          <Title level={2} className="text-cafe-800 font-serif mb-6">Checkout</Title>

          <Steps current={currentStep} className="mb-8">
            <Step title="Pickup Details" />
            <Step title="Order Confirmed" />
          </Steps>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Card title="Pickup Information">
                <Form layout="vertical" onFinish={onFinish}>
                  <Form.Item
                    name="customerName"
                    label="Customer Name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                  >
                    <Input placeholder="Enter your full name" />
                  </Form.Item>

                  <Form.Item
                    name="phoneNumber"
                    label="Phone Number"
                    rules={[{ required: true, message: 'Please enter your phone number' }]}
                  >
                    <Input placeholder="Enter your phone number" />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      size="large"
                      className="w-full btn-primary"
                    >
                      Place Order
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </div>

            <div>
              <Card title="Order Summary">
                <List
                  dataSource={cart?.items || []}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <img
                            src={item?.product?.image || '/placeholder.jpg'}
                            alt={item?.product?.name || 'Product'}
                            className="w-12 h-12 object-cover rounded"
                          />
                        }
                        title={item?.product?.name || 'Unknown Product'}
                        description={
                          <div>
                            {item?.size && <div>Size: {item.size}</div>}
                            {item?.toppings?.length > 0 && (
                              <div>Toppings: {item.toppings.join(', ')}</div>
                            )}
                            <div>Quantity: {item?.quantity || 1}</div>
                          </div>
                        }
                      />
                      <div>
                        <Text strong>₹{(item?.price || 0) * (item?.quantity || 1)}</Text>
                      </div>
                    </List.Item>
                  )}
                />
                <Divider />
                <div className="flex justify-between items-center">
                  <Text strong className="text-lg">Total Amount:</Text>
                  <Text strong className="text-xl text-primary-600">₹{cart?.totalAmount || 0}</Text>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default Checkout;