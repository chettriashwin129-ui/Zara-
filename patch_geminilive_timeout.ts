import fs from 'fs';
let content = fs.readFileSync('src/lib/GeminiLiveService.ts', 'utf-8');

const targetState = `private audioResponsesReceived = 0;`;
const injectionState = `private audioResponsesReceived = 0;
  private zeroVolumeChunks = 0;
  private silenceTimeoutDetected = false;`;
content = content.replace(targetState, injectionState);

const targetStart = `this.audioResponsesReceived = 0;`;
const injectionStart = `this.audioResponsesReceived = 0;
    this.zeroVolumeChunks = 0;
    this.silenceTimeoutDetected = false;`;
content = content.replace(targetStart, injectionStart);

const targetAudio = `        for (let i = 0; i < inputData.length; i++) {
          let s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }`;
const injectionAudio = `        let maxAmp = 0;
        for (let i = 0; i < inputData.length; i++) {
          let s = inputData[i];
          if (Math.abs(s) > maxAmp) maxAmp = Math.abs(s);
          let clamped = Math.max(-1, Math.min(1, s));
          pcm16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
        }
        
        if (maxAmp === 0) {
          this.zeroVolumeChunks++;
          if (this.zeroVolumeChunks > 40 && !this.silenceTimeoutDetected) { // 40 chunks * 250ms = 10 seconds
            this.silenceTimeoutDetected = true;
            this.onError("Zara couldn't access the voice stream. Please try again.");
            this.stopListening();
            return;
          }
        } else {
          this.zeroVolumeChunks = 0;
        }
`;
content = content.replace(targetAudio, injectionAudio);

fs.writeFileSync('src/lib/GeminiLiveService.ts', content);
console.log("Patched silence timeout");
