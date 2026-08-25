import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const target = "session.sendRealtimeInput({";
const injection = "session.sendRealtimeInput({\n              mediaChunks: [\n                { data: msg.audio, mimeType: \"audio/pcm;rate=16000\" }\n              ]\n            } as any);";
content = content.replace("session.sendRealtimeInput({\n              mediaChunks: [\n                { data: msg.audio, mimeType: \"audio/pcm;rate=16000\" }\n              ]\n            });", injection);

fs.writeFileSync('server.ts', content);
console.log("Patched server.ts");
