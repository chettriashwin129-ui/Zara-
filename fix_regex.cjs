const fs = require('fs');
let content = fs.readFileSync('src/lib/VoiceEngine.ts', 'utf-8');

const targetRegex = /private cleanText[\s\S]*?private splitIntoChunks/m;
const newCleanText = `private cleanText(text: string): string {
    return text
      .replace(/\\s*\\\`\\\`\\\`[\\s\\S]*?\\\`\\\`\\\`/g, '') // remove code blocks
      .replace(/[*_#\`~>]/g, '')        // remove simple markdown characters
      .replace(/\\[(.*?)\\]\\(.*?\\)/g, '$1') // preserve link text
      .replace(/\\n\\s*\\n/g, '. ')      // replace double newlines with period
      .replace(/\\n/g, '. ')             // replace single newlines with period
      .replace(/\\b1\\.\\s/g, 'First, ')
      .replace(/\\b2\\.\\s/g, 'Second, ')
      .replace(/\\b3\\.\\s/g, 'Third, ')
      .replace(/\\b4\\.\\s/g, 'Fourth, ')
      .replace(/\\b5\\.\\s/g, 'Fifth, ')
      .replace(/\\.\\s*\\./g, '.')       // remove consecutive periods
      .trim();
  }

  private splitIntoChunks`;

content = content.replace(targetRegex, newCleanText);
fs.writeFileSync('src/lib/VoiceEngine.ts', content);
console.log("Patched VoiceEngine cleanup again");
