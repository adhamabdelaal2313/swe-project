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
    <div className="min-h-screen font-sans relative p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-indigo-500/5 blur-[120px] -z-10 pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-[200px] sm:w-[250px] md:w-[300px] h-[200px] sm:h-[250px] md:h-[300px] bg-purple-500/5 blur-[100px] -z-10 pointer-events-none rounded-full" />

      {/* HEADER */}
      <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-14 sm:pt-16 md:pt-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white mb-1 sm:mb-2 tracking-tight break-words">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-zinc-500 dark:text-zinc-400 font-medium">
            Welcome back! Here's a snapshot of your workspace.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border-2 border-zinc-300 dark:border-zinc-800 shadow-md dark:shadow-sm flex-shrink-0">
          <div className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-md sm:rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] sm:text-xs md:text-sm font-bold border border-indigo-100 dark:border-indigo-500/20 uppercase tracking-wider whitespace-nowrap">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
        
        {/* ROW 1: STATS (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          <StatCard title="Total Tasks" value={stats.totalTasks} icon={<Check />} color="cyan" />
          <StatCard title="In Progress" value={stats.inProgress} icon={<Zap />} color="green" />
          <StatCard title="Completed" value={stats.completed} icon={<Sparkles />} color="purple" />
          <StatCard title="To do" value={stats.todo} icon={<Circle />} color="orange" />
        </div>

        {/* ROW 2: MAIN CONTENT (Chart & Activity vs Quick Actions) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8 items-start">
          
          {/* LEFT COLUMN (Chart & Activity) - Takes 8/12 width */}
          <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-6 md:gap-8">
            <div className="transform hover:scale-[1.01] transition-transform duration-300 w-full overflow-hidden">
              <ActivityChart data={stats.chartData} />
            </div>
            
            <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-800 rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-xl shadow-zinc-200/50 dark:shadow-none relative overflow-hidden w-full">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              <h2 className="text-base sm:text-lg md:text-xl font-black text-zinc-900 dark:text-white mb-4 sm:mb-6 md:mb-8 flex items-center gap-2 sm:gap-3">
                <div className="w-1.5 sm:w-2 h-4 sm:h-5 md:h-6 bg-indigo-500 rounded-full flex-shrink-0" />
                <span className="truncate">Recent Activity</span>
              </h2>
              <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
                {activity.length === 0 ? (
                  <div className="py-6 sm:py-8 md:py-10 text-center">
                    <p className="text-xs sm:text-sm md:text-base text-zinc-400 italic">No recent activity found.</p>
                  </div>
                ) : (
                  activity.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 hover:bg-zinc-50 dark:hover:bg-indigo-500/[0.03] rounded-lg sm:rounded-xl md:rounded-2xl transition-all border border-transparent hover:border-zinc-100 dark:hover:border-indigo-500/10 group min-w-0">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-md sm:rounded-lg md:rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-[10px] sm:text-xs shrink-0 group-hover:scale-110 transition-transform">
                        {(item.user_name || 'U').charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] sm:text-xs md:text-sm text-zinc-800 dark:text-zinc-200 font-semibold leading-snug break-words">{item.action}</p>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 md:gap-2 mt-1 sm:mt-1.5">
                          {item.user_name && (
                            <span className="text-indigo-600 dark:text-indigo-400 text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-wider truncate">
                              {item.user_name}
                            </span>
                          )}
                          <span className="text-zinc-300 dark:text-zinc-700 text-[10px] sm:text-xs">•</span>
                          <span className="text-zinc-400 dark:text-zinc-500 text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase">Just now</span>
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
