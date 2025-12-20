import { useState, useEffect } from 'react';
import { Plus, ArrowRight, X, Trash2, UserPlus, Users as UsersIcon } from 'lucide-react';
import { useAuth } from '../portal/Context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Team {
  id: number;
  title: string;
  description: string;
  color: string;
  members: Member[];
  user_team_role?: string;
}

export default function Teams() {
  const { user, fetchWithAuth } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isMembersListModalOpen, setIsMembersListModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [newTeam, setNewTeam] = useState({
    title: '',
    description: '',
    color: 'bg-purple-600'
  });

  const [newMember, setNewMember] = useState({
    email: '',
    role: 'member'
  });

  // Helper to check if current user is admin/owner of a team
  const isTeamAdmin = (team: Team) => {
    return team.user_team_role === 'admin' || team.user_team_role === 'owner';
  };

  // Fetch teams from API
  const fetchTeams = async () => {
    try {
      const response = await fetchWithAuth('/api/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [fetchWithAuth]);

  // CREATE TEAM
  const handleCreateTeam = async () => {
    if (!newTeam.title.trim()) {
      alert('Please enter a team name');
      return;
    }

    try {
      const response = await fetchWithAuth('/api/teams', {
        method: 'POST',
        body: JSON.stringify({
          title: newTeam.title.trim(),
          description: newTeam.description.trim(),
          color: newTeam.color
        })
      });

      if (response.ok) {
        fetchTeams();
        setIsModalOpen(false);
        setNewTeam({ title: '', description: '', color: 'bg-purple-600' });
      } else {
        // Handle error response
        const errorData = await response.json().catch(() => ({ message: 'Failed to create team' }));
        alert(`Failed to create team: ${errorData.message || errorData.error || 'Unknown error'}`);
        console.error('Failed to create team:', errorData);
      }
    } catch (error) {
      console.error('Failed to create team:', error);
      alert('Network error: Could not connect to server. Please try again.');
    }
  };

  // ADD MEMBER
  const handleAddMember = async () => {
    if (!selectedTeam || !newMember.email) return;

    try {
      const response = await fetchWithAuth(`/api/teams/${selectedTeam.id}/members`, {
        method: 'POST',
        body: JSON.stringify(newMember)
      });

      if (response.ok) {
        fetchTeams();
        setIsMemberModalOpen(false);
        setNewMember({ email: '', role: 'member' });
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to add member');
      }
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  // DELETE TEAM
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this team?")) return;

    try {
      const response = await fetchWithAuth(`/api/teams/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTeams(teams.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete team:', error);
    }
  };

  // REMOVE MEMBER
  const handleRemoveMember = async (userId: number) => {
    if (!selectedTeam) return;
    if (!confirm("Remove this member from the team?")) return;

    try {
      const response = await fetchWithAuth(`/api/teams/${selectedTeam.id}/members/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchTeams();
        // Update local state for the modal
        setSelectedTeam({
          ...selectedTeam,
          members: selectedTeam.members.filter(m => m.id !== userId)
        });
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans p-6 md:p-8 flex items-center justify-center">
        <p className="text-zinc-500">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen font-sans relative overflow-hidden p-4 sm:p-6 md:p-8">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-indigo-500/5 blur-[120px] -z-10 pointer-events-none rounded-full" />

      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 md:mb-12">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-900 dark:text-white mb-1 sm:mb-2 tracking-tight">Teams</h1>
            <p className="text-xs sm:text-sm md:text-base text-zinc-500 dark:text-zinc-400 font-medium">Collaborate and manage your team members effortlessly.</p>
        </div>
        
        <button onClick={() => setIsModalOpen(true)} className="group bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black border border-indigo-500 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 sm:gap-3 transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-wider touch-manipulation w-full sm:w-auto">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
            <Plus size={14} className="sm:w-[16px] sm:h-[16px]" strokeWidth={3} />
          </div>
          <span>New Team</span>
        </button>
      </header>

      {/* TEAMS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {teams.map((team) => (
          <div key={team.id} className="group relative bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800/60 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-zinc-50 dark:hover:bg-[#161616] transition-all duration-500 shadow-xl shadow-zinc-200/50 dark:shadow-none hover:-translate-y-1 sm:hover:-translate-y-2">
            {/* Color accent bar */}
            <div className={`absolute left-4 sm:left-6 md:left-8 top-6 sm:top-8 md:top-10 bottom-6 sm:bottom-8 md:bottom-10 w-1 sm:w-1.5 rounded-full ${team.color || 'bg-indigo-500'} opacity-40 group-hover:opacity-100 transition-opacity`}></div>

            <div className="pl-4 sm:pl-6">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight pr-2 break-words">{team.title}</h2>
                <div className="flex gap-1 sm:gap-2 shrink-0">
                  {isTeamAdmin(team) && (
                    <button onClick={() => handleDelete(team.id)} className="p-1.5 sm:p-2 bg-red-50 dark:bg-red-950/20 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all rounded-lg sm:rounded-xl border border-red-100 dark:border-red-900/30 touch-manipulation" title="Delete Team">
                      <Trash2 size={14} className="sm:w-[16px] sm:h-[16px]"/>
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-4 sm:mb-6 md:mb-8 line-clamp-2 leading-relaxed font-medium">{team.description}</p>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8">
                <button 
                  onClick={() => { setSelectedTeam(team); setIsMembersListModalOpen(true); }}
                  className="py-2 sm:py-3 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-zinc-200 dark:border-zinc-800 transition-all flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation"
                >
                  <UsersIcon size={12} className="sm:w-[14px] sm:h-[14px]" /> <span className="whitespace-nowrap">{team.members?.length || 0} Members</span>
                </button>
                
                {isTeamAdmin(team) ? (
                  <button 
                    onClick={() => { setSelectedTeam(team); setIsMemberModalOpen(true); }}
                    className="py-2 sm:py-3 bg-indigo-50 dark:bg-indigo-600/10 hover:bg-indigo-100 dark:hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-indigo-100 dark:border-indigo-500/20 transition-all flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation"
                  >
                    <UserPlus size={12} className="sm:w-[14px] sm:h-[14px]" /> <span>Invite</span>
                  </button>
                ) : (
                  <div className="py-2 sm:py-3 bg-zinc-50 dark:bg-zinc-900/30 text-zinc-400 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-transparent flex items-center justify-center gap-1.5 sm:gap-2 opacity-50">
                    <span>Member</span>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4 sm:pt-6 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center gap-2">
                 <button 
                    onClick={() => navigate(`/kanban?teamId=${team.id}`)}
                    className="text-[10px] sm:text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2 group/btn touch-manipulation whitespace-nowrap"
                 >
                    View Board 
                    <ArrowRight size={12} className="sm:w-[14px] sm:h-[14px] group-hover/btn:translate-x-1 transition-transform" />
                 </button>
                 <div className="flex -space-x-1.5 sm:-space-x-2 shrink-0">
                    {team.members?.slice(0, 3).map((m, i) => (
                      <div key={i} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white dark:border-zinc-900 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[7px] sm:text-[8px] text-white font-black shadow-sm">
                        {(m.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {(team.members?.length || 0) > 3 && (
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[7px] sm:text-[8px] text-zinc-500 font-black">
                        +{(team.members?.length || 0) - 3}
                      </div>
                    )}
                 </div>
              </div>
            </div>
          </div>
        ))}
        {teams.length === 0 && (
          <div className="col-span-full text-center py-20 bg-zinc-50 dark:bg-zinc-900/30 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800">
            <UsersIcon size={48} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-bold">No teams found. Create your first team!</p>
          </div>
        )}
      </div>

      {/* CREATE TEAM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
           <div className="bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-xl p-6 relative shadow-2xl">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors"><X size={20}/></button>
              <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white">New Team</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-500 dark:text-zinc-400 text-xs font-medium uppercase tracking-wider">Team Name</label>
                  <input 
                    autoFocus
                    placeholder="e.g. Frontend Engineering" 
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-zinc-900 dark:text-white text-sm outline-none focus:border-indigo-500 dark:focus:border-purple-600 transition-colors"
                    value={newTeam.title}
                    onChange={e => setNewTeam({...newTeam, title: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-500 dark:text-zinc-400 text-xs font-medium uppercase tracking-wider">Description</label>
                  <textarea 
                    placeholder="What does this team do?" 
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-zinc-900 dark:text-white text-sm outline-none focus:border-indigo-500 dark:focus:border-purple-600 h-24 resize-none transition-colors"
                    value={newTeam.description}
                    onChange={e => setNewTeam({...newTeam, description: e.target.value})}
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-500 dark:text-zinc-400 text-xs font-medium uppercase tracking-wider">Color Theme</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['bg-purple-600', 'bg-cyan-500', 'bg-pink-500', 'bg-emerald-500'].map(color => (
                      <button 
                        key={color} 
                        onClick={() => setNewTeam({...newTeam, color})}
                        className={`h-8 rounded ${color} ${newTeam.color === color ? 'ring-2 ring-indigo-500 dark:ring-white scale-105' : 'opacity-40 hover:opacity-60'} transition-all`}
                      />
                    ))}
                  </div>
                </div>

                <button onClick={handleCreateTeam} className="w-full bg-indigo-600 dark:bg-purple-600 hover:bg-indigo-700 dark:hover:bg-purple-700 text-white font-bold py-3 rounded-lg mt-4 transition-colors shadow-lg shadow-indigo-500/20 dark:shadow-purple-900/20">
                  Create Team
                </button>
              </div>
           </div>
        </div>
      )}

      {/* ADD MEMBER MODAL */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
           <div className="bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 w-full max-w-sm rounded-xl p-6 relative shadow-2xl">
              <button onClick={() => setIsMemberModalOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors"><X size={20}/></button>
              <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white">Add Member</h2>
              <p className="text-zinc-500 text-xs mb-4">Add a user to <strong>{selectedTeam?.title}</strong> by their email address.</p>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-500 dark:text-zinc-400 text-xs font-medium uppercase tracking-wider">User Email</label>
                  <input 
                    autoFocus
                    type="email"
                    placeholder="user@example.com" 
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-zinc-900 dark:text-white text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors"
                    value={newMember.email}
                    onChange={e => setNewMember({...newMember, email: e.target.value})}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-500 dark:text-zinc-400 text-xs font-medium uppercase tracking-wider">Role</label>
                  <select 
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-zinc-900 dark:text-white text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors"
                    value={newMember.role}
                    onChange={e => setNewMember({...newMember, role: e.target.value})}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button onClick={handleAddMember} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg mt-2 transition-colors shadow-lg shadow-indigo-500/20">
                  Add to Team
                </button>
              </div>
           </div>
        </div>
      )}

      {/* MEMBERS LIST MODAL */}
      {isMembersListModalOpen && selectedTeam && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
           <div className="bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-xl p-6 relative shadow-2xl">
              <button 
                onClick={() => setIsMembersListModalOpen(false)} 
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors"
              >
                <X size={20}/>
              </button>
              
              <h2 className="text-xl font-bold mb-2 text-zinc-900 dark:text-white">Team Members</h2>
              <p className="text-zinc-500 text-xs mb-6">Managing members for <strong>{selectedTeam.title}</strong></p>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedTeam.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {(member.name || '??').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{member.name}</p>
                        <p className="text-[10px] text-zinc-500 truncate">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                        member.role === 'owner' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20' : 
                        member.role === 'admin' ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20' : 
                        'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700'
                      }`}>
                        {member.role}
                      </span>
                      {isTeamAdmin(selectedTeam) && member.id !== user?.id && member.role !== 'owner' && (
                        <button 
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors"
                          title="Remove Member"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <button 
                  onClick={() => { setIsMembersListModalOpen(false); setIsMemberModalOpen(true); }}
                  className="w-full py-2.5 bg-indigo-600 dark:bg-white text-white dark:text-black hover:bg-indigo-700 dark:hover:bg-zinc-200 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  <UserPlus size={16} /> Add New Member
                </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
