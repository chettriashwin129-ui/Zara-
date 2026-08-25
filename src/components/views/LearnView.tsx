import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { DbLearnTopic } from '../../types';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

export function LearnView() {
  const { data: topics, create, update, remove } = useApi<DbLearnTopic>('learn_topics');
  const [newTopic, setNewTopic] = useState('');

  const handleAdd = () => {
    if (newTopic) {
      create({ title: newTopic, progress: 0, notes: '' });
      setNewTopic('');
    }
  };

  return (
    <div className="flex-1 p-10 overflow-y-auto">
      <h2 className="text-3xl font-bold flex items-center gap-3 mb-8">
        <BookOpen className="w-8 h-8 text-[#7C3AED]" />
        Learning Workspace
      </h2>

      <div className="bg-[#18181B]/50 p-4 rounded-3xl border border-white/5 mb-8 flex gap-4 items-center focus-within:border-[#7C3AED]/50 transition-colors">
        <input 
          type="text" 
          placeholder="What do you want to learn next?" 
          className="bg-transparent border-none px-2 py-1 text-sm flex-1 outline-none text-white"
          value={newTopic}
          onChange={e => setNewTopic(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button 
          onClick={handleAdd}
          className="text-[#A1A1AA] hover:text-white transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map(topic => (
          <div key={topic.id} className="bg-[#18181B] border border-white/5 p-6 rounded-2xl relative group">
            <button 
              onClick={() => remove(topic.id)}
              className="absolute top-4 right-4 p-2 text-[#A1A1AA] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-semibold mb-4 pr-8">{topic.title}</h3>
            
            <textarea
              className="w-full bg-[#09090B] border border-white/5 rounded-xl p-3 text-sm text-[#A1A1AA] outline-none focus:border-[#7C3AED]/50 transition-colors mb-4 resize-none h-24"
              placeholder="Study notes..."
              defaultValue={topic.notes}
              onBlur={(e) => update(topic.id, { notes: e.target.value })}
            ></textarea>
            
            <div className="flex justify-between items-center text-xs text-[#A1A1AA] mb-2">
              <span>Mastery</span>
              <span>{topic.progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gradient-to-r from-[#22C55E] to-[#10B981] rounded-full transition-all duration-500" 
                style={{ width: `${topic.progress}%` }}
              ></div>
            </div>
            
            <button 
              onClick={() => update(topic.id, { progress: Math.min(100, topic.progress + 20) })}
              className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors w-full"
            >
              Log Study Session (+20%)
            </button>
          </div>
        ))}
        {topics.length === 0 && (
          <p className="text-[#A1A1AA] text-sm py-10 col-span-2 text-center">Add a topic to start learning.</p>
        )}
      </div>
    </div>
  );
}
