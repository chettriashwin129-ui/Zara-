import fs from 'fs';
let content = fs.readFileSync('src/lib/GeminiLiveService.ts', 'utf-8');

const targetState = `  private zeroVolumeChunks = 0;
  private silenceTimeoutDetected = false;`;
const injectionState = `  private zeroVolumeChunks = 0;
  private silenceTimeoutDetected = false;
  private vadSilenceTimer: any = null;
  private resetVadTimer() {
    if (this.vadSilenceTimer) clearTimeout(this.vadSilenceTimer);
    this.vadSilenceTimer = setTimeout(() => {
      if (this.state === 'listening' || this.state === 'processing') {
        this.onError("Zara hasn't heard anything. Voice mode ending.");
        this.stopListening();
      }
    }, 20000); // 20 seconds of no transcript or activity
  }`;
content = content.replace(targetState, injectionState);

const targetStart = `    this.audioResponsesReceived = 0;
    this.zeroVolumeChunks = 0;
    this.silenceTimeoutDetected = false;`;
const injectionStart = `    this.audioResponsesReceived = 0;
    this.zeroVolumeChunks = 0;
    this.silenceTimeoutDetected = false;
    this.resetVadTimer();`;
content = content.replace(targetStart, injectionStart);

const targetStop = `  stopListening() {
    if (this.ws) {`;
const injectionStop = `  stopListening() {
    if (this.vadSilenceTimer) clearTimeout(this.vadSilenceTimer);
    if (this.ws) {`;
content = content.replace(targetStop, injectionStop);

const targetTranscript = `        const finalInput = liveMsg.serverContent?.inputTranscription;
        if (finalInput && finalInput.text) {
          this.onTranscript(finalInput.text, false); // False means user transcript
        }`;
const injectionTranscript = `        const finalInput = liveMsg.serverContent?.inputTranscription;
        if (finalInput && finalInput.text) {
          this.resetVadTimer();
          this.onTranscript(finalInput.text, false); // False means user transcript
        }`;
content = content.replace(targetTranscript, injectionTranscript);

const targetInterim = `        const interimInput = liveMsg.serverContent?.interimInputTranscription;
        if (interimInput && interimInput.text) {
          this.onInterim(interimInput.text);
        }`;
const injectionInterim = `        const interimInput = liveMsg.serverContent?.interimInputTranscription;
        if (interimInput && interimInput.text) {
          this.resetVadTimer();
          this.onInterim(interimInput.text);
        }`;
content = content.replace(targetInterim, injectionInterim);

const targetModel = `        const modelParts = liveMsg.serverContent?.modelTurn?.parts;
        if (modelParts) {
          for (const part of modelParts) {
            if (part.text) {
              this.onTranscript(part.text, true); // True means model transcript here
            }
          }
        }`;
const injectionModel = `        const modelParts = liveMsg.serverContent?.modelTurn?.parts;
        if (modelParts) {
          for (const part of modelParts) {
            if (part.text) {
              this.resetVadTimer();
              this.onTranscript(part.text, true); // True means model transcript here
            }
          }
        }`;
content = content.replace(targetModel, injectionModel);

const targetAudio = `      if (msg.audio) {
        this.audioResponsesReceived++;`;
const injectionAudio = `      if (msg.audio) {
        this.resetVadTimer();
        this.audioResponsesReceived++;`;
content = content.replace(targetAudio, injectionAudio);


fs.writeFileSync('src/lib/GeminiLiveService.ts', content);
console.log("Patched GeminiLiveService VAD timeout");
