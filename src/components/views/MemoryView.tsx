import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { DbMemory } from '../../types';
import { Trash2, Plus, BrainCircuit } from 'lucide-react';

export function MemoryView() {
  const { data: memories, create, remove, clearAll } = useApi<DbMemory>('memories');
  const [newCategory, setNewCategory] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleAdd = () => {
    if (newCategory && newContent) {
      create({ category: newCategory, content: newContent, importance: 3 });
      setNewCategory('');
      setNewContent('');
    }
  };

  return (
    <div className="flex-1 p-10 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-[#7C3AED]" />
          Memory Management
        </h2>
        <button 
          onClick={() => {
            if(window.confirm('Are you sure you want to clear all memories?')) {
              clearAll();
            }
          }}
          className="text-xs text-red-500 hover:text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
        >
          Clear All
        </button>
      </div>
      
      <div className="bg-[#18181B]/50 p-6 rounded-3xl border border-white/5 mb-8">
        <h3 className="text-sm font-semibold mb-4 text-white/90">Add New Memory</h3>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Category (e.g., Preference, Project, Code)" 
            className="bg-[#09090B] border border-white/10 rounded-xl px-4 py-2 text-sm flex-1 outline-none focus:border-[#7C3AED]/50"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Memory content..." 
            className="bg-[#09090B] border border-white/10 rounded-xl px-4 py-2 text-sm flex-[2] outline-none focus:border-[#7C3AED]/50"
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button 
            onClick={handleAdd}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {memories.map(memory => (
          <div key={memory.id} className="bg-[#18181B] border border-white/5 p-4 rounded-2xl flex items-start justify-between group">
            <div>
              <span className="inline-block px-2 py-1 bg-white/5 rounded-lg text-xs font-medium text-[#7C3AED] mb-2">
                {memory.category}
              </span>
              <p className="text-white/90 text-sm">{memory.content}</p>
              <p className="text-xs text-[#A1A1AA] mt-2">Added on {new Date(memory.created_at).toLocaleDateString()}</p>
            </div>
            <button 
              onClick={() => remove(memory.id)}
              className="p-2 text-[#A1A1AA] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-white/5"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {memories.length === 0 && (
          <p className="text-[#A1A1AA] text-sm text-center py-10">No memories stored yet.</p>
        )}
      </div>
    </div>
  );
}
