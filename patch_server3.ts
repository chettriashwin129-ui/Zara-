import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

// Replace the tools array with Object.values(ToolRegistry).map(...)
const toolDefinitions = `
              ...Object.values(ToolRegistry).map(t => ({
                name: t.name,
                description: t.description,
                parameters: t.parameters
              })),
`;

content = content.replace(`              {
                name: "save_memory",`, toolDefinitions + `              {
                name: "save_memory",`);

content = `import { ToolRegistry, executeAction } from './actions';\n` + content;

fs.writeFileSync('server.ts', content);
