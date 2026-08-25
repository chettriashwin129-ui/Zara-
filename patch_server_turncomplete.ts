import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const target = `            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }`;
const injection = `            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
            if (message.serverContent?.turnComplete) {
              clientWs.send(JSON.stringify({ turnComplete: true }));
            }`;

content = content.replace(target, injection);
fs.writeFileSync('server.ts', content);
console.log("Patched server.ts with turnComplete");
