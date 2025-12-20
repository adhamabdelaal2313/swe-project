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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl w-full max-w-md shadow-2xl relative overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Users className="text-cyan-600 dark:text-cyan-400 sm:w-6 sm:h-6" size={20} />
            <span>Create New Team</span>
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors touch-manipulation p-1">
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          
          {/* Team Name Input */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Team Name</label>
            <input
              type="text"
              required
              value={teamName}
              // Update state with untrimmed value (trimming happens on submit)
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 sm:p-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="e.g. Frontend Squad"
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 sm:p-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors h-20 sm:h-24 resize-none"
              placeholder="What is this team working on?"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 sm:p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-xs sm:text-sm">
              <AlertCircle size={14} className="sm:w-4 sm:h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-2.5 sm:p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg flex items-center gap-2 text-green-600 dark:text-green-400 text-xs sm:text-sm">
              <Check size={14} className="sm:w-4 sm:h-4" />
              <span>Team created successfully!</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors touch-manipulation rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || success}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 dark:hover:bg-cyan-500 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 touch-manipulation w-full sm:w-auto"
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