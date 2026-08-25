import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

const oldHandle = `      // Handle potential function calls
      if (response.functionCalls && response.functionCalls.length > 0) {
        let functionResponses = [];
        
        for (const call of response.functionCalls) {
          if (call.name === "save_memory") {
            const { category, content, importance } = call.args as any;
            await addMemory(category, content, importance);
            console.log("Saved memory:", category, content, importance);
            functionResponses.push({ name: call.name, response: { status: "success" } });
          }
          if (call.name === "search_memory") {
            const { query } = call.args as any;
            const results = (await searchMemories(query)) as any[];
            console.log("Searched memory:", query, "Found:", results.length);
            functionResponses.push({ name: call.name, response: { results } });
          }
        }
        
        contents.push({
          role: 'model',
          parts: response.candidates?.[0]?.content?.parts || response.functionCalls.map(fc => ({ functionCall: fc }))
        });
        contents.push({
          role: 'user',
          parts: functionResponses.map(fr => ({ functionResponse: fr }))
        });
        
        const followUpResponse = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents,
          config: {
            systemInstruction: "You are Zara AI. Summarize the tool results naturally based on the user's latest message."
          }
        });
        finalReply = followUpResponse.text || "I updated my memory.";
      } else {
        finalReply = response.text || "";
      }`;

const newHandle = `      let actionRequest = null;
      
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
                description: \`\${tool.description}\`
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
          parts: response.candidates?.[0]?.content?.parts || response.functionCalls.map(fc => ({ functionCall: fc }))
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
`;

content = content.replace(oldHandle, newHandle);
content = content.replace('res.json({ reply: finalReply });', 'res.json({ reply: finalReply, actionRequest });');

fs.writeFileSync('server.ts', content);
