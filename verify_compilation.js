const fs = require('fs');
try {
  const code = fs.readFileSync('dist/worker.js', 'utf8');
  let cleanCode = code
    .replace(/import\s*\{[^}]*\}\s*from\s*["']cloudflare:sockets["'];?/g, 'var connect = null;')
    .replace(/export\s*\{[^}]*\};?/g, '')
    .replace(/export\s+default\s+\{/, 'var workerDefault = {');
  eval(cleanCode);
  console.log('✅ dist/worker.js evaluated successfully!');
  
  if (typeof nginxPage === 'function') {
    console.log('✅ nginxPage() OK, length:', nginxPage().length);
  } else { console.log('❌ nginxPage missing'); }

  if (typeof loginPage === 'function') {
    const lp = loginPage('/panel', 'localhost');
    console.log('✅ loginPage() OK, length:', lp.length);
  } else { console.log('❌ loginPage missing'); }

  if (typeof panelPage === 'function') {
    const pp = panelPage('localhost', 'test-uuid', '1.1.1.1', '', '');
    console.log('✅ panelPage() OK, length:', pp.length);
  } else { console.log('❌ panelPage missing'); }

  if (typeof subscriptionPage === 'function') {
    const mockUser = { id: 'test-uuid', name: 'Test User', used_bytes: 0, limit_bytes: 0, expiry_date: 0 };
    const sp = subscriptionPage('localhost', mockUser, 'vless://test', 'trojan://test');
    console.log('✅ subscriptionPage() OK, length:', sp.length);
  } else { console.log('❌ subscriptionPage missing'); }

  if (typeof setupPage === 'function') {
    const spg = setupPage(true, true, true, 'test-uuid', '1.1.1.1');
    console.log('✅ setupPage() OK, length:', spg.length);
  } else { console.log('❌ setupPage missing'); }

  if (typeof vlessOverWSHandler === 'function') {
    console.log('✅ vlessOverWSHandler() OK');
  } else { console.log('❌ vlessOverWSHandler missing'); }

  if (typeof trojanOverWSHandler === 'function') {
    console.log('✅ trojanOverWSHandler() OK');
  } else { console.log('❌ trojanOverWSHandler missing'); }

  console.log('\\n🎉 All checks passed!');
} catch (err) {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
}
