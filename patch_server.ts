import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

// Add imports
const imports = `import { ToolRegistry, executeAction } from './actions';\n`;
if (!content.includes('executeAction')) {
  content = content.replace('import { createServer', imports + 'import { createServer');
}

fs.writeFileSync('server.ts', content);
