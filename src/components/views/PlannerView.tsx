import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { DbTask } from '../../types';
import { Calendar, Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';

export function PlannerView() {
  const { data: tasks, create, update, remove } = useApi<DbTask>('planner_tasks');
  const [newTask, setNewTask] = useState('');

  const handleAdd = () => {
    if (newTask) {
      create({ title: newTask, completed: 0 });
      setNewTask('');
    }
  };

  const toggleTask = (task: DbTask) => {
    update(task.id, { completed: task.completed ? 0 : 1 });
  };

  return (
    <div className="flex-1 p-10 overflow-y-auto">
      <h2 className="text-3xl font-bold flex items-center gap-3 mb-8">
        <Calendar className="w-8 h-8 text-[#7C3AED]" />
        Planner
      </h2>

      <div className="bg-[#18181B]/50 p-4 rounded-3xl border border-white/5 mb-8 flex gap-4 items-center focus-within:border-[#7C3AED]/50 transition-colors">
        <input 
          type="text" 
          placeholder="Add a new task..." 
          className="bg-transparent border-none px-2 py-1 text-sm flex-1 outline-none text-white"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button 
          onClick={handleAdd}
          className="text-[#A1A1AA] hover:text-white transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} className="bg-[#18181B] border border-white/5 p-4 rounded-2xl flex items-center gap-4 group hover:bg-white/5 transition-colors">
            <button onClick={() => toggleTask(task)} className="text-[#A1A1AA] hover:text-[#7C3AED] transition-colors">
              {task.completed ? <CheckCircle2 className="w-5 h-5 text-[#7C3AED]" /> : <Circle className="w-5 h-5" />}
            </button>
            <span className={`flex-1 text-sm ${task.completed ? 'text-[#A1A1AA] line-through' : 'text-white'}`}>
              {task.title}
            </span>
            <button 
              onClick={() => remove(task.id)}
              className="p-2 text-[#A1A1AA] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-[#A1A1AA] text-sm text-center py-10">You have no tasks. Add one above.</p>
        )}
      </div>
    </div>
  );
}
