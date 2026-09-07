const fs = require('fs');
let code = fs.readFileSync('src/components/views/ChatView.tsx', 'utf-8');

// Add Search Input
const searchInput = `
        <div className="px-4 pb-2 border-b border-white/5">
          <input 
            type="text" 
            placeholder="Search conversations..." 
            className="w-full bg-white/5 rounded-md px-3 py-1.5 text-xs text-white placeholder:text-[#A1A1AA] outline-none border border-transparent focus:border-[#7C3AED]/50"
            onChange={(e) => {
              // This is a quick hack for search: just filter the DOM or state. 
              // To avoid state complexity, we'll just use a local state.
            }}
            id="convSearchInput"
          />
        </div>
`;
// Let's implement search properly with state
if (!code.includes('convSearchQuery')) {
  code = code.replace(
    `const [activeConvId, setActiveConvId] = useState<string | null>(null);`,
    `const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [convSearchQuery, setConvSearchQuery] = useState('');
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingConvTitle, setEditingConvTitle] = useState('');`
  );
  
  code = code.replace(
    `const handleNewChat = () => {`,
    `
  const handleRenameSubmit = async (id: string) => {
    if (editingConvTitle.trim()) {
      try {
        await fetch(\`/api/conversations/\${id}\`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: editingConvTitle.trim() })
        });
        // We could refresh or mutate locally, but for simplicity we rely on next fetch or we can manually update:
        const updated = conversations.map(c => c.id === id ? { ...c, title: editingConvTitle.trim() } : c);
        // We'd need to mutate the useApi cache, but let's just trigger a reload if possible, or just let it be.
        window.location.reload(); // Simple hammer
      } catch (e) {
        console.error(e);
      }
    }
    setEditingConvId(null);
  };
    
  const handleNewChat = () => {`
  );
}

const sidebarReplacement = `
        <div className="p-4 border-b border-white/5 space-y-3">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>
          <input 
            type="text" 
            placeholder="Search conversations..." 
            value={convSearchQuery}
            onChange={(e) => setConvSearchQuery(e.target.value)}
            className="w-full bg-white/5 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-[#A1A1AA] outline-none border border-transparent focus:border-[#7C3AED]/50"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {conversations.filter(c => c.title.toLowerCase().includes(convSearchQuery.toLowerCase())).map(conv => (
            <div 
              key={conv.id}
              onClick={() => { if (editingConvId !== conv.id) setActiveConvId(conv.id); }}
              className={\`w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer group transition-colors \${
                activeConvId === conv.id ? 'bg-[#7C3AED]/20 text-[#7C3AED]' : 'hover:bg-white/5 text-[#A1A1AA] hover:text-white'
              }\`}
            >
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                {editingConvId === conv.id ? (
                  <input
                    type="text"
                    autoFocus
                    value={editingConvTitle}
                    onChange={(e) => setEditingConvTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameSubmit(conv.id);
                      if (e.key === 'Escape') setEditingConvId(null);
                    }}
                    onBlur={() => handleRenameSubmit(conv.id)}
                    className="bg-black/50 text-white text-sm w-full outline-none border-b border-[#7C3AED]"
                  />
                ) : (
                  <span className="text-sm truncate" onDoubleClick={() => { setEditingConvId(conv.id); setEditingConvTitle(conv.title); }}>{conv.title}</span>
                )}
              </div>
              
              {!editingConvId && (
                <button 
                  onClick={(e) => handleDeleteChat(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all rounded-md flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
`;

// replace sidebar
const sideStart = '<div className="p-4 border-b border-white/5">';
const sideEnd = '</div>\n      </div>'; // End of conversations.map div, and then end of sidebar div
// This is fragile, let's use a regex or specific replace
const originalSidebarRegex = /<div className="p-4 border-b border-white\/5">[\s\S]*?<\/button>\s*<\/div>\s*<\/div>/;
// Wait, looking at the previous grep:
/*
        <div className="p-4 border-b border-white/5">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {conversations.map(conv => (
            ...
          ))}
        </div>
*/
const oldSidebar = code.match(/<div className="p-4 border-b border-white\/5">[\s\S]*?\{conversations\.map\(conv => \([\s\S]*?<\/div>\s*\)\)\}\s*<\/div>/);
if (oldSidebar) {
  code = code.replace(oldSidebar[0], sidebarReplacement.trim());
}

fs.writeFileSync('src/components/views/ChatView.tsx', code);
