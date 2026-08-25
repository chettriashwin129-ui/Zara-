import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

if (!content.includes('ZaraAGI')) {
    // Add import
    content = content.replace(
        "import { ToolRegistry } from './actions.ts';",
        "import { ToolRegistry } from './actions.ts';\nimport { ZaraAGI } from './src/agi/core.ts';"
    );
    
    // Inject cognitive loop in chat
    const chatRegex = /const ai = new GoogleGenAI\(\{([\s\S]*?)\}\);/g;
    
    // Find where the ai is initialized in /api/chat
    let match;
    let index = -1;
    while ((match = chatRegex.exec(content)) !== null) {
        if (content.substring(match.index - 200, match.index).includes('app.post("/api/chat"')) {
            index = match.index + match[0].length;
            break;
        }
    }
    
    if (index !== -1) {
        const injection = `
      // --- COGNITIVE ARCHITECTURE LOOP ---
      const agi = new ZaraAGI(apiKey);
      const cognitiveProcess = await agi.process({ type: 'text', content: message });
      const cognitiveContext = \`
[INTERNAL COGNITIVE ARCHITECTURE STATE]
Reasoning: \${cognitiveProcess.reasoning || 'N/A'}
Plan: \${cognitiveProcess.plan ? JSON.stringify(cognitiveProcess.plan) : 'N/A'}
\`;
      // --- END COGNITIVE LOOP ---
`;
        content = content.substring(0, index) + injection + content.substring(index);
        
        // Add cognitive context to history
        content = content.replace(
            "contents.push({\n        role: 'user',\n        parts: [{ text: message }]\n      });",
            "contents.push({\n        role: 'user',\n        parts: [{ text: cognitiveContext + '\\n\\nUser Request: ' + message }]\n      });"
        );
        
        fs.writeFileSync('server.ts', content);
        console.log("Patched server.ts successfully");
    } else {
        console.log("Failed to find injection point in server.ts");
    }
} else {
    console.log("Already patched");
}
