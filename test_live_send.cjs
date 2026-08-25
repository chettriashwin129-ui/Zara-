const { GoogleGenAI, Modality } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  const c = await ai.live.connect({
    model: 'gemini-3.1-flash-live-preview',
    config: { responseModalities: [Modality.AUDIO] },
    callbacks: { onmessage: () => {} }
  });
  console.log("connected");
  try {
    c.sendRealtimeInput({ audio: { data: "base64", mimeType: "audio/pcm;rate=16000" } });
    console.log("sent obj");
  } catch(e) {
    console.error("err obj", e.message);
  }
  try {
    c.sendRealtimeInput([{ data: "base64", mimeType: "audio/pcm;rate=16000" }]);
    console.log("sent array");
  } catch(e) {
    console.error("err array", e.message);
  }
  c.close();
}
test().catch(console.error);
