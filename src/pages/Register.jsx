import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const { Title, Text } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await register(values);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen cafe-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-effect">
        <div className="text-center mb-6">
          <Title level={2} className="text-cafe-800 font-serif">Join OvenAura</Title>
          <Text className="text-cafe-600">Create your account</Text>
        </div>

        <Form name="register" onFinish={onFinish} layout="vertical">
          <Form.Item name="name" rules={[{ required: true, message: 'Please enter your name!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Full Name" size="large" />
          </Form.Item>
          
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Please enter valid email!' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          
          <Form.Item name="phone" rules={[{ required: true, message: 'Please enter phone number!' }]}>
            <Input prefix={<PhoneOutlined />} placeholder="Phone Number" size="large" />
          </Form.Item>
          
          <Form.Item name="password" rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large" block className="btn-primary">
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <Text>Already have an account? </Text>
          <Link to="/login" className="text-primary-600 hover:text-primary-700">Sign in</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;