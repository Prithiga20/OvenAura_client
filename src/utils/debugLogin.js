// Debug utility to test login connectivity
export const debugLogin = async (email, password) => {
  console.log('🔍 Starting login debug...');
  
  // Test 1: Basic fetch to backend
  try {
    console.log('📡 Test 1: Basic backend connectivity');
    const response = await fetch('https://ovenaura-server.onrender.com');
    const data = await response.json();
    console.log('✅ Backend is running:', data);
  } catch (error) {
    console.error('❌ Backend not reachable:', error.message);
    return { success: false, error: 'Backend server not running' };
  }
  
  // Test 2: Direct fetch to login endpoint
  try {
    console.log('📡 Test 2: Direct login API call');
    const response = await fetch('https://ovenaura-server.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    console.log('📦 Login response:', data);
    
    if (response.ok) {
      console.log('✅ Login successful via direct fetch');
      return { success: true, data };
    } else {
      console.log('❌ Login failed:', data.message);
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('❌ Login API call failed:', error.message);
    return { success: false, error: error.message };
  }
};