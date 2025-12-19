import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, Typography, Input, Modal, Form, InputNumber, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const { Title } = Typography;
const { Search } = Input;

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, values);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', values);
        toast.success('Product created successfully');
      }
      setModalVisible(false);
      setEditingProduct(null);
      form.resetFields();
      fetchProducts();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <img src={image} alt="Product" className="w-12 h-12 object-cover rounded" />
      )
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => category?.charAt(0).toUpperCase() + category?.slice(1)
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `₹${price}`
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <span className={stock < 10 ? 'text-red-500' : 'text-green-500'}>
          {stock}
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
              setEditingProduct(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title="Delete product?"
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
        <Title level={2}>Products Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingProduct(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Add Product
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingProduct(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="cupcakes">Cupcakes</Select.Option>
              <Select.Option value="cookies">Cookies</Select.Option>
              <Select.Option value="pastries">Pastries</Select.Option>
              <Select.Option value="burgers">Burgers</Select.Option>
              <Select.Option value="pizzas">Pizzas</Select.Option>
              <Select.Option value="breads">Breads</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="stock" label="Stock" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="image" label="Image URL" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingProduct ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsPage;