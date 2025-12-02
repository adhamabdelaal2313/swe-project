import React, { useState, useEffect } from 'react';
import { Check, Zap, Sparkles, Circle } from 'lucide-react';
import StatCard from './components/StatCard';
import QuickActions from './components/QuickActions';
import ActivityChart from './components/ActivityChart';
import CreateTaskModal from './components/CreateTaskModal';
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
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ totalTasks: 0, todo: 0, inProgress: 0, completed: 0 });
  const [activity, setActivity] = useState<Activity[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      fetch('/api/dashboard/stats')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(console.error);
        
      fetch('/api/dashboard/activity')
        .then(res => res.json())
        .then(data => setActivity(data))
        .catch(console.error);
    };
    fetchData();
    setInterval(fetchData, 2000);
  }, []);

  return (
    <div className="w-full text-white font-sans">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-zinc-400">Welcome back! Here's what's happening with your team.</p>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* ROW 1: STATS (4 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Tasks" value={stats.totalTasks} icon={<Check />} color="cyan" />
          <StatCard title="In Progress" value={stats.inProgress} icon={<Zap />} color="green" />
          <StatCard title="Completed" value={stats.completed} icon={<Sparkles />} color="purple" />
          <StatCard title="To do" value={stats.todo} icon={<Circle />} color="orange" />
        </div>

        {/* ROW 2: MAIN CONTENT (Chart vs Actions) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN (Chart & Activity) - Takes 8/12 width */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <ActivityChart />
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
              <div className="flex flex-col gap-3">
                {activity.length === 0 ? (
                  <p className="text-zinc-500 italic">No recent activity.</p>
                ) : (
                  activity.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-3 hover:bg-zinc-800/50 rounded-xl transition-all">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.5)] mt-1.5"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-300 text-sm">{item.action}</p>
                        {item.user_name && (
                          <p className="text-zinc-500 text-xs mt-1">
                            by <span className="text-indigo-400 font-medium">{item.user_name}</span>
                          </p>
                        )}
                      </div>
                      <span className="text-zinc-600 text-xs ml-auto whitespace-nowrap font-mono">Just now</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* RIGHT COLUMN (Quick Actions) - Takes 4/12 width */}
          <div className="lg:col-span-4 sticky top-8">
            <QuickActions onNewTaskClick={() => setIsModalOpen(true)} />
          </div>

        </div>
      </div>

      {/* Modal Popup */}
      <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}