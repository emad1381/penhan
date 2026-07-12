const fs = require('fs');
let content = fs.readFileSync('src/templates.js', 'utf8');
content = content.replace(/class="bg-surface"/g, 'class="bg-[#121212] text-white"');
fs.writeFileSync('src/templates.js', content);
