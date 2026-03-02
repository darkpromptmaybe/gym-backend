export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>🏋️ Gym Auth API</h1>
      <p>Backend is running successfully!</p>
      
      <h2>API Endpoints</h2>
      
      <h3>Public Endpoints</h3>
      <ul>
        <li><code>POST /api/auth/sign-in</code> - Login</li>
        <li><code>POST /api/auth/register</code> - Register</li>
        <li><code>POST /api/auth/google</code> - Google OAuth</li>
        <li><code>GET /api/auth/verify</code> - Verify token</li>
      </ul>

      <h3>Protected Endpoints (Requires JWT)</h3>
      <ul>
        <li><code>GET /api/data/profile</code> - User profile</li>
      </ul>

      <h2>Quick Test</h2>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
{`curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'`}
      </pre>

      <p>
        <strong>Status:</strong> <span style={{ color: 'green' }}>✅ Online</span>
      </p>
    </div>
  );
}
