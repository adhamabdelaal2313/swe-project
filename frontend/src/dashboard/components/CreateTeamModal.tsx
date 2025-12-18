import { useState } from 'react';
import { X, Users, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../portal/Context/AuthContext';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: () => void; // Must be used to trigger dashboard refresh
}

// 💡 FIX 1: Destructure onTeamCreated from props
export function CreateTeamModal({ isOpen, onClose, onTeamCreated }: CreateTeamModalProps) {
  const { fetchWithAuth } = useAuth();
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    // 💡 ADJUSTMENT: Robust client-side validation for non-empty/whitespace name
    const trimmedTeamName = teamName.trim();
    if (!trimmedTeamName) {
        setError('Team Name cannot be empty.');
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetchWithAuth('/api/teams', {
        method: 'POST',
        body: JSON.stringify({ 
          title: trimmedTeamName, // Teams controller expects 'title' or 'name'
          description: description || '',
          color: '#FFFFFF' // Default color
        }),
      });

      // We check for response.ok (200-299 status code)
      if (response.ok) {
        setSuccess(true);
        
        // FIX 3: Call onTeamCreated() to refresh dashboard and close modal
        setTimeout(() => {
          onTeamCreated(); // Triggers parent dashboard refresh and close
          setSuccess(false);
          setTeamName('');
          setDescription('');
        }, 1500); 

      } else {
        // If 500 or 400 error occurs
        const errorData = await response.json();
        const errorMessage = errorData.dbError || errorData.message || 'Unknown server error.';
        // The error will be very specific now (e.g., "Duplicate entry...")
        setError(`Failed to create team: ${errorMessage}`);
        console.error("Backend Team Error:", errorData);
      }
      
    } catch (err) {
      setError('Network error: Could not connect to backend server. Check if backend is running.');
      console.error(err);
    } finally {
      // Only set loading false if success timeout hasn't started
      if (!success) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-cyan-400" size={24} />
            Create New Team
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Team Name Input */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Team Name</label>
            <input
              type="text"
              required
              value={teamName}
              // Update state with untrimmed value (trimming happens on submit)
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="e.g. Frontend Squad"
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition-colors h-24 resize-none"
              placeholder="What is this team working on?"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400 text-sm">
              <Check size={16} />
              Team created successfully!
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || success}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
        
        {/* Decorative Top Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
      </div>
    </div>
  );
}