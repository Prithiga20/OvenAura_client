import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const { Title, Text } = Typography;

const Menu = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('Fetching products for categories...');
      const response = await api.get('/products');
      const products = response.data.data || response.data || [];
      
      console.log('Fetched products for menu:', products.length);
      
      // Group products by category
      const categoryMap = {};
      products.forEach(product => {
        if (product.category && !categoryMap[product.category]) {
          categoryMap[product.category] = {
            _id: product.category,
            name: product.category.charAt(0).toUpperCase() + product.category.slice(1),
            description: `Delicious ${product.category}`,
            image: product.image || 'https://images.unsplash.com/photo-1555507036-ab794f4afe5b?w=500',
            count: 0
          };
        }
        if (product.category) {
          categoryMap[product.category].count++;
        }
      });
      
      const categoriesArray = Object.values(categoryMap);
      console.log('Created categories:', categoriesArray.length, categoriesArray.map(c => `${c.name} (${c.count})`));
      
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    console.log('Navigating to category:', category.name);
    navigate(`/menu/category/${category.name.toLowerCase()}`, { 
      state: { categoryName: category.name, categorySlug: category.name.toLowerCase() } 
    });
  };

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
        <div className="text-center mb-8">
          <Title level={1} className="text-cafe-800 font-serif">
            Our Menu
          </Title>
          <Text className="text-lg text-cafe-600">
            Discover our delicious range of bakery items, burgers, pizzas, and breads
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {categories.map((category) => (
            <Col xs={24} sm={12} lg={6} key={category._id}>
              <Card
                hoverable
                className="h-full cursor-pointer transform transition-transform hover:scale-105"
                cover={
                  <img
                    alt={category.name}
                    src={category.image}
                    className="h-48 object-cover"
                  />
                }
                onClick={() => handleCategoryClick(category)}
              >
                <Card.Meta
                  title={
                    <Title level={4} className="text-cafe-800 mb-2">
                      {category.name}
                    </Title>
                  }
                  description={
                    <Text className="text-cafe-600">
                      {category.description}
                    </Text>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Menu;