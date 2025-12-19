import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { testBackendConnection } from '../utils/api';
import { debugLogin } from '../utils/debugLogin';
import toast from 'react-hot-toast';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkBackend = async () => {
      console.log('🔄 Checking backend status...');
      setBackendStatus('checking');
      
      const isConnected = await testBackendConnection();
      
      if (isConnected) {
        console.log('✅ Backend is connected');
        setBackendStatus('connected');
        toast.success('Backend connected successfully!');
      } else {
        console.log('❌ Backend is disconnected');
        setBackendStatus('disconnected');
        toast.error('Backend server is not reachable at https://ovenaura-server.onrender.com');
        
        // Retry after 3 seconds
        setTimeout(() => {
          console.log('🔄 Retrying backend connection...');
          checkBackend();
        }, 3000);
      }
    };
    
    checkBackend();
  }, []);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      console.log('🔄 Attempting login with:', values.email);
      
      const user = await login(values.email, values.password);
      
      console.log('✅ Login successful:', user);
      toast.success(`Welcome ${user.role === 'admin' ? 'Admin' : user.name}!`);
      
      // Navigate based on role
      const redirectPath = user.role === 'admin' ? '/admin' : '/user';
      console.log('🔄 Redirecting to:', redirectPath);
      navigate(redirectPath);
      
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Run debug test if login fails
      console.log('🔍 Running debug test...');
      const debugResult = await debugLogin(values.email, values.password);
      
      if (debugResult.success) {
        console.log('🔍 Debug test passed - issue is with axios/context');
        toast.error('Login issue detected. Check console for details.');
      } else {
        console.log('🔍 Debug test failed:', debugResult.error);
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const adminCredentials = { email: 'admin@ovenaura.com', password: 'admin123' };

  return (
    <div className="min-h-screen cafe-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-effect">
        <div className="text-center mb-6">
          <Title level={2} className="text-cafe-800 font-serif">OvenAura</Title>
          <Text className="text-cafe-600">Bakery & Café Management</Text>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Text className={`text-xs ${
              backendStatus === 'connected' ? 'text-green-600' : 
              backendStatus === 'disconnected' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              Backend: {backendStatus === 'connected' ? '✅ Connected' : 
                      backendStatus === 'disconnected' ? '❌ Disconnected' : '🔄 Checking...'}
            </Text>
            {backendStatus === 'disconnected' && (
              <Button 
                size="small" 
                type="link" 
                onClick={async () => {
                  setBackendStatus('checking');
                  const isConnected = await testBackendConnection();
                  setBackendStatus(isConnected ? 'connected' : 'disconnected');
                }}
                className="text-xs p-0 h-auto"
              >
                🔄 Retry
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultActiveKey="user" centered>
          <Tabs.TabPane tab="User Login" key="user">
            <Form name="user-login" onFinish={onFinish} layout="vertical">
              <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Please enter valid email!' }]}>
                <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, message: 'Please enter password!' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} size="large" block className="btn-primary">
                  Login
                </Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Admin Login" key="admin">
            <Form name="admin-login" onFinish={onFinish} layout="vertical" initialValues={adminCredentials}>
              <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
                <Input prefix={<UserOutlined />} placeholder="Admin Email" size="large" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Admin Password" size="large" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} size="large" block className="btn-secondary">
                  Admin Login
                </Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>
        </Tabs>

        <div className="text-center mt-4">
          <Text>Don't have an account? </Text>
          <Link to="/register" className="text-primary-600 hover:text-primary-700">Sign up</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;