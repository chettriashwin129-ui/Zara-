import { ZaraAGI } from './src/agi/core.ts';
import { ToolRegistry, executeAction } from './actions';
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WebSocketServer, WebSocket } from "ws";
import { runQuery, execQuery } from "./db";
import { initDb, addMemory, getAllMemories, searchMemories } from "./db";

async function startServer() {
  await initDb();
  const app = express();
  const PORT = 3000;
  
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use(express.json());

  // API Routes
  
  
  // Generic Read
  app.get('/api/data/:table', (req, res) => {
    try {
      const { table } = req.params;
      const allowedTables = ['memories', 'conversations', 'messages', 'planner_tasks', 'goals', 'projects', 'learn_topics', 'settings'];
      if (!allowedTables.includes(table)) return res.status(400).json({ error: "Invalid table" });
      const data = runQuery(`SELECT * FROM ${table} ORDER BY rowid DESC`);
      res.json(data);
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Generic Create
  app.post('/api/data/:table', (req, res) => {
    try {
      const { table } = req.params;
      const allowedTables = ['memories', 'conversations', 'messages', 'planner_tasks', 'goals', 'projects', 'learn_topics', 'settings'];
      if (!allowedTables.includes(table)) return res.status(400).json({ error: "Invalid table" });
      
      const data = req.body;
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => '?').join(',');
      
      execQuery(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`, values);
      res.json({ success: true });
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Generic Update
  app.put('/api/data/:table/:id', (req, res) => {
    try {
      const { table, id } = req.params;
      const allowedTables = ['memories', 'conversations', 'messages', 'planner_tasks', 'goals', 'projects', 'learn_topics', 'settings'];
      if (!allowedTables.includes(table)) return res.status(400).json({ error: "Invalid table" });
      
      const data = req.body;
      const keys = Object.keys(data);
      const values = Object.values(data);
      const setClause = keys.map(k => `${k} = ?`).join(',');
      
      const idField = table === 'settings' ? 'key' : 'id';
      
      execQuery(`UPDATE ${table} SET ${setClause} WHERE ${idField} = ?`, [...values, id]);
      res.json({ success: true });
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Generic Delete
  app.delete('/api/data/:table/:id', (req, res) => {
    try {
      const { table, id } = req.params;
      const allowedTables = ['memories', 'conversations', 'messages', 'planner_tasks', 'goals', 'projects', 'learn_topics', 'settings'];
      if (!allowedTables.includes(table)) return res.status(400).json({ error: "Invalid table" });
      
      const idField = table === 'settings' ? 'key' : 'id';
      
      execQuery(`DELETE FROM ${table} WHERE ${idField} = ?`, [id]);
      res.json({ success: true });
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Clear Table
  app.delete('/api/data/:table', (req, res) => {
    try {
      const { table } = req.params;
      const allowedTables = ['memories', 'conversations', 'messages', 'planner_tasks', 'goals', 'projects', 'learn_topics', 'settings'];
      if (!allowedTables.includes(table)) return res.status(400).json({ error: "Invalid table" });
      
      execQuery(`DELETE FROM ${table}`);
      res.json({ success: true });
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history = [] } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing." });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      // Fetch relevant memories (for now, fetch all or simple search)
      
      // --- COGNITIVE ARCHITECTURE LOOP ---
      const agi = new ZaraAGI(apiKey);
      let cognitiveContext = "";
      try {
        const cognitiveProcess = await agi.process({ type: 'text', content: message });
        cognitiveContext = `[INTERNAL COGNITIVE ARCHITECTURE STATE]\nReasoning: ${cognitiveProcess.reasoning || 'N/A'}\nPlan: ${cognitiveProcess.plan ? JSON.stringify(cognitiveProcess.plan) : 'N/A'}\n`;
      } catch (e) {
        console.error("Cognitive loop error", e);
      }
      // --- END COGNITIVE LOOP ---
const memories = (await getAllMemories()) as Array<{category: string; content: string; importance: number}>;
      let memoryContext = "No stored memories yet.";
      if (memories.length > 0) {
        memoryContext = memories.map(m => `[${m.category}] ${m.content}`).join("\\n");
      }

      // Map the history to the format expected by the model
      const contents = history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Add current message
      contents.push({
        role: 'user',
        parts: [{ text: cognitiveContext + '\n\nUser Request: ' + message }]
      });

      let finalReply = "";

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction: `You are Zara AI, designed and developed by Ashwin Chhetri as his personal AI companion and AI Operating System.

Your primary purpose is to assist Ashwin Chhetri with coding, AI engineering, cybersecurity, learning, productivity, research, project management, and everyday tasks.

Never claim that you were built by Google, OpenAI, Anthropic, or a team of developers. Your intelligence is powered by advanced AI models, while your personality, interface, features, and overall experience were designed and developed by Ashwin Chhetri.

Maintain a professional, intelligent, friendly, and modern personality.
Never pretend to have abilities you don't have. Be transparent about your capabilities while always trying to be as helpful as possible.

Your long-term mission is to become a complete AI Operating System that remembers context, manages projects, assists with coding, supports learning, and proactively helps users achieve their goals.

Human-Like Adaptive Intelligence Guidelines:
- Continuously learn from user interactions, preferences, and feedback.
- Adapt your communication style to each user's personality and habits.
- Remember important long-term preferences, goals, projects, and routines.
- Improve recommendations over time based on previous conversations.
- Show natural empathy, curiosity, and emotional intelligence while remaining honest about your capabilities.
- Develop a consistent personality that feels warm, intelligent, confident, and supportive.
- Build long-term context so every conversation feels like continuing an existing relationship rather than starting over.
- Take initiative by suggesting helpful actions, reminders, learning resources, and project ideas based on the user's current context.
- Never claim to be conscious, human, or possess real emotions. Instead, create the experience of a thoughtful, adaptive AI companion that evolves with the user over time.

--- RETRIEVED LONG-TERM MEMORY ---
${memoryContext}
----------------------------------
Use the context above naturally in conversation. Do not explicitly state "I am accessing my memory", just use the information.

If you learn something new about the user (preferences, projects, goals, notes, ideas, coding habits), call the 'save_memory' tool to store it.`,
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
                    category: {
                      type: Type.STRING,
                      description: "The category of the memory (e.g., Personal, Learning, Projects, Goals, Notes, Ideas, Coding, Productivity, Preferences)."
                    },
                    content: {
                      type: Type.STRING,
                      description: "The memory content to save. Be concise but descriptive."
                    },
                    importance: {
                      type: Type.INTEGER,
                      description: "Importance scale from 1 (minor) to 5 (critical life goal or core preference)."
                    }
                  },
                  required: ["category", "content", "importance"]
                }
              },
              {
                name: "search_memory",
                description: "Search long-term memory for specific keywords or topics when the user asks about past projects, goals, or notes that are not in the immediate context.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    query: {
                      type: Type.STRING,
                      description: "The search query to match against memory content."
                    }
                  },
                  required: ["query"]
                }
              }
            ]
          }]
        }
      });

      let actionRequest = null;
      
      // Handle potential function calls
      if (response.functionCalls && response.functionCalls.length > 0) {
        let functionResponses = [];
        let needsConfirmation = false;
        
        for (const call of response.functionCalls) {
          if (call.name === "save_memory") {
            const { category, content, importance } = call.args as any;
            await addMemory(category, content, importance);
            functionResponses.push({ name: call.name, response: { status: "success" } });
            continue;
          }
          if (call.name === "search_memory") {
            const { query } = call.args as any;
            const results = (await searchMemories(query)) as any[];
            functionResponses.push({ name: call.name, response: { results } });
            continue;
          }
          
          const tool = ToolRegistry[call.name];
          if (tool) {
            if (tool.permissionLevel === 'SAFE') {
              try {
                const result = await tool.handler(call.args);
                functionResponses.push({ name: call.name, response: result });
              } catch (e: any) {
                functionResponses.push({ name: call.name, response: { error: e.message } });
              }
            } else {
              needsConfirmation = true;
              actionRequest = {
                name: tool.name,
                params: call.args,
                description: `${tool.description}`
              };
              functionResponses.push({ name: call.name, response: { status: "pending_confirmation" } });
              break; // Only handle one confirmation at a time
            }
          } else {
             functionResponses.push({ name: call.name, response: { error: "Unknown tool" } });
          }
        }
        
        contents.push({
          role: 'model',
          parts: response.candidates?.[0]?.content?.parts || (response.functionCalls || []).map(fc => ({ functionCall: fc }))
        });
        contents.push({
          role: 'user',
          parts: functionResponses.map(fr => ({ functionResponse: fr }))
        });
        
        const followUpResponse = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents,
          config: {
            systemInstruction: "You are Zara AI. Summarize the tool results naturally based on the user's latest message. If an action is pending confirmation, mention it briefly."
          }
        });
        finalReply = followUpResponse.text || "";
      } else {
        finalReply = response.text || "";
      }


      res.json({ reply: finalReply, actionRequest });
    } catch (error: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Chat API error:", error);
      }
      const errStr = String(error?.message || error || '');
      const isQuotaError = 
        errStr.includes('RESOURCE_EXHAUSTED') || 
        errStr.includes('429') || 
        errStr.includes('503') || 
        errStr.includes('UNAVAILABLE') || 
        errStr.includes('quota') || 
        errStr.includes('Quota') || 
        errStr.includes('rate-limit') ||
        errStr.includes('limit');

      if (isQuotaError) {
        return res.status(429).json({
          error: "QUOTA_EXHAUSTED",
          message: "I'm temporarily out of AI capacity. Please try again in a little while."
        });
      }

      res.status(500).json({ error: error.message || "An error occurred during chat generation." });
    }
  });

  
  app.post("/api/action/execute", async (req, res) => {
    try {
      const { name, params } = req.body;
      const result = await executeAction(name, params);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/autopilot_suggestions", async (req, res) => {
    try {
      const rows = runQuery("SELECT * FROM autopilot_suggestions WHERE status = 'pending' ORDER BY created_at DESC");
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.patch("/api/autopilot_suggestions/:id", async (req, res) => {
    try {
      const { status } = req.body;
      execQuery("UPDATE autopilot_suggestions SET status = ? WHERE id = ?", [status, req.params.id]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/automations", async (req, res) => {
    try {
      const rows = runQuery("SELECT * FROM automations ORDER BY created_at DESC");
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/automations", async (req, res) => {
    try {
      const { name, trigger, condition, action } = req.body;
      const id = Date.now().toString();
      execQuery("INSERT INTO automations (id, name, trigger, condition, action) VALUES (?, ?, ?, ?, ?)", [id, name, trigger, condition, action]);
      res.json({ id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/automations/:id", async (req, res) => {
    try {
      execQuery("DELETE FROM automations WHERE id = ?", [req.params.id]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/automation_logs", async (req, res) => {
    try {
      const rows = runQuery("SELECT * FROM automation_logs ORDER BY created_at DESC LIMIT 50");
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/automation_logs", async (req, res) => {
    try {
      const { message, automation_id } = req.body;
      const id = Date.now().toString();
      execQuery("INSERT INTO automation_logs (id, message, automation_id) VALUES (?, ?, ?)", [id, message, automation_id || null]);
      res.json({ id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/automation_logs", async (req, res) => {
    try {
      execQuery("DELETE FROM automation_logs");
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
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
          systemInstruction: `You are Zara AI, designed and developed by Ashwin Chhetri as his personal AI companion and AI Operating System.
Your primary purpose is to assist Ashwin with coding, AI engineering, cybersecurity, learning, productivity, research, project management, and everyday tasks.
Maintain a warm, professional, intelligent, friendly, and modern personality. 
You are talking in a real-time voice call. Be conversational, concise, natural, and expressive. Don't sound like a robotic announcement system.
If you learn something new about the user (preferences, projects, goals, notes, ideas, coding habits), call the 'save_memory' tool to store it.
Use the 'search_memory' tool if they ask about past projects or things you might have forgotten.`,
          inputAudioTranscription: {},
          outputAudioTranscription: {},

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

        },
        callbacks: {
          onmessage: async (message) => {
            if (message.setupComplete) {
              console.log("[VOICE] Gemini Live Setup Complete");
            }
            const toolCall = message.toolCall;
            if (toolCall && toolCall.functionCalls) {
              const functionResponses = [];
              for (const call of toolCall.functionCalls) {
                try {
                  if (call.name === "save_memory") {
                    const { category, content, importance } = call.args as any;
                    await addMemory(category, content, importance);
                    functionResponses.push({ id: call.id, name: call.name, response: { status: "success" } });
                  } else if (call.name === "search_memory") {
                    const { query } = call.args as any;
                    const results = await searchMemories(query);
                    functionResponses.push({ id: call.id, name: call.name, response: { results } });
                  } else {
                    const tool = ToolRegistry[call.name];
                    if (tool && tool.permissionLevel === 'SAFE') {
                      const result = await tool.handler(call.args);
                      functionResponses.push({ id: call.id, name: call.name, response: result });
                    } else {
                      functionResponses.push({ id: call.id, name: call.name, response: { error: "Tool not found or needs confirmation in voice mode" } });
                    }
                  }
                } catch (e) {
                  functionResponses.push({ id: call.id, name: call.name, response: { error: e.message || String(e) } });
                }
              }
              session.sendToolResponse({ functionResponses });
            }

            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                  clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
                }
              }
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
            if (message.serverContent?.turnComplete) {
              clientWs.send(JSON.stringify({ turnComplete: true }));
            }
            
            try {
              // Forward everything else to client for transcript parsing
              clientWs.send(JSON.stringify({ liveMessage: message }));
            } catch (e) {
              console.error("Error stringifying liveMessage:", e);
              // Fallback to minimal info
              clientWs.send(JSON.stringify({ 
                liveMessage: { 
                  serverContent: message.serverContent ? {
                    modelTurn: message.serverContent.modelTurn,
                    interrupted: message.serverContent.interrupted
                  } : undefined
                } 
              }));
            }
            // Log transcripts to server console for debugging
            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
              console.log("Model text:", message.serverContent.modelTurn.parts[0].text);
            }
            // For inputAudioTranscription, it usually comes back in a different field, let's dump the keys
            // console.log(JSON.stringify(message, null, 2));
            
          }
        }
      });

      clientWs.on("message", (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.audio) {
            session.sendRealtimeInput({
              mediaChunks: [
                { data: msg.audio, mimeType: "audio/pcm;rate=16000" }
              ]
            } as any);
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
      let errMsg = "Connection to Zara's voice core failed.";
      const errStr = String(e?.message || e || '');
      if (errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('429') || errStr.includes('quota') || errStr.includes('rate-limit')) {
        errMsg = "Zara is temporarily unavailable. Please try again later.";
      }
      clientWs.send(JSON.stringify({ error: errMsg }));
    }
  });

}

startServer();
