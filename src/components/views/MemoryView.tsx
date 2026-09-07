import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { DbMemory } from '../../types';
import { Trash2, Plus, BrainCircuit, Search, Edit2, Check, X, Star } from 'lucide-react';

export function MemoryView() {
  const { data: memories, create, remove, clearAll } = useApi<DbMemory>('memories');
  const [newCategory, setNewCategory] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newImportance, setNewImportance] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingCategory, setEditingCategory] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const categories = Array.from(new Set(memories.map(m => m.category))).filter(Boolean);

  const handleAdd = () => {
    if (newCategory.trim() && newContent.trim()) {
      create({ category: newCategory.trim(), content: newContent.trim(), importance: newImportance });
      setNewCategory('');
      setNewContent('');
      setNewImportance(3);
    }
  };

  const handleStartEdit = (memory: DbMemory) => {
    setEditingId(memory.id);
    setEditingContent(memory.content);
    setEditingCategory(memory.category);
  };

  const handleSaveEdit = async (id: number | string) => {
    if (editingContent.trim() && editingCategory.trim()) {
      try {
        await fetch(`/api/data/memories/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: editingCategory.trim(), content: editingContent.trim() })
        });
        // Optimistic refresh by reloading data if useApi supports, or window location reload
        window.location.reload();
      } catch (e) {
        console.error(e);
      }
    }
    setEditingId(null);
  };

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          memory.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || memory.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 p-8 md:p-10 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
            <BrainCircuit className="w-8 h-8 text-[#7C3AED]" />
            Zara Brain: Long-Term Memory
          </h2>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Persistent context, preferences, and knowledge accessible across both Voice and Chat sessions.
          </p>
        </div>
        {memories.length > 0 && (
          <button 
            onClick={() => setShowClearConfirm(true)}
            className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 px-3 py-2 rounded-xl transition-colors"
          >
            Clear All Memories
          </button>
        )}
      </div>

      {showClearConfirm && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-between">
          <span className="text-sm text-red-300 font-medium">Are you sure you want to permanently clear all long-term memories?</span>
          <div className="flex gap-2">
            <button 
              onClick={() => { clearAll(); setShowClearConfirm(false); }}
              className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
            >
              Yes, Clear All
            </button>
            <button 
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1 bg-white/10 text-white rounded-lg text-xs hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Add New Memory Card */}
      <div className="bg-[#18181B]/60 p-6 rounded-3xl border border-white/5 mb-8 backdrop-blur-sm">
        <h3 className="text-sm font-semibold mb-4 text-white">Store New Context</h3>
        <div className="flex flex-col md:flex-row gap-3">
          <input 
            type="text" 
            placeholder="Category (e.g. Preference, Project, Work, Tech)" 
            className="bg-[#09090B] border border-white/10 rounded-xl px-4 py-2.5 text-sm md:w-64 outline-none text-white focus:border-[#7C3AED]/50"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Memory content (e.g., Prefers TypeScript, building AI agents, Ashwin prefers concise bullet points)..." 
            className="bg-[#09090B] border border-white/10 rounded-xl px-4 py-2.5 text-sm flex-1 outline-none text-white focus:border-[#7C3AED]/50"
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <div className="flex items-center gap-2">
            <select
              value={newImportance}
              onChange={e => setNewImportance(Number(e.target.value))}
              className="bg-[#09090B] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#7C3AED]/50"
            >
              <option value="1">Priority: Low (1★)</option>
              <option value="3">Priority: Normal (3★)</option>
              <option value="5">Priority: High (5★)</option>
            </select>
            <button 
              onClick={handleAdd}
              disabled={!newCategory.trim() || !newContent.trim()}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Save Memory
            </button>
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#A1A1AA]" />
          <input 
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181B] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-[#A1A1AA] outline-none focus:border-[#7C3AED]/50"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all' ? 'bg-[#7C3AED] text-white' : 'bg-white/5 text-[#A1A1AA] hover:text-white'
            }`}
          >
            All ({memories.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory.toLowerCase() === cat.toLowerCase() ? 'bg-[#7C3AED] text-white' : 'bg-white/5 text-[#A1A1AA] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Memories List */}
      <div className="space-y-3">
        {filteredMemories.map(memory => (
          <div key={memory.id} className="bg-[#18181B]/70 border border-white/5 p-4 rounded-2xl flex items-start justify-between group hover:border-[#7C3AED]/30 transition-colors">
            {editingId === memory.id ? (
              <div className="flex-1 space-y-3 mr-4">
                <input 
                  type="text" 
                  value={editingCategory} 
                  onChange={e => setEditingCategory(e.target.value)}
                  className="bg-[#09090B] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white w-48 outline-none focus:border-[#7C3AED]"
                  placeholder="Category"
                />
                <textarea 
                  value={editingContent} 
                  onChange={e => setEditingContent(e.target.value)}
                  className="w-full bg-[#09090B] border border-white/10 rounded-lg p-2.5 text-sm text-white outline-none focus:border-[#7C3AED] resize-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleSaveEdit(memory.id)}
                    className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                  <button 
                    onClick={() => setEditingId(null)}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-2.5 py-0.5 bg-[#7C3AED]/15 border border-[#7C3AED]/20 rounded-lg text-xs font-medium text-[#7C3AED]">
                    {memory.category}
                  </span>
                  {memory.importance > 0 && (
                    <div className="flex items-center text-amber-400 gap-0.5">
                      {[...Array(Math.min(5, memory.importance || 3))].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-white/90 text-sm leading-relaxed">{memory.content}</p>
                <p className="text-xs text-[#A1A1AA] mt-2">
                  Stored context • {new Date(memory.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
            
            {editingId !== memory.id && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleStartEdit(memory)}
                  className="p-2 text-[#A1A1AA] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  title="Edit Memory"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => remove(memory.id)}
                  className="p-2 text-[#A1A1AA] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete Memory"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
        {filteredMemories.length === 0 && (
          <div className="text-center py-16 bg-[#18181B]/30 rounded-3xl border border-white/5">
            <BrainCircuit className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/60 text-sm font-medium">No memories found</p>
            <p className="text-xs text-[#A1A1AA] mt-1">Add important user preferences, projects, and facts above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
