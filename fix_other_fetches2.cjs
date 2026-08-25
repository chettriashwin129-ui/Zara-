const fs = require('fs');

function patchFile(filepath) {
  let code = fs.readFileSync(filepath, 'utf8');
  code = code.replace(/await fetch\([^;]+;\n/g, (match) => {
    return `${match.trim().slice(0,-1)}.catch(err => console.error(err));\n`;
  });
  fs.writeFileSync(filepath, code);
}

patchFile('src/components/views/AutopilotView.tsx');
patchFile('src/components/RightPanel.tsx');

