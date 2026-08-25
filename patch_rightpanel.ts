import fs from 'fs';
let content = fs.readFileSync('src/components/RightPanel.tsx', 'utf8');

content = content.replace(
  'Suggested for you',
  'ZARA ACTION'
);

fs.writeFileSync('src/components/RightPanel.tsx', content);
