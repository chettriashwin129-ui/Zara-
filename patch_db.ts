import fs from 'fs';
let content = fs.readFileSync('db.ts', 'utf8');

content = content.replace(
  'timestamp DATETIME DEFAULT CURRENT_TIMESTAMP',
  'timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,\n      action_request TEXT,\n      action_result TEXT'
);

fs.writeFileSync('db.ts', content);
