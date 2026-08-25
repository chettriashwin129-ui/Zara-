const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `          onmessage: (message) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;`;

const newHandlerStr = `          onmessage: async (message) => {
            const toolCall = message.toolCall;
            if (toolCall && toolCall.functionCalls) {
              const functionResponses = [];
              for (const call of toolCall.functionCalls) {
                try {
                  if (call.name === "save_memory") {
                    const { category, content, importance } = call.args;
                    await addMemory(category, content, importance);
                    functionResponses.push({ id: call.id, name: call.name, response: { status: "success" } });
                  } else if (call.name === "search_memory") {
                    const { query } = call.args;
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
              session.sendToolResponse(functionResponses);
            }

            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;`;

code = code.replace(targetStr, newHandlerStr);

fs.writeFileSync('server.ts', code);
