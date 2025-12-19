import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Typography, Tabs, Button, Tag, Spin } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const { Content } = Layout;
const { Title, Text } = Typography;

const BrowseMenu = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('bakery');
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const categories = [
    { 
      key: 'bakery', 
      label: '🍰 Bakery Items',
      subcategories: ['cupcakes', 'cookies', 'pastries']
    },
    { 
      key: 'burgers', 
      label: '🍔 Burgers',
      subcategories: ['classic', 'veg', 'non-veg']
    },
    { 
      key: 'pizzas', 
      label: '🍕 Pizzas',
      subcategories: ['classic', 'veg', 'non-veg']
    },
    { 
      key: 'breads', 
      label: '🍞 Breads',
      subcategories: []
    }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      const productsData = response.data.data || response.data || [];
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch menu items');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      console.log('Product ID for navigation:', product._id);
      
      // For pizzas and burgers with toppings/sizes, navigate to details for customization
      if ((product.category === 'pizzas' || product.category === 'burgers') && 
          (product.toppings?.length > 0 || product.sizes?.length > 0)) {
        navigate(`/product/${product._id}`);
        return;
      }
      
      // For simple items, add directly to cart
      await addToCart(product._id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Cart error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add to cart';
      toast.error(errorMsg);
    }
  };

  const getProductsByCategory = (category) => {
    return products.filter(product => product.category === category);
  };

  const getProductsBySubcategory = (category, subcategory) => {
    return products.filter(product => 
      product.category === category && product.subcategory === subcategory
    );
  };

  const formatPrice = (product) => {
    if (product.sizes && product.sizes.length > 0) {
      const prices = product.sizes.map(size => size.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      return minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`;
    }
    return `₹${product.price}`;
  };

  const renderProductCard = (product) => (
    <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
      <Card
        hoverable
        className="h-full"
        cover={
          <div className="h-48 overflow-hidden">
            <img
              alt={product.name}
              src={product.image}
              className="w-full h-full object-cover"
            />
          </div>
        }
        actions={[
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              console.log('Navigating to product:', product._id);
              navigate(`/product/${product._id}`);
            }}
          >
            View
          </Button>,
          <Button
            type="text"
            icon={<ShoppingCartOutlined />}
            onClick={() => handleAddToCart(product)}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : 
             (product.category === 'pizzas' || product.category === 'burgers') && 
             (product.toppings?.length > 0 || product.sizes?.length > 0) ? 'Customize' : 'Add to Cart'}
          </Button>
        ]}
      >
        <Card.Meta
          title={
            <div className="flex justify-between items-start">
              <span className="text-cafe-800">{product.name}</span>
              {((product.category === 'pizzas' || product.category === 'burgers') && 
                (product.toppings?.length > 0 || product.sizes?.length > 0)) && (
                <Tag color="orange" className="text-xs">Customizable</Tag>
              )}
            </div>
          }
          description={
            <div>
              <Text className="text-gray-600 text-sm block mb-2">
                {product.description}
              </Text>
              <div className="flex justify-between items-center">
                <Text strong className="text-primary-600 text-lg">
                  {formatPrice(product)}
                </Text>
                <Tag color={product.stock === 0 ? 'red' : product.stock > 10 ? 'green' : 'orange'}>
                  {product.stock === 0 ? 'Out of Stock' : product.stock > 10 ? 'In Stock' : 'Low Stock'}
                </Tag>
              </div>
            </div>
          }
        />
      </Card>
    </Col>
  );

  const renderCategoryContent = (category) => {
    const categoryProducts = getProductsByCategory(category.key);
    
    if (categoryProducts.length === 0) {
      return (
        <div className="text-center py-12">
          <Text className="text-gray-500">No items available in this category</Text>
        </div>
      );
    }

    // If category has subcategories, group by them
    if (category.subcategories.length > 0) {
      return (
        <div className="space-y-8">
          {category.subcategories.map(subcategory => {
            const subcategoryProducts = getProductsBySubcategory(category.key, subcategory);
            
            if (subcategoryProducts.length === 0) return null;
            
            return (
              <div key={subcategory}>
                <Title level={3} className="text-cafe-800 capitalize mb-4">
                  {subcategory}
                </Title>
                <Row gutter={[16, 16]}>
                  {subcategoryProducts.map(renderProductCard)}
                </Row>
              </div>
            );
          })}
        </div>
      );
    }

    // For categories without subcategories (like breads)
    return (
      <Row gutter={[16, 16]}>
        {categoryProducts.map(renderProductCard)}
      </Row>
    );
  };

  if (loading) {
    return (
      <Layout className="min-h-screen">
        <Navbar />
        <Content className="flex justify-center items-center">
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <Title level={1} className="text-cafe-800 font-serif">
              Our Complete Menu
            </Title>
            <Text className="text-lg text-cafe-600">
              Discover our delicious range of bakery items, burgers, pizzas, and breads
            </Text>
          </div>

          <Tabs
            activeKey={activeCategory}
            onChange={setActiveCategory}
            size="large"
            className="mb-6"
            items={categories.map(category => ({
              key: category.key,
              label: category.label,
              children: renderCategoryContent(category)
            }))}
          />
        </div>
      </Content>
    </Layout>
  );
};

export default BrowseMenu;