const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  `          if (msg.audio) {
            session.sendRealtimeInput({
              mediaChunks: [
                { data: msg.audio, mimeType: "audio/pcm;rate=16000" }
              ]
            } as any);
          }`,
  `          if (msg.audio) {
            session.sendRealtimeInput({
              mediaChunks: [
                { data: msg.audio, mimeType: "audio/pcm;rate=16000" }
              ]
            } as any);
          }
          if (msg.clientContent) {
            session.send({ clientContent: msg.clientContent });
          }
          if (msg.realtimeInput) {
            session.send({ realtimeInput: msg.realtimeInput });
          }`
);

fs.writeFileSync('server.ts', code);
