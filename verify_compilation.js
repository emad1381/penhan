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
    const lp = loginPage('test-uuid', 'localhost');
    console.log('✅ loginPage() OK, length:', lp.length);
  } else { console.log('❌ loginPage missing'); }

  if (typeof panelPage === 'function') {
    const pp = panelPage('localhost', 'test-uuid', '1.1.1.1', '2.2.2.2', '/vless', '/trojan', true, 'FRA', 'TLSv1.3');
    console.log('✅ panelPage() OK, length:', pp.length);
  } else { console.log('❌ panelPage missing'); }

  if (typeof subscriptionPage === 'function') {
    const sp = subscriptionPage('localhost', 'test-uuid', '1.1.1.1', '/vless', '/trojan');
    console.log('✅ subscriptionPage() OK, length:', sp.length);
  } else { console.log('❌ subscriptionPage missing'); }

  if (typeof isApiAuthed === 'function') {
    console.log('✅ isApiAuthed() OK');
  } else { console.log('❌ isApiAuthed missing'); }

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
