import fs from 'fs';
let content = fs.readFileSync('src/lib/GeminiLiveService.ts', 'utf-8');

const targetParse = `        // Input text from User? Might be under different field
        // Just as an example, though if it's missing it's okay, transcript is optional`;

const injectionParse = `        // User text
        const interimInput = liveMsg.serverContent?.interimInputTranscription;
        if (interimInput && interimInput.text) {
          this.onInterim(interimInput.text);
        }
        
        const finalInput = liveMsg.serverContent?.inputTranscription;
        if (finalInput && finalInput.text) {
          this.onTranscript(finalInput.text, false); // False means user transcript
        }
`;
content = content.replace(targetParse, injectionParse);

fs.writeFileSync('src/lib/GeminiLiveService.ts', content);
console.log("Patched GeminiLiveService transcription");
