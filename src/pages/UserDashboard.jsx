import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Input, Select, Button, Image, Typography, Tag, Spin } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const UserDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'cupcakes', label: 'Cupcakes' },
    { value: 'cookies', label: 'Cookies' },
    { value: 'pastries', label: 'Pastries' },
    { value: 'burgers', label: 'Burgers' },
    { value: 'pizzas', label: 'Pizzas' },
    { value: 'breads', label: 'Breads' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory]);
  
  // Initial load without filters
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      
      const response = await api.get('/products', { params });
      const productsData = response.data.data || response.data || [];
      setProducts(productsData);
    } catch (error) {
      console.error('Products fetch error:', error);
      toast.error('Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product._id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Cart error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add to cart';
      toast.error(errorMsg);
    }
  };

  const filteredProducts = (products || []).filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <Title level={2} className="text-cafe-800 font-serif mb-0">Our Menu</Title>
                <Text className="text-gray-600">Discover our delicious bakery items and café specialties</Text>
              </div>
              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate('/menu')}
              >
                Browse Categories
              </Button>
            </div>
          </div>

          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search products..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="large"
              className="flex-1"
            />
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              size="large"
              className="w-full md:w-48"
            >
              {categories.map(cat => (
                <Option key={cat.value} value={cat.value}>{cat.label}</Option>
              ))}
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {filteredProducts.map(product => (
              <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
                <Card
                  hoverable
                  className="card-hover h-full"
                  cover={
                    <div className="h-48 overflow-hidden">
                      <Image
                        alt={product.name}
                        src={product.image}
                        className="w-full h-full object-cover"
                        preview={false}
                      />
                    </div>
                  }
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      View
                    </Button>,
                    <Button
                      type="text"
                      icon={<ShoppingCartOutlined />}
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </Button>
                  ]}
                >
                  <Card.Meta
                    title={<span className="text-cafe-800">{product.name}</span>}
                    description={
                      <div>
                        <Text className="text-gray-600 text-sm block mb-2">
                          {product.description.substring(0, 60)}...
                        </Text>
                        <div className="flex justify-between items-center">
                          <Text strong className="text-primary-600 text-lg">₹{product.price}</Text>
                          <Tag color={product.stock > 10 ? 'green' : 'orange'}>
                            {product.stock > 10 ? 'In Stock' : 'Low Stock'}
                          </Tag>
                        </div>
                      </div>
                    }
                  />
                </Card>
                </Col>
              ))}
            </Row>
          )}

          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-12">
              <Text className="text-gray-500">No products found</Text>
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default UserDashboard;