import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', tasks: 4 }, { name: 'Tue', tasks: 3 },
  { name: 'Wed', tasks: 7 }, { name: 'Thu', tasks: 5 },
  { name: 'Fri', tasks: 8 }, { name: 'Sat', tasks: 12 },
  { name: 'Sun', tasks: 9 },
];

export default function ActivityChart() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-[350px]">
      <h2 className="text-lg font-bold text-white mb-4">Weekly Progress</h2>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
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