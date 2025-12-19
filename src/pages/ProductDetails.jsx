import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, InputNumber, Radio, Checkbox, Row, Col, Tag, Divider } from 'antd';
import { ArrowLeftOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const { Title, Text } = Typography;

const ProductDetails = () => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const categoryName = location.state?.categoryName || 'Menu';

  useEffect(() => {
    fetchItem();
  }, [id]);

  useEffect(() => {
    if (item) {
      calculateTotalPrice();
    }
  }, [item, selectedSize, selectedToppings, quantity]);

  const fetchItem = async () => {
    try {
      console.log('🔄 Fetching product with ID:', id);
      const response = await api.get(`/products/${id}`);
      
      // Handle different response structures
      let product;
      if (response.data.success && response.data.data) {
        product = response.data.data;
      } else if (response.data.data) {
        product = response.data.data;
      } else if (response.data._id) {
        product = response.data;
      } else {
        console.error('❌ Unexpected response structure:', response.data);
        toast.error('Product not found');
        return;
      }
      
      console.log('✅ Product loaded:', product.name);
      console.log('🍕 Toppings available:', product.toppings?.length || 0);
      console.log('📏 Sizes available:', product.sizes?.length || 0);
      
      setItem(product);
      initializeDefaults(product);
    } catch (error) {
      console.error('❌ Error fetching product details:', error);
      
      if (error.response?.status === 404) {
        toast.error('Product not found');
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else {
        toast.error('Failed to load product details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaults = (itemData) => {
    // Set default size for items with sizes
    if (itemData.sizes && itemData.sizes.length > 0) {
      setSelectedSize(itemData.sizes[0].size);
    }
  };

  const calculateTotalPrice = () => {
    if (!item) return;

    let basePrice = item.price || 0;
    
    // If item has sizes, use selected size price
    if (item.sizes && item.sizes.length > 0 && selectedSize) {
      const sizeOption = item.sizes.find(s => s.size === selectedSize);
      basePrice = sizeOption ? sizeOption.price : basePrice;
    }
    
    // Add toppings price
    const toppingsPrice = selectedToppings.reduce((total, toppingName) => {
      const topping = item.toppings?.find(t => t.name === toppingName);
      return total + (topping ? topping.price : 0);
    }, 0);
    
    setTotalPrice((basePrice + toppingsPrice) * quantity);
  };

  const handleToppingChange = (toppingName, checked) => {
    if (checked) {
      setSelectedToppings([...selectedToppings, toppingName]);
    } else {
      setSelectedToppings(selectedToppings.filter(t => t !== toppingName));
    }
  };

  const handleAddToCart = async () => {
    try {
      console.log('Adding to cart - Product ID:', item._id, 'Product:', item.name);
      console.log('Selected options:', { quantity, selectedSize, selectedToppings, totalPrice });
      
      // Prepare toppings data
      const toppingsData = selectedToppings.map(toppingName => {
        const topping = item.toppings?.find(t => t.name === toppingName);
        return { name: toppingName, price: topping?.price || 0 };
      });
      
      // Calculate price per item with customizations
      const customPrice = totalPrice / quantity;
      
      await addToCart(item._id, quantity, selectedSize, toppingsData, customPrice);
      toast.success(`${item.name} added to cart!`);
    } catch (error) {
      console.error('Add to cart error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add to cart';
      
      if (errorMessage.includes('login') || errorMessage.includes('authorization') || errorMessage.includes('token')) {
        toast.error('Please login to add items to cart');
        navigate('/login');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!item) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Title level={3}>Product not found</Title>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const vegToppings = item?.toppings?.filter(t => t.category === 'veg') || [];
  const nonVegToppings = item?.toppings?.filter(t => t.category === 'non-veg') || [];
  const allToppings = item?.toppings || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          Back to {categoryName}
        </Button>

        <Row gutter={[32, 32]}>
          <Col xs={24} md={12}>
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </Col>
          
          <Col xs={24} md={12}>
            <Card className="h-full">
              <div className="flex justify-between items-start mb-4">
                <Title level={2} className="text-cafe-800 mb-0">
                  {item.name}
                </Title>
                {item.itemType && (
                  <Tag color={item.itemType === 'veg' ? 'green' : 'red'} className="text-sm">
                    {item.itemType.toUpperCase()}
                  </Tag>
                )}
              </div>
              
              <Text className="text-cafe-600 text-lg block mb-6">
                {item.description}
              </Text>

              {/* Size Selection */}
              {item.sizes && item.sizes.length > 0 && (
                <div className="mb-6">
                  <Title level={5} className="mb-3">Choose Size:</Title>
                  <Radio.Group 
                    value={selectedSize} 
                    onChange={(e) => setSelectedSize(e.target.value)}
                  >
                    <Row gutter={[16, 16]}>
                      {item.sizes.map((size) => (
                        <Col key={size.size}>
                          <Radio.Button value={size.size} className="h-12 flex items-center">
                            <div className="text-center">
                              <div className="font-medium">{size.size}</div>
                              <div className="text-sm text-gray-500">₹{size.price}</div>
                            </div>
                          </Radio.Button>
                        </Col>
                      ))}
                    </Row>
                  </Radio.Group>
                </div>
              )}

              {/* Toppings Selection */}
              {item.toppings && Array.isArray(item.toppings) && item.toppings.length > 0 && (
                <div className="mb-6">
                  <Title level={5} className="mb-3">Add Toppings:</Title>
                  
                  {vegToppings.length > 0 && (
                    <div className="mb-4">
                      <Text strong className="text-green-600 block mb-2">Vegetarian Toppings:</Text>
                      <Row gutter={[8, 8]}>
                        {vegToppings.map((topping, index) => (
                          <Col key={`veg-${topping.name || index}`} xs={24} sm={12}>
                            <Checkbox
                              checked={selectedToppings.includes(topping.name)}
                              onChange={(e) => handleToppingChange(topping.name, e.target.checked)}
                            >
                              <span className="flex justify-between w-full">
                                <span>{topping.name}</span>
                                <span className="text-primary-600">+₹{topping.price || 0}</span>
                              </span>
                            </Checkbox>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}

                  {nonVegToppings.length > 0 && (
                    <div className="mb-4">
                      <Text strong className="text-red-600 block mb-2">Non-Vegetarian Toppings:</Text>
                      <Row gutter={[8, 8]}>
                        {nonVegToppings.map((topping, index) => (
                          <Col key={`nonveg-${topping.name || index}`} xs={24} sm={12}>
                            <Checkbox
                              checked={selectedToppings.includes(topping.name)}
                              onChange={(e) => handleToppingChange(topping.name, e.target.checked)}
                            >
                              <span className="flex justify-between w-full">
                                <span>{topping.name}</span>
                                <span className="text-primary-600">+₹{topping.price || 0}</span>
                              </span>
                            </Checkbox>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}

                  {/* Show all toppings if no categories are defined */}
                  {vegToppings.length === 0 && nonVegToppings.length === 0 && allToppings.length > 0 && (
                    <div className="mb-4">
                      <Row gutter={[8, 8]}>
                        {allToppings.map((topping, index) => (
                          <Col key={`all-${topping.name || index}`} xs={24} sm={12}>
                            <Checkbox
                              checked={selectedToppings.includes(topping.name)}
                              onChange={(e) => handleToppingChange(topping.name, e.target.checked)}
                            >
                              <span className="flex justify-between w-full">
                                <span>{topping.name}</span>
                                <span className="text-primary-600">+₹{topping.price || 0}</span>
                              </span>
                            </Checkbox>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                </div>
              )}

              <Divider />

              {/* Quantity and Price */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <Text strong className="block mb-2">Quantity:</Text>
                  <InputNumber
                    min={1}
                    max={10}
                    value={quantity}
                    onChange={setQuantity}
                    size="large"
                  />
                </div>
                <div className="text-right">
                  <Text className="block text-sm text-gray-500">Total Price:</Text>
                  <Title level={3} className="text-primary-600 mb-0">
                    ₹{totalPrice}
                  </Title>
                </div>
              </div>

              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
                className="w-full"
              >
                Add to Cart - ₹{totalPrice}
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProductDetails;