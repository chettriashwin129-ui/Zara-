const fs = require('fs');
let code = fs.readFileSync('src/components/views/ChatView.tsx', 'utf8');

code = code.replace(
  /await fetch\('\/api\/data\/messages', \{[\s\S]*?body: JSON\.stringify\(\{[\s\S]*?\}\)\n\s*\}\);/g,
  (match) => {
    return `${match}.catch(err => console.error("DB Save Error:", err));`;
  }
);

fs.writeFileSync('src/components/views/ChatView.tsx', code);
