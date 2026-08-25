import fs from 'fs';
let content = fs.readFileSync('src/components/views/ChatView.tsx', 'utf-8');

if (!content.includes('TTSControls')) {
    content = `import { TTSControls } from '../TTSControls';\n` + content;
    
    const target1 = "<div className=\"flex-1 flex flex-col h-full overflow-hidden relative\">";
    const injection1 = "<div className=\"flex-1 flex flex-col h-full overflow-hidden relative\">\n          <TTSControls />";
    content = content.replace(target1, injection1);

    fs.writeFileSync('src/components/views/ChatView.tsx', content);
    console.log("Patched ChatView.tsx with TTSControls");
} else {
    console.log("Already patched");
}
