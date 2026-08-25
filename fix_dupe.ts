import fs from 'fs';
let content = fs.readFileSync('src/lib/GeminiLiveService.ts', 'utf-8');
content = content.replace("  private audioResponsesReceived: number = 0;\n", "");
fs.writeFileSync('src/lib/GeminiLiveService.ts', content);
