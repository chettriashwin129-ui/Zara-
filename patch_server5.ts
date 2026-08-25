import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

const actionEndpoint = `
  app.post("/api/action/execute", async (req, res) => {
    try {
      const { name, params } = req.body;
      const result = await executeAction(name, params);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
`;

content = content.replace('app.get("/api/autopilot_suggestions",', actionEndpoint + '\n  app.get("/api/autopilot_suggestions",');

fs.writeFileSync('server.ts', content);
