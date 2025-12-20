import { useState, useEffect } from 'react';
import { Check, Zap, Sparkles, Circle } from 'lucide-react';
import StatCard from './components/StatCard';
import QuickActions from './components/QuickActions';
import ActivityChart from './components/ActivityChart';
import CreateTaskModal from './components/CreateTaskModal';
import { CreateTeamModal } from './components/CreateTeamModal';
import { useAuth } from '../portal/Context/AuthContext';

interface Activity {
  id: number;
  action: string;
  user_id: number | null;
  user_name: string | null;
  user_email: string | null;
  created_at: string;
}

interface DashboardStats {
  totalTasks: number;
  todo: number;
  inProgress: number;
  completed: number;
  chartData?: Array<{ name: string; tasks: number }>;
}

export default function Dashboard() {
  const { fetchWithAuth } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ totalTasks: 0, todo: 0, inProgress: 0, completed: 0 });
  const [activity, setActivity] = useState<Activity[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const fetchDashboardData = () => {
    fetchWithAuth('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
      
    fetchWithAuth('/api/dashboard/activity')
      .then(res => res.json())
      .then(data => setActivity(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, [fetchWithAuth]);

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-screen font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-indigo-500/5 blur-[120px] -z-10 pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-[200px] sm:w-[250px] md:w-[300px] h-[200px] sm:h-[250px] md:h-[300px] bg-purple-500/5 blur-[100px] -z-10 pointer-events-none rounded-full" />

      {/* HEADER */}
      <div className="mb-6 sm:mb-8 md:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-900 dark:text-white mb-1 sm:mb-2 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 font-medium">
            Welcome back! Here's a snapshot of your workspace.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-zinc-900 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-bold border border-indigo-100 dark:border-indigo-500/20 uppercase tracking-wider">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 sm:gap-8 md:gap-10">
        
        {/* ROW 1: STATS (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          <StatCard title="Total Tasks" value={stats.totalTasks} icon={<Check />} color="cyan" />
          <StatCard title="In Progress" value={stats.inProgress} icon={<Zap />} color="green" />
          <StatCard title="Completed" value={stats.completed} icon={<Sparkles />} color="purple" />
          <StatCard title="To do" value={stats.todo} icon={<Circle />} color="orange" />
        </div>

        {/* ROW 2: MAIN CONTENT (Chart & Activity vs Actions) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 md:gap-10 items-start">
          
          {/* LEFT COLUMN (Chart & Activity) - Takes 8/12 width */}
          <div className="lg:col-span-8 flex flex-col gap-6 sm:gap-8 md:gap-10">
            <div className="transform hover:scale-[1.01] transition-transform duration-300">
              <ActivityChart data={stats.chartData} />
            </div>
            
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-zinc-200/50 dark:shadow-none relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mb-4 sm:mb-6 md:mb-8 flex items-center gap-2 sm:gap-3">
                <div className="w-1.5 sm:w-2 h-4 sm:h-6 bg-indigo-500 rounded-full" />
                Recent Activity
              </h2>
              <div className="flex flex-col gap-3 sm:gap-4">
                {activity.length === 0 ? (
                  <div className="py-8 sm:py-10 text-center">
                    <p className="text-sm sm:text-base text-zinc-400 italic">No recent activity found.</p>
                  </div>
                ) : (
                  activity.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 sm:gap-4 md:gap-5 p-3 sm:p-4 hover:bg-zinc-50 dark:hover:bg-indigo-500/[0.03] rounded-xl sm:rounded-2xl transition-all border border-transparent hover:border-zinc-100 dark:hover:border-indigo-500/10 group">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xs shrink-0 group-hover:scale-110 transition-transform">
                        {(item.user_name || 'U').charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 font-semibold leading-snug break-words">{item.action}</p>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
                          {item.user_name && (
                            <span className="text-indigo-600 dark:text-indigo-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                              {item.user_name}
                            </span>
                          )}
                          <span className="text-zinc-300 dark:text-zinc-700 text-xs">•</span>
                          <span className="text-zinc-400 dark:text-zinc-500 text-[9px] sm:text-[10px] font-bold uppercase">Just now</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* RIGHT COLUMN (Quick Actions) - Takes 4/12 width */}
          <div className="lg:col-span-4 lg:sticky lg:top-8">
            <QuickActions 
              onNewTaskClick={() => setIsTaskModalOpen(true)} 
              onNewTeamClick={() => setIsTeamModalOpen(true)}
            />
          </div>

        </div>
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <CreateTaskModal 
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onTaskCreated={() => {
            setIsTaskModalOpen(false);
            fetchDashboardData(); // Refreshes after Task creation
          }}
        />
      )}

      {/* Team Modal */}
      {isTeamModalOpen && (
        <CreateTeamModal 
          isOpen={isTeamModalOpen} 
          onClose={() => setIsTeamModalOpen(false)} 
          onTeamCreated={() => {
            setIsTeamModalOpen(false);
            fetchDashboardData(); 
          }}
        />
      )}
    </div>
  );
}
