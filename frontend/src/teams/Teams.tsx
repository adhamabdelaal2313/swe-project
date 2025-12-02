import React, { useState, useEffect } from 'react';
import { Plus, ArrowRight, X, Trash2 } from 'lucide-react';

interface Member {
  initials: string;
  color: string;
}

interface Team {
  id: number;
  title: string;
  description: string;
  color: string;
  members: Member[];
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [newTeam, setNewTeam] = useState({
    title: '',
    description: '',
    color: 'bg-purple-600'
  });

  // Fetch teams from API
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams');
        if (response.ok) {
          const data = await response.json();
          // Convert API data to component format
          const formattedTeams = data.map((team: any) => ({
            id: team.id,
            title: team.title,
            description: team.description || '',
            color: team.color || 'bg-purple-600',
            members: team.members || []
          }));
          setTeams(formattedTeams);
        }
      } catch (error) {
        console.error('Failed to fetch teams:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  // CREATE TEAM
  const handleCreateTeam = async () => {
    if (!newTeam.title) return;

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTeam.title,
          description: newTeam.description,
          color: newTeam.color,
          members: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTeams([...teams, {
          id: data.id,
          title: newTeam.title,
          description: newTeam.description,
          color: newTeam.color,
          members: []
        }]);
        setIsModalOpen(false);
        setNewTeam({ title: '', description: '', color: 'bg-purple-600' });
      }
    } catch (error) {
      console.error('Failed to create team:', error);
    }
  };

  // DELETE TEAM
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this team?")) return;

    try {
      const response = await fetch(`/api/teams/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTeams(teams.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete team:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans p-6 md:p-8 flex items-center justify-center">
        <p className="text-zinc-500">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#09090b] text-zinc-100 font-sans">
      
      {/* HEADER */}
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Teams</h1>
          <p className="text-zinc-500 text-sm">Organize your team members into groups</p>
        </div>
        
        <button onClick={() => setIsModalOpen(true)} className="bg-[#2E1065] hover:bg-[#3b0764] text-purple-100 px-5 py-2.5 rounded-lg text-sm font-medium border border-purple-900/50 flex items-center gap-2 transition-all shadow-lg shadow-purple-900/20">
          <Plus size={18} /> New Team
        </button>
      </header>

      {/* TEAMS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="group relative bg-[#121212] border border-zinc-800/60 rounded-2xl p-6 hover:border-zinc-700 hover:bg-[#161616] transition-all duration-300">
            {/* Neon Bar */}
            <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${team.color} shadow-[0_0_10px_-2px_rgba(255,255,255,0.3)] opacity-80`}></div>

            <div className="pl-4">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-white mb-1 group-hover:text-purple-100 transition-colors">{team.title}</h2>
                <button onClick={() => handleDelete(team.id)} className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
              </div>
              <p className="text-zinc-500 text-sm mb-8 line-clamp-2">{team.description}</p>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {team.members && team.members.length > 0 ? (
                    team.members.map((member: any, i: number) => {
                      const initials = typeof member === 'string' ? member.substring(0, 2).toUpperCase() : member.initials || 'ME';
                      const color = typeof member === 'string' ? 'bg-emerald-900 text-emerald-200' : member.color || 'bg-emerald-900 text-emerald-200';
                      return (
                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#121212] flex items-center justify-center text-[10px] font-bold ${color}`}>
                          {initials}
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-zinc-600 text-xs">No members</span>
                  )}
                </div>
                <span className="text-zinc-500 text-xs font-medium">{team.members?.length || 0} members</span>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/50 flex justify-between items-center">
                 <button className="text-xs font-medium text-zinc-400 group-hover:text-white flex items-center gap-1 transition-colors">
                    View Team <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                 </button>
              </div>
            </div>
          </div>
        ))}
        {teams.length === 0 && (
          <div className="col-span-full text-center py-12 text-zinc-500">
            <p>No teams yet. Create your first team!</p>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
           <div className="bg-[#141414] border border-zinc-800 w-full max-w-md rounded-xl p-6 relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20}/></button>
              <h2 className="text-xl font-bold mb-6 text-white">New Team</h2>
              
              <div className="space-y-4">
                <input 
                  autoFocus
                  placeholder="Team Name (e.g. Mobile Squad)" 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-purple-600"
                  value={newTeam.title}
                  onChange={e => setNewTeam({...newTeam, title: e.target.value})}
                />
                <textarea 
                  placeholder="Description" 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-purple-600 h-24 resize-none"
                  value={newTeam.description}
                  onChange={e => setNewTeam({...newTeam, description: e.target.value})}
                />
                
                <div className="grid grid-cols-4 gap-2">
                   {['bg-purple-600', 'bg-cyan-500', 'bg-pink-500', 'bg-lime-500'].map(color => (
                     <button 
                       key={color} 
                       onClick={() => setNewTeam({...newTeam, color})}
                       className={`h-8 rounded ${color} ${newTeam.color === color ? 'ring-2 ring-white' : 'opacity-50'}`}
                     />
                   ))}
                </div>

                <button onClick={handleCreateTeam} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg mt-2">
                  Create Team
                </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

