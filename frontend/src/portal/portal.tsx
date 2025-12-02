import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './Context/AuthContext';

export default function Portal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(email, password);
    
    if (success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError('Invalid email or password. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-5">
      <div className="w-full max-w-[420px] bg-zinc-900 border-2 border-indigo-500/50 rounded-2xl p-12 shadow-2xl shadow-indigo-500/20 relative">
        {/* Glowy border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl opacity-50 -z-10"></div>
        <div className="absolute inset-[2px] rounded-2xl bg-zinc-900 -z-10"></div>
        
        <div className="text-center mb-10 relative z-10">
          <div className="flex flex-col items-center mb-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-20 h-20 rounded-xl flex items-center justify-center bg-zinc-800/30 border border-zinc-700/50 overflow-hidden">
                <img 
                  src="/TF-Logo.png" 
                  alt="TeamFlow Logo" 
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    console.error('❌ Logo failed to load from /TF-Logo.png');
                    console.error('File should be at: public/TF-Logo.png');
                    const target = e.target as HTMLImageElement;
                    // Don't hide, show a fallback
                    target.style.opacity = '0.3';
                  }}
                  onLoad={() => {
                    console.log('✅ Logo loaded successfully from /TF-Logo.png');
                  }}
                />
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">TeamFlow</h1>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-zinc-400 text-sm">
            Sign in to continue to TeamFlow
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
          {error && (
            <div className="bg-red-950/20 border border-red-900/50 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-zinc-300 text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="you@example.com"
              required
              disabled={isLoading}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white text-sm outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 placeholder:text-zinc-600 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-zinc-300 text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white text-sm outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 placeholder:text-zinc-600 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-500 border border-indigo-700 rounded-lg px-6 py-3.5 text-white text-base font-semibold cursor-pointer mt-2 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center relative z-10">
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-3 mb-4 text-left">
            <p className="text-zinc-400 text-xs mb-2">
              Demo Credentials:
            </p>
            <div className="text-zinc-500 text-xs space-y-1">
              <div>admin@teamflow.com / admin123</div>  
              <div>A.ahmad2313@nu.edu.eg / adhoma2026</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
