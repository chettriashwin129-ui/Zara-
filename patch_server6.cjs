const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCatch = `    } catch (e) {
      console.error("Error setting up Gemini Live:", e);
      clientWs.send(JSON.stringify({ error: "Connection to Zara's voice core failed." }));
    }`;

const newCatch = `    } catch (e) {
      console.error("Error setting up Gemini Live:", e);
      let errMsg = "Connection to Zara's voice core failed.";
      const errStr = String(e?.message || e || '');
      if (errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('429') || errStr.includes('quota') || errStr.includes('rate-limit')) {
        errMsg = "I'm temporarily out of AI capacity. Please try again in a little while.";
      }
      clientWs.send(JSON.stringify({ error: errMsg }));
    }`;

code = code.replace(oldCatch, newCatch);

fs.writeFileSync('server.ts', code);
