const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const wsSetup = `
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(\`Server running on http://localhost:\${PORT}\`);
  });

  const wss = new WebSocketServer({ server, path: '/live' });

  wss.on("connection", async (clientWs) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      clientWs.send(JSON.stringify({ error: "GEMINI_API_KEY missing" }));
      return;
    }
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });

    try {
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } }
          },
          systemInstruction: "You are Zara AI, a warm, natural, and expressive AI companion. Be concise, friendly, and helpful. You have access to a memory system through Zara Brain but for now just converse naturally. Maintain personality and adapt responses based on the user's current activity."
        },
        callbacks: {
          onmessage: (message) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          }
        }
      });

      clientWs.on("message", (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.audio) {
            session.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: "audio/pcm;rate=16000" }
            });
          }
        } catch (e) {
          console.error("Live API WS message error:", e);
        }
      });

      clientWs.on("close", () => {
        // cleanup if possible
      });

    } catch (e) {
      console.error("Error setting up Gemini Live:", e);
      clientWs.send(JSON.stringify({ error: "Connection to Zara's voice core failed." }));
    }
  });
`;

code = code.replace(/app\.listen\(PORT,\s*"0\.0\.0\.0",\s*\(\)\s*=>\s*{\s*console\.log\(`Server running on http:\/\/localhost:\$\{PORT\}`\);\s*}\);/, wsSetup);

fs.writeFileSync('server.ts', code);
