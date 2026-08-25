import fs from 'fs';
let content = fs.readFileSync('src/components/views/ChatView.tsx', 'utf-8');

if (!content.includes('import { voiceEngine as ttsEngine }')) {
    content = `import { voiceEngine as ttsEngine } from '../../lib/VoiceEngine';\n` + content;
    
    // Auto-speak logic
    const target1 = "setMessages((prev) => [...prev, aiMessage]);";
    const injection1 = `
      setMessages((prev) => [...prev, aiMessage]);
      // --- TTS ---
      if (ttsEngine.settings.autoSpeak) {
        ttsEngine.speak(data.reply);
      }
      // ---------
`;
    content = content.replace(target1, injection1);

    // Stop speaking when user sends a new message
    const target2 = "const handleSend = async (overrideText?: string) => {";
    const injection2 = `const handleSend = async (overrideText?: string) => {
    ttsEngine.stop();
`;
    content = content.replace(target2, injection2);

    fs.writeFileSync('src/components/views/ChatView.tsx', content);
    console.log("Patched ChatView.tsx with ttsEngine");
} else {
    console.log("Already patched");
}
