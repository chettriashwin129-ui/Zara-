const fs = require('fs');
let code = fs.readFileSync('src/components/views/ChatView.tsx', 'utf8');
code = code.replace(/\}\)\.catch\(err => console\.error\("DB Save Error:", err\)\);\.catch\(err => console\.error\("DB Save Error:", err\)\);/g, "}).catch(err => console.error(err));");
fs.writeFileSync('src/components/views/ChatView.tsx', code);
