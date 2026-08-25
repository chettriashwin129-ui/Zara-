import fs from 'fs';
let content = fs.readFileSync('src/components/views/ChatView.tsx', 'utf-8');

const target = "useEffect(() => {";
const injection = `
  useEffect(() => {
    const onBlocked = () => {
      setErrorMsg("Tap the speaker button to allow Zara to speak.");
    };
    window.addEventListener('zara_tts_blocked', onBlocked);
    return () => window.removeEventListener('zara_tts_blocked', onBlocked);
  }, []);
`;
content = content.replace(target, injection + target);

fs.writeFileSync('src/components/views/ChatView.tsx', content);
console.log("Patched ChatView.tsx with toast");
