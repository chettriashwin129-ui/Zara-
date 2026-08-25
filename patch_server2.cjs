const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldConfig = `        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } }
          },
          systemInstruction: "You are Zara AI, a warm, natural, and expressive AI companion. Be concise, friendly, and helpful. You have access to a memory system through Zara Brain but for now just converse naturally. Maintain personality and adapt responses based on the user's current activity."
        },`;

const newConfig = `        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } }
          },
          systemInstruction: "You are Zara AI, a warm, natural, and expressive AI companion. Be concise, friendly, and helpful. You have access to a memory system through Zara Brain but for now just converse naturally. Maintain personality and adapt responses based on the user's current activity.",
          inputAudioTranscription: { model: "audio" },
          outputAudioTranscription: {}
        },`;

code = code.replace(oldConfig, newConfig);

const oldOnMessage = `          onmessage: (message) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          }`;

const newOnMessage = `          onmessage: (message) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
            
            // Forward everything else to client for transcript parsing
            clientWs.send(JSON.stringify({ liveMessage: message }));
          }`;

code = code.replace(oldOnMessage, newOnMessage);

fs.writeFileSync('server.ts', code);
