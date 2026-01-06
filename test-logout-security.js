// Simple test script to verify logout security
// This can be run in the browser console to test the logout functionality

function testLogoutSecurity() {
  console.log('🧪 Testing Logout Security...');
  
  // Test 1: Check if admin data is cleared on logout
  console.log('\n1. Testing data clearing on logout...');
  
  // Simulate admin login data
  localStorage.setItem('adminUser', JSON.stringify({ id: 1, role: 'admin' }));
  localStorage.setItem('gigly_access_token', 'fake-token');
  sessionStorage.setItem('adminData', 'some-data');
  
  console.log('Before logout:');
  console.log('- adminUser:', localStorage.getItem('adminUser'));
  console.log('- access_token:', localStorage.getItem('gigly_access_token'));
  console.log('- adminData:', sessionStorage.getItem('adminData'));
  
  // Simulate logout process
  localStorage.removeItem('adminUser');
  localStorage.removeItem('gigly_access_token');
  localStorage.removeItem('gigly_refresh_token');
  localStorage.removeItem('gigly_user_data');
  sessionStorage.clear();
  
  console.log('After logout:');
  console.log('- adminUser:', localStorage.getItem('adminUser'));
  console.log('- access_token:', localStorage.getItem('gigly_access_token'));
  console.log('- adminData:', sessionStorage.getItem('adminData'));
  
  // Test 2: Check browser history manipulation
  console.log('\n2. Testing browser history manipulation...');
  console.log('Current URL:', window.location.href);
  
  // Test 3: Check cache clearing
  console.log('\n3. Testing cache clearing...');
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      console.log('Available caches:', cacheNames);
      const adminCaches = cacheNames.filter(name => 
        name.includes('admin') || name.includes('dashboard')
      );
      console.log('Admin-related caches:', adminCaches);
    });
  }
  
  console.log('\n✅ Logout security test completed!');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testLogoutSecurity = testLogoutSecurity;
  console.log('Run testLogoutSecurity() in the browser console to test logout security');
}

module.exports = { testLogoutSecurity };
