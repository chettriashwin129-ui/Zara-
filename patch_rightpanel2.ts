import fs from 'fs';
let content = fs.readFileSync('src/components/RightPanel.tsx', 'utf8');

content = content.replace(
  'Suggested for you',
  'ZARA ACTION'
);

content = content.replace(
  '>Do it<',
  '>{sug.action.replace(/_/g, " ")}<'
);

fs.writeFileSync('src/components/RightPanel.tsx', content);
