const fs = require('fs');

function patchFile(filepath) {
  let code = fs.readFileSync(filepath, 'utf8');
  code = code.replace(/await fetch\([^)]+\);/g, (match) => {
    return `${match}.catch(err => console.error(err));`;
  });
  fs.writeFileSync(filepath, code);
}

patchFile('src/components/views/AutopilotView.tsx');
patchFile('src/components/RightPanel.tsx');

