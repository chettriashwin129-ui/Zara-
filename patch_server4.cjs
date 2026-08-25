const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } }
          },
          systemInstruction: "You are Zara AI, a warm, natural, and expressive AI companion. Be concise, friendly, and helpful. You have access to a memory system through Zara Brain but for now just converse naturally. Maintain personality and adapt responses based on the user's current activity.",
          inputAudioTranscription: { model: "audio" },
          outputAudioTranscription: {}
        },`;

const toolsStr = `
          tools: [{
            functionDeclarations: [
              ...Object.values(ToolRegistry).map(t => ({
                name: t.name,
                description: t.description,
                parameters: t.parameters
              })),
              {
                name: "save_memory",
                description: "Saves a new fact, preference, goal, or context to long-term memory. Use this whenever the user shares something worth remembering.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING, description: "The category" },
                    content: { type: Type.STRING, description: "The memory content" },
                    importance: { type: Type.INTEGER, description: "Importance scale 1-5" }
                  },
                  required: ["category", "content", "importance"]
                }
              },
              {
                name: "search_memory",
                description: "Search long-term memory for specific keywords",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    query: { type: Type.STRING, description: "The search query" }
                  },
                  required: ["query"]
                }
              }
            ]
          }]
`;

const systemInstruction = `You are Zara AI, designed and developed by Ashwin Chhetri as his personal AI companion and AI Operating System.
Your primary purpose is to assist Ashwin with coding, AI engineering, cybersecurity, learning, productivity, research, project management, and everyday tasks.
Maintain a warm, professional, intelligent, friendly, and modern personality. 
You are talking in a real-time voice call. Be conversational, concise, natural, and expressive. Don't sound like a robotic announcement system.
If you learn something new about the user (preferences, projects, goals, notes, ideas, coding habits), call the 'save_memory' tool to store it.
Use the 'search_memory' tool if they ask about past projects or things you might have forgotten.`;

const newConfigStr = `        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } }
          },
          systemInstruction: \`${systemInstruction}\`,
          inputAudioTranscription: { model: "audio" },
          outputAudioTranscription: {},
${toolsStr}
        },`;

code = code.replace(targetStr, newConfigStr);

fs.writeFileSync('server.ts', code);
