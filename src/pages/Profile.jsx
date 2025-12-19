import React, { useState } from 'react';
import { Layout, Card, Form, Input, Button, Typography } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const { Content } = Layout;
const { Title } = Typography;

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await updateProfile(values);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="p-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <Title level={2} className="text-cafe-800 font-serif mb-6">My Profile</Title>
          
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                name: user?.name,
                email: user?.email,
                phone: user?.phone
              }}
            >
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter your name!' }]}
              >
                <Input prefix={<UserOutlined />} size="large" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input prefix={<MailOutlined />} size="large" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter your phone number!' }]}
              >
                <Input prefix={<PhoneOutlined />} size="large" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  className="btn-primary"
                >
                  Update Profile
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default Profile;