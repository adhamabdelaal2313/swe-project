import React, { useState, useEffect } from 'react';
import { Check, Zap, Sparkles, Users } from 'lucide-react';
import StatCard from './components/StatCard';
import QuickActions from './components/QuickActions';
import ActivityChart from './components/ActivityChart';
import CreateTaskModal from './components/CreateTaskModal';

interface Activity {
  id: number;
  action: string;
  created_at: string;
}

interface DashboardStats {
  totalTasks: number;
  inProgress: number;
  completed: number;
  teamMembers: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({ totalTasks: 0, inProgress: 0, completed: 0, teamMembers: 0 });
  const [activity, setActivity] = useState<Activity[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 bg-black min-h-screen text-white font-sans">
      
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
          <StatCard title="Members" value={stats.teamMembers} icon={<Users />} color="orange" />
        </div>

        <div className="space-y-8">
          <QuickActions 
            onNewTaskClick={() => setIsTaskModalOpen(true)} 
            onNewTeamClick={() => setIsTeamModalOpen(true)}
          />
        </div>
      </div>

      {isTaskModalOpen && (
        <CreateTaskModal 
          // 💡 FIX: ADD THESE TWO ESSENTIAL PROPS BACK
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          // The onTaskCreated prop is correctly defined below:
          onTaskCreated={() => {
            setIsTaskModalOpen(false);
            fetchDashboardData(); // Refreshes after Task creation
          }}
        />
      )}
      {isTeamModalOpen && (
        <CreateTeamModal 
          isOpen={isTeamModalOpen} 
          onClose={() => setIsTeamModalOpen(false)} 
          // 💡 NEW PROP: Wire up the refresh logic for Team creation
          onTeamCreated={() => {
            setIsTeamModalOpen(false);
            fetchDashboardData(); 
          }}
        />
      )}
    </div>
  );
}
  