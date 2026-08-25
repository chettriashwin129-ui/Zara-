const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/inputAudioTranscription: { model: "audio" }/g, "inputAudioTranscription: {}");
code = code.replace(/const { category, content, importance } = call\.args;/g, "const { category, content, importance } = call.args as any;");
code = code.replace(/const { query } = call\.args;/g, "const { query } = call.args as any;");
code = code.replace(/session\.sendToolResponse\(functionResponses\);/g, "session.sendToolResponse({ functionResponses });");

fs.writeFileSync('server.ts', code);
