import fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf8');

content = content.replace(
  '  timestamp: Date;\n}',
  '  timestamp: Date;\n  actionRequest?: { name: string; params: any; description: string };\n  actionResult?: { success: boolean; message: string };\n}'
);

fs.writeFileSync('src/types.ts', content);
