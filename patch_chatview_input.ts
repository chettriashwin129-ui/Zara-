import fs from 'fs';
let content = fs.readFileSync('src/components/views/ChatView.tsx', 'utf-8');

const target = `            setInput(prev => {
               // Sometimes API sends duplicate or accumulating strings for transcription?
               // The API usually sends complete segments for final input transcription, but let's just append for now, or replace?
               // Wait, inputTranscription in Gemini Live returns complete text for the turn chunk, or incremental?
               // Actually, interim is full replacement, final is append.
               return prev + text + " ";
            });`;
const injection = `            setInput(prev => {
               // Final input chunks are incremental parts of the whole user turn
               return prev.endsWith(text) ? prev : prev + " " + text;
            });`;

content = content.replace(target, injection);
fs.writeFileSync('src/components/views/ChatView.tsx', content);
