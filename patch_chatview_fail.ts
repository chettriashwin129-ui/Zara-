import fs from 'fs';
let content = fs.readFileSync('src/components/views/ChatView.tsx', 'utf-8');

const target = "window.addEventListener('zara_tts_blocked', onBlocked);";
const injection = `
    const onFailed = () => {
      setErrorMsg("Voice playback isn't available right now.");
    };
    window.addEventListener('zara_tts_failed', onFailed);
`;
const targetRemove = "return () => window.removeEventListener('zara_tts_blocked', onBlocked);";
const injectionRemove = "return () => { window.removeEventListener('zara_tts_blocked', onBlocked); window.removeEventListener('zara_tts_failed', onFailed); };";

content = content.replace(target, injection + target);
content = content.replace(targetRemove, injectionRemove);

fs.writeFileSync('src/components/views/ChatView.tsx', content);
console.log("Patched ChatView.tsx with fail event");
