import React from 'react';
import { Layout, Card, Row, Col, Button, Typography } from 'antd';
import { ShoppingOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const { Content } = Layout;
const { Title, Text } = Typography;

const UserHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Title level={1} className="text-cafe-800 font-serif">
              Welcome to OvenAura, {user?.name}!
            </Title>
            <Text className="text-lg text-cafe-600">
              Your favorite bakery and café management system
            </Text>
          </div>

          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                className="text-center h-full"
                onClick={() => navigate('/menu')}
              >
                <MenuOutlined className="text-4xl text-primary-600 mb-4" />
                <Title level={4} className="text-cafe-800">Browse Menu</Title>
                <Text className="text-cafe-600">
                  Explore our delicious bakery items, burgers, pizzas, and breads
                </Text>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                className="text-center h-full"
                onClick={() => navigate('/orders')}
              >
                <ShoppingOutlined className="text-4xl text-primary-600 mb-4" />
                <Title level={4} className="text-cafe-800">My Orders</Title>
                <Text className="text-cafe-600">
                  View your order history and track current orders
                </Text>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                className="text-center h-full"
                onClick={() => navigate('/profile')}
              >
                <UserOutlined className="text-4xl text-primary-600 mb-4" />
                <Title level={4} className="text-cafe-800">My Profile</Title>
                <Text className="text-cafe-600">
                  Manage your account settings and preferences
                </Text>
              </Card>
            </Col>
          </Row>

          <div className="text-center">
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate('/menu')}
              className="mr-4"
            >
              Start Shopping
            </Button>
            <Button 
              size="large"
              onClick={() => navigate('/cart')}
            >
              View Cart
            </Button>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default UserHome;