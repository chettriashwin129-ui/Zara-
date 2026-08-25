import fs from 'fs';
let content = fs.readFileSync('src/components/RightPanel.tsx', 'utf8');

content = content.replace(
  '>\n                      Do it\n                    </button>',
  '>\n                      {sug.action.replace(/_/g, " ").replace(/\\b\\w/g, l => l.toUpperCase())}\n                    </button>'
);

content = content.replace(
  'ZARA ACTION',
  'ZARA ACTION\\n            </h3>\\n            <p className="text-xs text-[#A1A1AA] mb-3 relative z-10">Recommended:</p>'
);

fs.writeFileSync('src/components/RightPanel.tsx', content);
