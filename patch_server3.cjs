const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldOnMessage = `// Forward everything else to client for transcript parsing
            clientWs.send(JSON.stringify({ liveMessage: message }));`;

const newOnMessage = `// Forward everything else to client for transcript parsing
            clientWs.send(JSON.stringify({ liveMessage: message }));
            // Log transcripts to server console for debugging
            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
              console.log("Model text:", message.serverContent.modelTurn.parts[0].text);
            }
            // For inputAudioTranscription, it usually comes back in a different field, let's dump the keys
            // console.log(JSON.stringify(message, null, 2));
            `;

code = code.replace(oldOnMessage, newOnMessage);

fs.writeFileSync('server.ts', code);
