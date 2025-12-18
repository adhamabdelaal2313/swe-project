import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const chartData = (data && data.length > 0) ? data : defaultData;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-[350px]">
      <h2 className="text-lg font-bold text-white mb-4">Task Creation (Last 7 Days)</h2>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="name" stroke="#71717a" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
              itemStyle={{ color: '#818cf8' }}
            />
            <Area type="monotone" dataKey="tasks" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}