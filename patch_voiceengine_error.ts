import fs from 'fs';
let content = fs.readFileSync('src/lib/VoiceEngine.ts', 'utf-8');

const target = "this.synthesis.speak(this.currentUtterance);";
const injection = `
      // Set a timeout to detect autoplay blocking
      const autoplayCheck = setTimeout(() => {
        if (this.currentUtterance && !this.synthesis.speaking && !this.synthesis.pending) {
           console.warn("Speech blocked by browser.");
           // Dispatch event to show toast
           window.dispatchEvent(new CustomEvent('zara_tts_blocked'));
           this.stop();
        }
      }, 500);

      const oldOnStart = this.currentUtterance.onstart;
      this.currentUtterance.onstart = (e) => {
        clearTimeout(autoplayCheck);
        if (oldOnStart) oldOnStart.call(this.currentUtterance, e as any);
      };

      this.synthesis.speak(this.currentUtterance);
`;
content = content.replace(target, injection);

fs.writeFileSync('src/lib/VoiceEngine.ts', content);
console.log("Patched VoiceEngine.ts");
