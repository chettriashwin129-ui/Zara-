import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

// The endpoints for saving/getting messages:
content = content.replace(
  'execQuery("INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)", [id, conversation_id, role, content]);',
  'execQuery("INSERT INTO messages (id, conversation_id, role, content, action_request, action_result) VALUES (?, ?, ?, ?, ?, ?)", [id, conversation_id, role, content, action_request ? JSON.stringify(action_request) : null, action_result ? JSON.stringify(action_result) : null]);'
);

content = content.replace(
  'const { id, conversation_id, role, content } = req.body;',
  'const { id, conversation_id, role, content, action_request, action_result } = req.body;'
);

content = content.replace(
  'execQuery("UPDATE messages SET content = ? WHERE id = ?", [content, id]);',
  'execQuery("UPDATE messages SET content = ?, action_request = ?, action_result = ? WHERE id = ?", [content, action_request ? JSON.stringify(action_request) : null, action_result ? JSON.stringify(action_result) : null, id]);'
);

fs.writeFileSync('server.ts', content);
