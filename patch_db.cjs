const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Replace db.all and db.run with runQuery and execQuery
code = code.replace(/const db = await getDb\(\);\s+const conversations = await db\.all\('SELECT \* FROM conversations ORDER BY updated_at DESC'\);/g, `const conversations = await runQuery('SELECT * FROM conversations ORDER BY updated_at DESC');`);
code = code.replace(/const db = await getDb\(\);\s+const messages = await db\.all\('SELECT \* FROM messages WHERE conversation_id = \? ORDER BY timestamp ASC', \[req\.params\.id\]\);/g, `const messages = await runQuery('SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC', [req.params.id]);`);
code = code.replace(/const db = await getDb\(\);\s+await db\.run\('DELETE FROM conversations WHERE id = \?', \[req\.params\.id\]\);/g, `await execQuery('DELETE FROM conversations WHERE id = ?', [req.params.id]);`);
code = code.replace(/const db = await getDb\(\);\s+await db\.run\('UPDATE conversations SET title = \?, updated_at = CURRENT_TIMESTAMP WHERE id = \?', \[title, req\.params\.id\]\);/g, `await execQuery('UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [title, req.params.id]);`);

// And for the memoryContext construction:
code = code.replace(/const db = await getDb\(\);\s+const memories = \(await getAllMemories\(\)\) as Array<\{category: string; content: string; importance: number\}>;\s+const projects = await db\.all\('SELECT \* FROM projects WHERE status = "active" OR status = "in_progress"'\);\s+const goals = await db\.all\('SELECT \* FROM goals WHERE status = "in_progress"'\);/g, `const memories = (await getAllMemories()) as Array<{category: string; content: string; importance: number}>;
      const projects = (await runQuery('SELECT * FROM projects WHERE status = "active" OR status = "in_progress"')) as Array<any>;
      const goals = (await runQuery('SELECT * FROM goals WHERE status = "in_progress"')) as Array<any>;`);

// For the send error:
code = code.replace(/session\.send\(\{ clientContent: msg\.clientContent \}\);/g, `(session as any).send({ clientContent: msg.clientContent });`);
code = code.replace(/session\.send\(\{ realtimeInput: msg\.realtimeInput \}\);/g, `(session as any).send({ realtimeInput: msg.realtimeInput });`);

fs.writeFileSync('server.ts', code);
