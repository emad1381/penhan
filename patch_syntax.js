const fs = require('fs');
let content = fs.readFileSync('src/templates.js', 'utf8');

// The buggy line has backticks that break the outer template literal
content = content.replace(/btn\.innerHTML = `🌍 در حال تشخیص\.\.\. \(\$\{i \* 100\} از \$\{totalMissing\}\)`;/g, 
  "btn.innerHTML = '🌍 در حال تشخیص... (' + (i * 100) + ' از ' + totalMissing + ')';");

fs.writeFileSync('src/templates.js', content);
