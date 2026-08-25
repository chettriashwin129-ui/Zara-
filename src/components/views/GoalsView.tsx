import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { DbGoal } from '../../types';
import { Target, Plus, Trash2 } from 'lucide-react';

export function GoalsView() {
  const { data: goals, create, update, remove } = useApi<DbGoal>('goals');
  const [newGoal, setNewGoal] = useState('');

  const handleAdd = () => {
    if (newGoal) {
      create({ title: newGoal, progress: 0, completed: 0 });
      setNewGoal('');
    }
  };

  return (
    <div className="flex-1 p-10 overflow-y-auto">
      <h2 className="text-3xl font-bold flex items-center gap-3 mb-8">
        <Target className="w-8 h-8 text-[#7C3AED]" />
        Goals
      </h2>

      <div className="bg-[#18181B]/50 p-4 rounded-3xl border border-white/5 mb-8 flex gap-4 items-center focus-within:border-[#7C3AED]/50 transition-colors">
        <input 
          type="text" 
          placeholder="Define a new goal..." 
          className="bg-transparent border-none px-2 py-1 text-sm flex-1 outline-none text-white"
          value={newGoal}
          onChange={e => setNewGoal(e.target.value)}
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
        {goals.map(goal => (
          <div key={goal.id} className="bg-[#18181B] border border-white/5 p-6 rounded-2xl relative group">
            <button 
              onClick={() => remove(goal.id)}
              className="absolute top-4 right-4 p-2 text-[#A1A1AA] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-semibold mb-4 pr-8">{goal.title}</h3>
            
            <div className="mb-2 flex justify-between text-xs text-[#A1A1AA]">
              <span>Progress</span>
              <span>{goal.progress}%</span>
            </div>
            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] rounded-full transition-all duration-500" 
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => update(goal.id, { progress: Math.min(100, goal.progress + 10) })}
                className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                +10%
              </button>
              <button 
                onClick={() => update(goal.id, { progress: 100, completed: 1 })}
                className="text-xs bg-[#7C3AED]/20 text-[#7C3AED] hover:bg-[#7C3AED]/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                Complete
              </button>
            </div>
          </div>
        ))}
        {goals.length === 0 && (
          <p className="text-[#A1A1AA] text-sm py-10 col-span-2 text-center">No active goals. Time to aim high!</p>
        )}
      </div>
    </div>
  );
}
