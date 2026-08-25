const fs = require('fs');
let code = fs.readFileSync('src/components/views/ChatView.tsx', 'utf8');
code = code.replace(
  /setMessages\(convMsgs\);\n        \}\);/g,
  `setMessages(convMsgs);\n        }).catch(err => console.error("Failed to fetch messages", err));`
);
fs.writeFileSync('src/components/views/ChatView.tsx', code);
