import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'cyan' | 'green' | 'purple' | 'orange';
}

export default function StatCard({ title, value, icon, color }: StatCardProps) {
  // Exact colors from your design
  const theme: Record<StatCardProps['color'], { border: string; text: string; bg: string; shadow: string }> = {
    cyan:   { border: 'border-cyan-400', text: 'text-cyan-400', bg: 'bg-cyan-400/10', shadow: 'shadow-cyan-500/10' },
    green:  { border: 'border-lime-500', text: 'text-lime-500', bg: 'bg-lime-500/10', shadow: 'shadow-lime-500/10' },
    purple: { border: 'border-purple-500', text: 'text-purple-500', bg: 'bg-purple-500/10', shadow: 'shadow-purple-500/10' },
    orange: { border: 'border-orange-500', text: 'text-orange-500', bg: 'bg-orange-500/10', shadow: 'shadow-orange-500/10' },
  };

  const style = theme[color] || theme.cyan;

  return (
    <div className={`bg-white dark:bg-zinc-900 border-t-4 ${style.border} border-x border-b border-zinc-200 dark:border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 relative shadow-lg ${style.shadow} dark:shadow-none hover:translate-y-[-2px] transition-all duration-300 overflow-hidden w-full min-w-0`}>
      <div className={`absolute -right-8 -top-8 w-24 h-24 ${style.bg} rounded-full blur-2xl opacity-50`}></div>
      <div className="flex justify-between items-start relative z-10 gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-1 truncate">{value}</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest truncate">{title}</p>
        </div>
        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${style.bg} ${style.text} shadow-inner flex-shrink-0`}>
          {React.cloneElement(icon as React.ReactElement<{ size?: number; strokeWidth?: number }>, { size: 20, strokeWidth: 2.5 })}
        </div>
      </div>
    </div>
  );
}