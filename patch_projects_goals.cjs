const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const replacement = `
      // --- END COGNITIVE LOOP ---
      const db = await getDb();
      const memories = (await getAllMemories()) as Array<{category: string; content: string; importance: number}>;
      const projects = await db.all('SELECT * FROM projects WHERE status = "active" OR status = "in_progress"');
      const goals = await db.all('SELECT * FROM goals WHERE status = "in_progress"');
      
      let memoryContext = "--- RETRIEVED LONG-TERM MEMORY ---\\n";
      if (memories.length > 0) {
        memoryContext += memories.map(m => \`[\${m.category}] \${m.content}\`).join("\\n") + "\\n\\n";
      } else {
        memoryContext += "No stored memories yet.\\n\\n";
      }

      if (projects.length > 0) {
        memoryContext += "--- ACTIVE PROJECTS ---\\n" + projects.map(p => \`[\${p.title}] \${p.description}\`).join("\\n") + "\\n\\n";
      }
      
      if (goals.length > 0) {
        memoryContext += "--- ACTIVE GOALS ---\\n" + goals.map(g => \`[\${g.title}] \${g.description}\`).join("\\n") + "\\n\\n";
      }
`;

// Find where memories are fetched and replace
const startSearch = "// --- END COGNITIVE LOOP ---";
const startIdx = code.indexOf(startSearch);
if (startIdx !== -1) {
  const endSearch = "// Map the history to the format expected by the model";
  const endIdx = code.indexOf(endSearch, startIdx);
  if (endIdx !== -1) {
    code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
  }
}

// We need to do the same for the Live API
const liveStartSearch = "const memories = (await getAllMemories()) as Array<{category: string; content: string; importance: number}>;";
const liveStartIdx = code.indexOf(liveStartSearch, startIdx + replacement.length); // find next occurrence
if (liveStartIdx !== -1) {
    const liveEndSearch = "const session = await ai.live.connect({";
    const liveEndIdx = code.indexOf(liveEndSearch, liveStartIdx);
    
    if (liveEndIdx !== -1) {
        const liveReplacement = `
      const db = await getDb();
      const memories = (await getAllMemories()) as Array<{category: string; content: string; importance: number}>;
      const projects = await db.all('SELECT * FROM projects WHERE status = "active" OR status = "in_progress"');
      const goals = await db.all('SELECT * FROM goals WHERE status = "in_progress"');
      
      let memoryContext = "--- RETRIEVED LONG-TERM MEMORY ---\\n";
      if (memories.length > 0) {
        memoryContext += memories.map(m => \`[\${m.category}] \${m.content}\`).join("\\n") + "\\n\\n";
      } else {
        memoryContext += "No stored memories yet.\\n\\n";
      }

      if (projects.length > 0) {
        memoryContext += "--- ACTIVE PROJECTS ---\\n" + projects.map(p => \`[\${p.title}] \${p.description}\`).join("\\n") + "\\n\\n";
      }
      
      if (goals.length > 0) {
        memoryContext += "--- ACTIVE GOALS ---\\n" + goals.map(g => \`[\${g.title}] \${g.description}\`).join("\\n") + "\\n\\n";
      }
      
      `;
      code = code.substring(0, liveStartIdx) + liveReplacement + code.substring(liveEndIdx);
    }
}


fs.writeFileSync('server.ts', code);
