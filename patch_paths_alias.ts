import fs from 'fs';
let content = fs.readFileSync('src/agi/core.ts', 'utf-8');
content = content.replace("from '../../db'", "from '@/db'");
content = content.replace("from '../../actions'", "from '@/actions'");
fs.writeFileSync('src/agi/core.ts', content);
console.log("Patched aliases");
