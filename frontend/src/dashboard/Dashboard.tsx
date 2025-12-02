import { useState, useEffect } from 'react';
import { Check, Zap, Sparkles, Users } from 'lucide-react';
import StatCard from './components/StatCard';
import QuickActions from './components/QuickActions';
import ActivityChart from './components/ActivityChart';
import CreateTaskModal from './components/CreateTaskModal';
import { CreateTeamModal } from './components/CreateTeamModal'; 

export default function Dashboard() {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const [stats, setStats] = useState({
    pendingTasks: 0,
    completedTasks: 0,
    teamVelocity: 0,
    activeMembers: 0
  });
  const [activities, setActivities] = useState([]);
  
  const fetchDashboardData = async () => {
    try {
      const statsRes = await fetch('http://localhost:5000/api/dashboard/stats');
      const activityRes = await fetch('http://localhost:5000/api/dashboard/activity');
      
      const statsData = await statsRes.json();
      const activityData = await activityRes.json();

      setStats(statsData);
      setActivities(activityData);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <StatCard 
          title="Pending Tasks" 
          value={stats.pendingTasks} 
          icon={<Zap size={24} />} 
          color="purple" 
        />
        <StatCard 
          title="Completed" 
          value={stats.completedTasks} 
          icon={<Check size={24} />} 
          color="green" 
        />
        <StatCard 
          title="Team Velocity" 
          value={`${stats.teamVelocity}/wk`} 
          icon={<Sparkles size={24} />} 
          color="orange" 
        />
        <StatCard 
          title="Active Members" 
          value={stats.activeMembers} 
          icon={<Users size={24} />} 
          color="cyan" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           
          <ActivityChart {...({ data: activities } as any)} />
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
  