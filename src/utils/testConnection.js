import axios from 'axios';

export const testConnection = async () => {
  try {
    console.log('🔄 Testing connection to backend...');
    
    // Test basic connection
    const response = await axios.get('https://ovenaura-server.onrender.com');
    console.log('✅ Backend is running:', response.data);
    
    // Test auth endpoint
    const authTest = await axios.post('https://ovenaura-server.onrender.com/api/auth/login', {
      email: 'test@test.com',
      password: 'test123'
    });
    
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🚫 Backend server is not running on port 5000');
    } else if (error.response) {
      console.log('✅ Backend is reachable, got response:', error.response.status);
    }
    
    return false;
  }
};