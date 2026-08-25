import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

if (!content.includes('ZaraAGI')) {
    content = "import { ZaraAGI } from './src/agi/core.ts';\n" + content;
    
    const target = "const memories = (await getAllMemories()) as Array<{category: string; content: string; importance: number}>;";
    const injection = `
      // --- COGNITIVE ARCHITECTURE LOOP ---
      const agi = new ZaraAGI(apiKey);
      let cognitiveContext = "";
      try {
        const cognitiveProcess = await agi.process({ type: 'text', content: message });
        cognitiveContext = \`[INTERNAL COGNITIVE ARCHITECTURE STATE]\\nReasoning: \${cognitiveProcess.reasoning || 'N/A'}\\nPlan: \${cognitiveProcess.plan ? JSON.stringify(cognitiveProcess.plan) : 'N/A'}\\n\`;
      } catch (e) {
        console.error("Cognitive loop error", e);
      }
      // --- END COGNITIVE LOOP ---
`;
    content = content.replace(target, injection + target);
    
    const target2 = "parts: [{ text: message }]";
    const injection2 = "parts: [{ text: cognitiveContext + '\\n\\nUser Request: ' + message }]";
    content = content.replace(target2, injection2);
    
    fs.writeFileSync('server.ts', content);
    console.log("Patched server.ts successfully");
} else {
    console.log("Already patched");
}
