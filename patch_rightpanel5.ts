import fs from 'fs';
let content = fs.readFileSync('src/components/RightPanel.tsx', 'utf8');

// I'll just use a regex replace
content = content.replace(/ZARA ACTION\\n\s*<\/h3>\\n\s*<p[^>]*>Recommended:<\/p>\s*<\/h3>/, 
`ZARA ACTION
            </h3>
            <p className="text-xs text-[#A1A1AA] mb-3 relative z-10">Recommended:</p>`);

fs.writeFileSync('src/components/RightPanel.tsx', content);
