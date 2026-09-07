const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const endpoints = `
  // Conversations API
  app.get('/api/conversations', async (req, res) => {
    try {
      const db = await getDb();
      const conversations = await db.all('SELECT * FROM conversations ORDER BY updated_at DESC');
      res.json(conversations);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/conversations/:id/messages', async (req, res) => {
    try {
      const db = await getDb();
      const messages = await db.all('SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC', [req.params.id]);
      res.json(messages);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/conversations/:id', async (req, res) => {
    try {
      const db = await getDb();
      await db.run('DELETE FROM conversations WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.patch('/api/conversations/:id', async (req, res) => {
    try {
      const { title } = req.body;
      const db = await getDb();
      await db.run('UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [title, req.params.id]);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
`;

code = code.replace("app.post('/api/data/:table'", endpoints + "\n  app.post('/api/data/:table'");
fs.writeFileSync('server.ts', code);
