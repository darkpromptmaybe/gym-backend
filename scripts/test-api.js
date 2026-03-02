#!/usr/bin/env node

const BASE_URL = 'https://gym-backend-two-bay.vercel.app';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(color, message) {
  console.log(color + message + colors.reset);
}

async function testAPI(endpoint, method, data, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  try {
    log(colors.blue, `\n→ Testing ${method} ${endpoint}`);
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();
    
    if (response.ok) {
      log(colors.green, `✓ Success (${response.status})`);
      console.log(JSON.stringify(result, null, 2));
      return { success: true, data: result };
    } else {
      log(colors.red, `✗ Failed (${response.status})`);
      console.log(JSON.stringify(result, null, 2));
      return { success: false, error: result };
    }
  } catch (error) {
    log(colors.red, `✗ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log(colors.yellow, '\n========================================');
  log(colors.yellow, '   GYM BACKEND API TESTS');
  log(colors.yellow, '========================================');

  let token = null;
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testName = 'Test User';

  // Test 1: Register a new user
  log(colors.yellow, '\n--- TEST 1: Register New User ---');
  const registerResult = await testAPI('/api/auth/register', 'POST', {
    email: testEmail,
    password: testPassword,
    name: testName,
  });

  if (registerResult.success) {
    token = registerResult.data.data?.access_token;
  }

  // Test 2: Try to register with same email (should fail)
  log(colors.yellow, '\n--- TEST 2: Register Duplicate Email (Should Fail) ---');
  await testAPI('/api/auth/register', 'POST', {
    email: testEmail,
    password: testPassword,
    name: testName,
  });

  // Test 3: Sign in with wrong password (should fail)
  log(colors.yellow, '\n--- TEST 3: Sign In With Wrong Password (Should Fail) ---');
  await testAPI('/api/auth/sign-in', 'POST', {
    email: testEmail,
    password: 'WrongPassword',
  });

  // Test 4: Sign in with correct credentials
  log(colors.yellow, '\n--- TEST 4: Sign In With Correct Credentials ---');
  const signInResult = await testAPI('/api/auth/sign-in', 'POST', {
    email: testEmail,
    password: testPassword,
  });

  if (signInResult.success) {
    token = signInResult.data.data?.access_token;
  }

  // Test 5: Verify token
  if (token) {
    log(colors.yellow, '\n--- TEST 5: Verify Token ---');
    await testAPI('/api/auth/verify', 'GET', null, token);
  }

  // Test 6: Get profile
  if (token) {
    log(colors.yellow, '\n--- TEST 6: Get User Profile ---');
    await testAPI('/api/data/profile', 'GET', null, token);
  }

  // Test 7: Google Sign In (Mock)
  log(colors.yellow, '\n--- TEST 7: Google OAuth Sign In ---');
  log(colors.blue, '\nNote: For real Google sign-in, you need to:');
  log(colors.blue, '1. Set up Google OAuth credentials in Google Cloud Console');
  log(colors.blue, '2. Add authorized redirect URIs');
  log(colors.blue, '3. Update .env with GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
  log(colors.blue, '\nMock test with Google data:');
  
  await testAPI('/api/auth/google', 'POST', {
    email: `google${Date.now()}@example.com`,
    google_id: `google_${Date.now()}`,
    name: 'Google Test User',
    photo_url: 'https://example.com/photo.jpg',
  });

  // Test 8: Get profile without token (should fail)
  log(colors.yellow, '\n--- TEST 8: Get Profile Without Token (Should Fail) ---');
  await testAPI('/api/data/profile', 'GET', null);

  log(colors.yellow, '\n========================================');
  log(colors.yellow, '   TESTS COMPLETED');
  log(colors.yellow, '========================================\n');
}

runTests().catch(console.error);
