import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Typography, Select, Space } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const { Title } = Typography;

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/admin');
      setOrders(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      confirmed: 'blue',
      preparing: 'purple',
      ready: 'cyan',
      delivered: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'default';
  };

  const columns = [
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
      title: 'Email',
      dataIndex: ['user', 'email'],
      key: 'email'
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => items?.length || 0
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `₹${amount}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Order Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Select
            value={record.status}
            onChange={(status) => updateOrderStatus(record._id, status)}
            style={{ width: 120 }}
          >
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="confirmed">Confirmed</Select.Option>
            <Select.Option value="preparing">Preparing</Select.Option>
            <Select.Option value="ready">Ready</Select.Option>
            <Select.Option value="delivered">Delivered</Select.Option>
            <Select.Option value="cancelled">Cancelled</Select.Option>
          </Select>
        </Space>
      )
    }
  ];

  const expandedRowRender = (record) => {
    const itemColumns = [
      {
        title: 'Product',
        dataIndex: ['product', 'name'],
        key: 'product'
      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        key: 'quantity'
      },
      {
        title: 'Price',
        dataIndex: 'price',
        key: 'price',
        render: (price) => `₹${price}`
      },
      {
        title: 'Total',
        key: 'total',
        render: (_, item) => `₹${item.quantity * item.price}`
      }
    ];

    return (
      <Table
        columns={itemColumns}
        dataSource={record.items}
        pagination={false}
        rowKey={(item, index) => index}
      />
    );
  };

  return (
    <div>
      <Title level={2} className="mb-6">Orders Management</Title>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender,
          rowExpandable: (record) => record.items?.length > 0
        }}
      />
    </div>
  );
};

export default OrdersPage;