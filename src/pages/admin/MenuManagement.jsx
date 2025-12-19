import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, InputNumber, Typography, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const { Title } = Typography;
const { TextArea } = Input;

const MenuManagement = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/menu/categories');
      setCategories(response.data.data);
      if (response.data.data.length > 0) {
        fetchItemsByCategory(response.data.data[0]._id);
      }
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchItemsByCategory = async (categoryId) => {
    try {
      setLoading(true);
      const response = await api.get(`/menu/category/${categoryId}/items`);
      setItems(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Process sizes and toppings
      const processedValues = {
        ...values,
        sizes: values.sizes ? values.sizes.map(size => ({
          size: size.size,
          price: Number(size.price)
        })) : [],
        toppings: values.toppings ? values.toppings.map(topping => ({
          name: topping.name,
          price: Number(topping.price),
          category: topping.category
        })) : []
      };

      if (editingItem) {
        await api.put(`/menu/items/${editingItem._id}`, processedValues);
        toast.success('Item updated successfully');
      } else {
        await api.post('/menu/items', processedValues);
        toast.success('Item created successfully');
      }
      
      setModalVisible(false);
      setEditingItem(null);
      form.resetFields();
      
      // Refresh items for current category
      if (categories.length > 0) {
        fetchItemsByCategory(categories[0]._id);
      }
    } catch (error) {
      toast.error('Failed to save item');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/menu/items/${id}`);
      toast.success('Item deleted successfully');
      
      // Refresh items
      if (categories.length > 0) {
        fetchItemsByCategory(categories[0]._id);
      }
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <img src={image} alt="Item" className="w-12 h-12 object-cover rounded" />
      )
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      key: 'category'
    },
    {
      title: 'Subcategory',
      dataIndex: 'subcategory',
      key: 'subcategory'
    },
    {
      title: 'Type',
      dataIndex: 'itemType',
      key: 'itemType',
      render: (type) => (
        <Tag color={type === 'veg' ? 'green' : type === 'non-veg' ? 'red' : 'blue'}>
          {type?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Price',
      key: 'price',
      render: (_, record) => {
        if (record.sizes && record.sizes.length > 0) {
          const prices = record.sizes.map(s => s.price);
          return `₹${Math.min(...prices)} - ₹${Math.max(...prices)}`;
        }
        return `₹${record.price}`;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingItem(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title="Delete item?"
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
        <Title level={2}>Menu Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingItem(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Add Item
        </Button>
      </div>

      <div className="mb-4">
        <Select
          placeholder="Select Category"
          style={{ width: 200 }}
          onChange={fetchItemsByCategory}
          defaultValue={categories[0]?._id}
        >
          {categories.map(cat => (
            <Select.Option key={cat._id} value={cat._id}>
              {cat.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={items}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingItem ? 'Edit Item' : 'Add Item'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingItem(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          
          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>
          
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select>
              {categories.map(cat => (
                <Select.Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="subcategory" label="Subcategory">
            <Input />
          </Form.Item>
          
          <Form.Item name="itemType" label="Item Type">
            <Select>
              <Select.Option value="classic">Classic</Select.Option>
              <Select.Option value="veg">Vegetarian</Select.Option>
              <Select.Option value="non-veg">Non-Vegetarian</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="price" label="Price (for single price items)">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          
          <Form.Item name="image" label="Image URL">
            <Input />
          </Form.Item>
          
          <Form.Item name="stock" label="Stock">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingItem ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuManagement;