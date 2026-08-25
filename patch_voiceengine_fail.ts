import fs from 'fs';
let content = fs.readFileSync('src/lib/VoiceEngine.ts', 'utf-8');

const target = `console.error('Speech synthesis error', e);`;
const injection = `
      console.error('Speech synthesis error', e);
      window.dispatchEvent(new CustomEvent('zara_tts_failed'));
`;
content = content.replace(target, injection);

fs.writeFileSync('src/lib/VoiceEngine.ts', content);
console.log("Patched VoiceEngine.ts");
