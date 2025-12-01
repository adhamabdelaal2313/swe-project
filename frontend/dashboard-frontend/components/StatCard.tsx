import React from 'react';

export default function StatCard({ title, value, icon, color }: any) {
  // Exact colors from your design
  const theme: any = {
    cyan:   { border: 'border-cyan-400', text: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    green:  { border: 'border-lime-500', text: 'text-lime-500', bg: 'bg-lime-500/10' },
    purple: { border: 'border-purple-500', text: 'text-purple-500', bg: 'bg-purple-500/10' },
    orange: { border: 'border-orange-500', text: 'text-orange-500', bg: 'bg-orange-500/10' },
  };

  const style = theme[color] || theme.cyan;

  return (
    <div className={`bg-zinc-900 border-t-4 ${style.border} border-x border-b border-zinc-800 rounded-xl p-6 relative`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">{title}</p>
        </div>
        <div className={`p-3 rounded-lg ${style.bg} ${style.text}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}