const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const fetch = global.fetch;

const BASE = process.env.BASE_URL || 'http://localhost:3000';

const waitFor = async (url, timeout = 10000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res) return true;
    } catch (e) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error('Server did not start in time');
};

const run = async () => {
  console.log('Waiting for backend...');
  await waitFor(BASE);
  console.log('Backend reachable at', BASE);

  const rnd = Math.random().toString(36).substring(2, 8);
  const email = `test+${rnd}@example.com`;
  const password = 'Test1234!';
  const name = 'E2E Tester';

  console.log('Registering user', email);
  await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  }).catch((e) => {});

  console.log('Logging in...');
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const loginBody = await loginRes.json().catch(() => ({}));
  const setCookie = loginRes.headers.get('set-cookie') || loginRes.headers.get('Set-Cookie');
  console.log('Login status', loginRes.status, loginBody);
  console.log('Set-Cookie:', setCookie);

  if (!setCookie) {
    console.error('No refresh cookie received; aborting test');
    process.exit(1);
  }

  const cookie = setCookie.split(';')[0];

  console.log('Calling /auth/refresh with cookie...');
  const refreshRes = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: cookie },
  });
  const refreshBody = await refreshRes.json().catch(() => ({}));
  console.log('Refresh status', refreshRes.status, refreshBody);

  console.log('Calling /auth/logout with cookie...');
  const logoutRes = await fetch(`${BASE}/auth/logout`, {
    method: 'POST',
    headers: { Cookie: cookie },
  });
  const logoutBody = await logoutRes.json().catch(() => ({}));
  const logoutSet = logoutRes.headers.get('set-cookie') || logoutRes.headers.get('Set-Cookie');
  console.log('Logout status', logoutRes.status, logoutBody);
  console.log('Logout Set-Cookie:', logoutSet);

  console.log('E2E refresh test completed');
};

run().catch((err) => {
  console.error('E2E test failed:', err.message || err);
  process.exit(1);
});
