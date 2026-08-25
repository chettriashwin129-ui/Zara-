import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { DbProject } from '../../types';
import { FolderKanban, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export function ProjectsView() {
  const { data: projects, create, update, remove } = useApi<DbProject>('projects');
  const [newProject, setNewProject] = useState('');

  const handleAdd = () => {
    if (newProject) {
      create({ title: newProject, progress: 0, active: 0, completed: 0 });
      setNewProject('');
    }
  };

  const setActiveProject = (id: string) => {
    projects.forEach(p => {
      if (p.id === id) {
        update(p.id, { active: 1 });
      } else if (p.active) {
        update(p.id, { active: 0 });
      }
    });
  };

  return (
    <div className="flex-1 p-10 overflow-y-auto">
      <h2 className="text-3xl font-bold flex items-center gap-3 mb-8">
        <FolderKanban className="w-8 h-8 text-[#7C3AED]" />
        Projects
      </h2>

      <div className="bg-[#18181B]/50 p-4 rounded-3xl border border-white/5 mb-8 flex gap-4 items-center focus-within:border-[#7C3AED]/50 transition-colors">
        <input 
          type="text" 
          placeholder="Start a new project..." 
          className="bg-transparent border-none px-2 py-1 text-sm flex-1 outline-none text-white"
          value={newProject}
          onChange={e => setNewProject(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button 
          onClick={handleAdd}
          className="text-[#A1A1AA] hover:text-white transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {projects.map(project => (
          <div key={project.id} className={`bg-[#18181B] border ${project.active ? 'border-[#7C3AED]/50' : 'border-white/5'} p-6 rounded-2xl relative group flex flex-col md:flex-row md:items-center gap-6`}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold pr-8">{project.title}</h3>
                {project.active && <span className="bg-[#7C3AED]/20 text-[#7C3AED] text-[10px] uppercase font-bold px-2 py-1 rounded-full tracking-wider">Active</span>}
              </div>
              
              <div className="flex justify-between text-xs text-[#A1A1AA] mb-2 max-w-md">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full max-w-md h-2 bg-black/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] rounded-full transition-all duration-500" 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => update(project.id, { progress: Math.min(100, project.progress + 10) })}
                className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                +10%
              </button>
              {!project.active && (
                <button 
                  onClick={() => setActiveProject(project.id)}
                  className="text-xs border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Set Active
                </button>
              )}
              <button 
                onClick={() => remove(project.id)}
                className="p-2 text-[#A1A1AA] hover:text-red-500 transition-colors rounded-lg bg-white/5"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <p className="text-[#A1A1AA] text-sm py-10 text-center">No projects yet. Start building!</p>
        )}
      </div>
    </div>
  );
}
