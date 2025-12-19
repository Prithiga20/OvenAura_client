import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, Typography, Modal, Form, Input, InputNumber, Select, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const { Title } = Typography;

const StaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await api.get('/staff');
      setStaff(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/staff/${id}`);
      toast.success('Staff deleted successfully');
      fetchStaff();
    } catch (error) {
      toast.error('Failed to delete staff');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingStaff) {
        await api.put(`/staff/${editingStaff._id}`, values);
        toast.success('Staff updated successfully');
      } else {
        await api.post('/staff', values);
        toast.success('Staff created successfully');
      }
      setModalVisible(false);
      setEditingStaff(null);
      form.resetFields();
      fetchStaff();
    } catch (error) {
      toast.error('Failed to save staff');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      render: (position) => position?.charAt(0).toUpperCase() + position?.slice(1)
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => dept?.charAt(0).toUpperCase() + dept?.slice(1)
    },
    {
      title: 'Salary',
      dataIndex: 'salary',
      key: 'salary',
      render: (salary) => `₹${salary?.toLocaleString()}`
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <span className={isActive ? 'text-green-500' : 'text-red-500'}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingStaff(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title="Delete staff member?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Staff Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingStaff(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Add Staff
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={staff}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingStaff ? 'Edit Staff' : 'Add Staff'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingStaff(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="position" label="Position" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="baker">Baker</Select.Option>
              <Select.Option value="cashier">Cashier</Select.Option>
              <Select.Option value="manager">Manager</Select.Option>
              <Select.Option value="chef">Chef</Select.Option>
              <Select.Option value="waiter">Waiter</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="department" label="Department" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="kitchen">Kitchen</Select.Option>
              <Select.Option value="front-desk">Front Desk</Select.Option>
              <Select.Option value="management">Management</Select.Option>
              <Select.Option value="delivery">Delivery</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="salary" label="Salary" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingStaff ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffPage;