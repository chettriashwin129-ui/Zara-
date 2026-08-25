const fs = require('fs');
let code = fs.readFileSync('src/lib/GeminiLiveService.ts', 'utf8');

const oldOnMessage = `      if (msg.transcript) {
        this.onTranscript(msg.transcript.text, msg.transcript.isFinal);
      }
      this.notifyDiagnostics();`;

const newOnMessage = `      if (msg.liveMessage) {
        const liveMsg = msg.liveMessage;
        
        // Output text from Zara
        const modelParts = liveMsg.serverContent?.modelTurn?.parts;
        if (modelParts) {
          for (const part of modelParts) {
            if (part.text) {
              this.onTranscript(part.text, true); // True means model transcript here
            }
          }
        }
        
        // Input text from User? Might be under different field
        // Just as an example, though if it's missing it's okay, transcript is optional
      }
      this.notifyDiagnostics();`;

code = code.replace(oldOnMessage, newOnMessage);

fs.writeFileSync('src/lib/GeminiLiveService.ts', code);
