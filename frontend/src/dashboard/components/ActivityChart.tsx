import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

interface ActivityChartProps {
  data?: Array<{ name: string; tasks: number }>;
}

const defaultData = [
  { name: 'Mon', tasks: 0 }, { name: 'Tue', tasks: 0 },
  { name: 'Wed', tasks: 0 }, { name: 'Thu', tasks: 0 },
  { name: 'Fri', tasks: 0 }, { name: 'Sat', tasks: 0 },
  { name: 'Sun', tasks: 0 },
];

export default function ActivityChart({ data }: ActivityChartProps) {
  const { theme } = useTheme();
  const chartData = (data && data.length > 0) ? data : defaultData;

  const isDark = theme === 'dark';

  return (
    <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-800 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 h-[300px] sm:h-[350px] md:h-[400px] shadow-xl shadow-zinc-200/50 dark:shadow-none relative overflow-hidden w-full min-w-0">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -z-10 rounded-full" />
      <h2 className="text-base sm:text-lg md:text-xl font-black text-zinc-900 dark:text-white mb-4 sm:mb-6 md:mb-8 flex items-center gap-2 sm:gap-3">
        <div className="w-1.5 sm:w-2 h-4 sm:h-5 md:h-6 bg-indigo-500 rounded-full" />
        <span className="truncate">Activity Overview</span>
      </h2>
      <div className="h-[200px] sm:h-[240px] md:h-[280px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#f1f1f4"} vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke={isDark ? "#71717a" : "#a1a1aa"} 
              tick={{fontSize: 10, fontWeight: 700}} 
              axisLine={false} 
              tickLine={false} 
              dy={10}
            />
            <YAxis hide />
            <Tooltip 
              cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
              contentStyle={{ 
                backgroundColor: isDark ? '#18181b' : '#fff', 
                borderColor: isDark ? '#27272a' : '#e4e4e7', 
                color: isDark ? '#fff' : '#000',
                borderRadius: '16px',
                borderWidth: '2px',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                padding: '12px'
              }}
              itemStyle={{ color: '#6366f1', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}
              labelStyle={{ fontWeight: 900, marginBottom: '4px', color: isDark ? '#71717a' : '#a1a1aa', fontSize: '10px', textTransform: 'uppercase' }}
            />
            <Area 
              type="monotone" 
              dataKey="tasks" 
              stroke="#6366f1" 
              strokeWidth={4} 
              fillOpacity={1} 
              fill="url(#colorTasks)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}