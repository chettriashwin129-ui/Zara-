const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /const audio = message\.serverContent\?\.modelTurn\?\.parts\?\.\[0\]\?\.inlineData\?\.data;\n\s*if \(audio\) \{\n\s*clientWs\.send\(JSON\.stringify\(\{ audio \}\)\);\n\s*\}/g,
  `const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                  clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
                }
              }
            }`
);

fs.writeFileSync('server.ts', code);
