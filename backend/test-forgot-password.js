// Test script for forgot password functionality
// Run with: node test-forgot-password.js

const fetch = require('node-fetch');

async function testForgotPassword() {
  console.log('Testing forgot password functionality...\n');

  // Test 1: Request password reset
  console.log('1. Testing forgot password request...');
  try {
    const response = await fetch('http://localhost:5000/api/v1/user/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'student@example.com' }),
    });

    const data = await response.json();
    console.log('Response:', data);

    if (response.ok) {
      console.log('✅ Forgot password request successful\n');
    } else {
      console.log('❌ Forgot password request failed\n');
      return;
    }
  } catch (error) {
    console.log('❌ Error:', error.message, '\n');
    return;
  }

  // For manual testing, you would need to:
  // 1. Check the console logs for the reset URL
  // 2. Extract the token from the URL
  // 3. Test the verify and reset endpoints

  console.log('2. Manual testing steps:');
  console.log('   - Check backend console for reset URL');
  console.log('   - Copy the token from the URL');
  console.log('   - Test reset password at: http://localhost:5174/reset-password?token=YOUR_TOKEN');
  console.log('   - Or test API endpoints directly with the token');
}

testForgotPassword();