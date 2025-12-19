import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Tabs, Spin, Tag } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const { Title, Text } = Typography;

const CategoryItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { categoryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const categoryName = location.state?.categoryName || 'Menu Items';

  useEffect(() => {
    fetchItems();
  }, [categoryId, activeTab]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      console.log('Fetching items for category:', categoryId);
      
      const response = await api.get('/products');
      const allProducts = response.data.data || response.data || [];
      
      console.log('CategoryItems API response:', {
        total: allProducts.length,
        categoryId
      });
      
      // Filter by category name (categoryId is actually category name from URL)
      let filteredItems = allProducts;
      if (categoryId) {
        filteredItems = allProducts.filter(product => 
          product.category && product.category.toLowerCase() === categoryId.toLowerCase()
        );
      }
      
      // Further filter by subcategory if activeTab is not 'all'
      if (activeTab !== 'all') {
        filteredItems = filteredItems.filter(product => 
          product.subcategory === activeTab
        );
      }
      
      console.log('Filtered items for category:', filteredItems.length);
      setItems(filteredItems);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      toast.error('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    console.log('Navigating to product:', item._id, item.name);
    navigate(`/product/${item._id}`, { 
      state: { item, categoryName } 
    });
  };

  const handleAddToCart = async (item, e) => {
    e.stopPropagation();
    try {
      console.log('Adding to cart - Product ID:', item._id, 'Product:', item.name);
      await addToCart(item._id, 1);
      toast.success(`${item.name} added to cart!`);
    } catch (error) {
      console.error('Cart error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add to cart';
      toast.error(errorMsg);
    }
  };

  const getPrice = (item) => {
    if (item.sizes && item.sizes.length > 0) {
      const minPrice = Math.min(...item.sizes.map(s => s.price));
      const maxPrice = Math.max(...item.sizes.map(s => s.price));
      return minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`;
    }
    return `₹${item.price}`;
  };

  // Get unique subcategories for tabs
  const subcategories = [...new Set(items.map(item => item.subcategory).filter(Boolean))];

  const tabItems = [
    { key: 'all', label: 'All Items' },
    ...subcategories.map(sub => ({
      key: sub,
      label: sub.charAt(0).toUpperCase() + sub.slice(1)
    }))
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/menu')}
            className="mb-4"
          >
            Back to Menu
          </Button>
          
          <Title level={1} className="text-cafe-800 font-serif mb-2">
            {categoryName}
          </Title>
          <Text className="text-lg text-cafe-600">
            Choose from our delicious {categoryName.toLowerCase()}
          </Text>
        </div>

        {subcategories.length > 0 && (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="mb-6"
          />
        )}

        <Row gutter={[24, 24]}>
          {items.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item._id}>
              <Card
                hoverable
                className="h-full cursor-pointer"
                cover={
                  <img
                    alt={item.name}
                    src={item.image}
                    className="h-48 object-cover"
                  />
                }
                onClick={() => handleItemClick(item)}
                actions={[
                  <Button 
                    type="primary" 
                    icon={<ShoppingCartOutlined />}
                    onClick={(e) => handleAddToCart(item, e)}
                    disabled={item.stock === 0}
                  >
                    {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                ]}
              >
                <Card.Meta
                  title={
                    <div className="flex justify-between items-start">
                      <Title level={5} className="text-cafe-800 mb-1">
                        {item.name}
                      </Title>
                      <div className="flex gap-2">
                        {item.itemType && (
                          <Tag color={item.itemType === 'veg' ? 'green' : 'red'}>
                            {item.itemType}
                          </Tag>
                        )}
                        <Tag color={item.stock === 0 ? 'red' : item.stock > 10 ? 'green' : 'orange'}>
                          {item.stock === 0 ? 'Out of Stock' : item.stock > 10 ? 'In Stock' : 'Low Stock'}
                        </Tag>
                      </div>
                    </div>
                  }
                  description={
                    <div>
                      <Text className="text-cafe-600 block mb-2">
                        {item.description}
                      </Text>
                      <Text strong className="text-primary-600 text-lg">
                        {getPrice(item)}
                      </Text>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>

        {items.length === 0 && (
          <div className="text-center py-12">
            <Text className="text-lg text-gray-500">
              No items found in this category
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryItems;