import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const target = `errMsg = "I'm temporarily out of AI capacity. Please try again in a little while.";`;
const injection = `errMsg = "Zara is temporarily unavailable. Please try again later.";`;
content = content.replace(target, injection);

fs.writeFileSync('server.ts', content);
console.log("Patched server.ts error message");
