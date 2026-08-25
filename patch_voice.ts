import fs from 'fs';
let content = fs.readFileSync('src/lib/VoiceEngine.ts', 'utf8');

content = content.replace(
  /let errorMsg = `Speech recognition error: \${event.error}`/g,
  "let errorMsg = `Speech recognition error: ${event.error}`"
);

content = content.replace(
  /this.onError\(`Failed to start recognition: \${e.message}`\)/g,
  "this.onError(`Failed to start recognition: ${e.message}`)"
);

content = content.replace(
  /replace\(\/\\\[\.\*\?\\\]\\\\\(.*?\b/g, // This regex could be messy, I will just rewrite the whole line.
  ""
);

fs.writeFileSync('src/lib/VoiceEngine.ts', content);
