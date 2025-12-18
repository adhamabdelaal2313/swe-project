import { useState, useEffect } from 'react';
import { Plus, ArrowRight, X, Trash2, UserPlus, Shield, Users as UsersIcon } from 'lucide-react';
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
    if (!newTeam.title) return;

    try {
      const response = await fetchWithAuth('/api/teams', {
        method: 'POST',
        body: JSON.stringify({
          title: newTeam.title,
          description: newTeam.description,
          color: newTeam.color
        })
      });

      if (response.ok) {
        fetchTeams();
        setIsModalOpen(false);
        setNewTeam({ title: '', description: '', color: 'bg-purple-600' });
      }
    } catch (error) {
      console.error('Failed to create team:', error);
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
            {/* Color accent */}
            <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${team.color || 'bg-white'} opacity-80`}></div>

            <div className="pl-4">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-white mb-1 group-hover:text-purple-100 transition-colors">{team.title}</h2>
                <div className="flex gap-2">
                  {isTeamAdmin(team) && (
                    <button onClick={() => handleDelete(team.id)} className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Team">
                      <Trash2 size={16}/>
                    </button>
                  )}
                </div>
              </div>
              <p className="text-zinc-500 text-sm mb-6 line-clamp-2">{team.description}</p>

              <div className="flex flex-col gap-3 mb-6">
                <button 
                  onClick={() => { setSelectedTeam(team); setIsMembersListModalOpen(true); }}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold border border-zinc-800 transition-all flex items-center justify-center gap-2"
                >
                  <UsersIcon size={14} /> View Members ({team.members?.length || 0})
                </button>
                
                {isTeamAdmin(team) && (
                  <button 
                    onClick={() => { setSelectedTeam(team); setIsMemberModalOpen(true); }}
                    className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-lg text-xs font-semibold border border-indigo-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <UserPlus size={14} /> Add Member
                  </button>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-800/50 flex justify-between items-center">
                 <button 
                    onClick={() => navigate(`/kanban?teamId=${team.id}`)}
                    className="text-xs font-medium text-zinc-400 group-hover:text-white flex items-center gap-1 transition-colors"
                 >
                    View Project <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                 </button>
              </div>
            </div>
          </div>
        ))}
        {teams.length === 0 && (
          <div className="col-span-full text-center py-12 text-zinc-500">
            <p>You aren't a part of any teams yet. Create one or ask to be invited!</p>
          </div>
        )}
      </div>

      {/* CREATE TEAM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
           <div className="bg-[#141414] border border-zinc-800 w-full max-w-md rounded-xl p-6 relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20}/></button>
              <h2 className="text-xl font-bold mb-6 text-white">New Team</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Team Name</label>
                  <input 
                    autoFocus
                    placeholder="e.g. Frontend Engineering" 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white text-sm outline-none focus:border-purple-600"
                    value={newTeam.title}
                    onChange={e => setNewTeam({...newTeam, title: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Description</label>
                  <textarea 
                    placeholder="What does this team do?" 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white text-sm outline-none focus:border-purple-600 h-24 resize-none"
                    value={newTeam.description}
                    onChange={e => setNewTeam({...newTeam, description: e.target.value})}
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Color Theme</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['bg-purple-600', 'bg-cyan-500', 'bg-pink-500', 'bg-emerald-500'].map(color => (
                      <button 
                        key={color} 
                        onClick={() => setNewTeam({...newTeam, color})}
                        className={`h-8 rounded ${color} ${newTeam.color === color ? 'ring-2 ring-white' : 'opacity-40'}`}
                      />
                    ))}
                  </div>
                </div>

                <button onClick={handleCreateTeam} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg mt-4 transition-colors">
                  Create Team
                </button>
              </div>
           </div>
        </div>
      )}

      {/* ADD MEMBER MODAL */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
           <div className="bg-[#141414] border border-zinc-800 w-full max-w-sm rounded-xl p-6 relative">
              <button onClick={() => setIsMemberModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20}/></button>
              <h2 className="text-xl font-bold mb-6 text-white">Add Member</h2>
              <p className="text-zinc-500 text-xs mb-4">Add a user to <strong>{selectedTeam?.title}</strong> by their email address.</p>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider">User Email</label>
                  <input 
                    autoFocus
                    type="email"
                    placeholder="user@example.com" 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white text-sm outline-none focus:border-indigo-600"
                    value={newMember.email}
                    onChange={e => setNewMember({...newMember, email: e.target.value})}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Role</label>
                  <select 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white text-sm outline-none focus:border-indigo-600"
                    value={newMember.role}
                    onChange={e => setNewMember({...newMember, role: e.target.value})}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button onClick={handleAddMember} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg mt-2 transition-colors">
                  Add to Team
                </button>
              </div>
           </div>
        </div>
      )}

      {/* MEMBERS LIST MODAL */}
      {isMembersListModalOpen && selectedTeam && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
           <div className="bg-[#141414] border border-zinc-800 w-full max-w-md rounded-xl p-6 relative">
              <button 
                onClick={() => setIsMembersListModalOpen(false)} 
                className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              >
                <X size={20}/>
              </button>
              
              <h2 className="text-xl font-bold mb-2 text-white">Team Members</h2>
              <p className="text-zinc-500 text-xs mb-6">Managing members for <strong>{selectedTeam.title}</strong></p>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedTeam.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400">
                        {(member.name || '??').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{member.name}</p>
                        <p className="text-[10px] text-zinc-500 truncate">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                        member.role === 'owner' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                        member.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 
                        'bg-zinc-800 text-zinc-500 border border-zinc-700'
                      }`}>
                        {member.role}
                      </span>
                      {isTeamAdmin(selectedTeam) && member.id !== user?.id && member.role !== 'owner' && (
                        <button 
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1.5 hover:bg-red-950/30 text-zinc-600 hover:text-red-400 rounded-md transition-colors"
                          title="Remove Member"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-800">
                <button 
                  onClick={() => { setIsMembersListModalOpen(false); setIsMemberModalOpen(true); }}
                  className="w-full py-2.5 bg-white text-black hover:bg-zinc-200 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
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
