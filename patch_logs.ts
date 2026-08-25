import fs from 'fs';
let content = fs.readFileSync('src/lib/VoiceEngine.ts', 'utf8');
content = content.replace(/console\.log\(/g, 'if (process.env.NODE_ENV !== "production") console.log(');
fs.writeFileSync('src/lib/VoiceEngine.ts', content);
