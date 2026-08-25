const fs = require('fs');
let code = fs.readFileSync('src/components/views/ChatView.tsx', 'utf8');

code = code.replace(
  /\.then\(\(allMsgs: DbMessage\[\]\) => \{([\s\S]*?)setMessages\(convMsgs\);\n        \}\);/,
  `.then((allMsgs: DbMessage[]) => {
          $1setMessages(convMsgs);
        }).catch(err => console.error("Failed to fetch messages:", err));`
);

fs.writeFileSync('src/components/views/ChatView.tsx', code);
