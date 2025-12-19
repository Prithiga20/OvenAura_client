import React from 'react';
import { Layout, Card, List, Button, InputNumber, Typography, Empty, Divider } from 'antd';
import { DeleteOutlined, ShoppingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const { Content } = Layout;
const { Title, Text } = Typography;

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateCartItem, removeFromCart, loading } = useCart();

  const handleQuantityChange = async (itemId, quantity) => {
    try {
      await updateCartItem(itemId, quantity);
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (loading) {
    return (
      <Layout className="min-h-screen">
        <Navbar />
        <Content className="p-6 bg-gray-50">
          <div className="flex justify-center items-center min-h-96">
            <div>Loading cart...</div>
          </div>
        </Content>
      </Layout>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Layout className="min-h-screen">
        <Navbar />
        <Content className="p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/dashboard')}
              className="mb-4"
            >
              Back to Products
            </Button>
            <Card>
              <Empty
                description="Your cart is empty"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={() => navigate('/dashboard')}>
                  Start Shopping
                </Button>
              </Empty>
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
        <div className="max-w-4xl mx-auto">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            Back to Products
          </Button>

          <Title level={2} className="text-cafe-800 font-serif mb-6">Shopping Cart</Title>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <List
                  dataSource={cart?.items || []}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <InputNumber
                          min={1}
                          value={item.quantity}
                          onChange={(value) => handleQuantityChange(item._id, value)}
                          size="small"
                        />,
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveItem(item._id)}
                        />
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <img
                            src={item?.product?.image || '/placeholder.jpg'}
                            alt={item?.product?.name || 'Product'}
                            className="w-16 h-16 object-cover rounded"
                          />
                        }
                        title={item?.product?.name || 'Unknown Product'}
                        description={
                          <div>
                            <Text className="text-gray-600">{item?.product?.description || ''}</Text>
                            {item?.size && <div><Text strong>Size:</Text> {item.size}</div>}
                            {item?.toppings?.length > 0 && (
                              <div><Text strong>Toppings:</Text> {item.toppings.join(', ')}</div>
                            )}
                            <div className="mt-2">
                              <Text strong className="text-primary-600">₹{item?.price || 0} × {item?.quantity || 1}</Text>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </div>

            <div>
              <Card title="Order Summary">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Text>Items ({cart?.items?.length || 0}):</Text>
                    <Text>₹{cart?.totalAmount || 0}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text>Delivery:</Text>
                    <Text>Free</Text>
                  </div>
                  <Divider />
                  <div className="flex justify-between">
                    <Text strong className="text-lg">Total:</Text>
                    <Text strong className="text-lg text-primary-600">₹{cart?.totalAmount || 0}</Text>
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingOutlined />}
                    onClick={() => navigate('/checkout')}
                    className="w-full btn-primary mt-4"
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default Cart;