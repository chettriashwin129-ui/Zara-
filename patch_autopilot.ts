import fs from 'fs';
let content = fs.readFileSync('src/components/views/AutopilotView.tsx', 'utf8');

content = content.replace(
  'Activity Log',
  'Zara Activity'
);

fs.writeFileSync('src/components/views/AutopilotView.tsx', content);
