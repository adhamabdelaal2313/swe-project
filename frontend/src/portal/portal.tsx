import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './Context/AuthContext';

export default function Portal() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    let success = false;
    if (isLogin) {
      success = await login(email, password);
    } else {
      success = await register(name, email, password);
    }
    
    if (success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(isLogin ? 'Invalid email or password.' : 'Registration failed. User may already exist.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-5">
      <div className="w-full max-w-[420px] bg-zinc-900 border-2 border-indigo-500/50 rounded-2xl p-10 shadow-2xl shadow-indigo-500/20 relative">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl opacity-50 -z-10"></div>
        <div className="absolute inset-[2px] rounded-2xl bg-zinc-900 -z-10"></div>
        
        <div className="text-center mb-8 relative z-10">
          <div className="flex flex-col items-center mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-zinc-800/30 border border-zinc-700/50 overflow-hidden">
                <img src="/TF-Logo.png" alt="TeamFlow Logo" className="w-full h-full object-contain p-2" />
              </div>
              <h1 className="text-3xl font-bold text-white">TeamFlow</h1>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-zinc-400 text-sm">
            {isLogin ? 'Sign in to continue to TeamFlow' : 'Join TeamFlow and start collaborating'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
          {error && (
            <div className="bg-red-950/20 border border-red-900/50 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-zinc-300 text-xs font-medium uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required={!isLogin}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 placeholder:text-zinc-600"
              />
            </div>
          )}
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-zinc-300 text-xs font-medium uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 placeholder:text-zinc-600"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-zinc-300 text-xs font-medium uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 placeholder:text-zinc-600"
            />
            {!isLogin && (
              <div className="text-[10px] space-y-1 mt-1">
                <p className={password.length >= 8 ? 'text-emerald-500' : 'text-zinc-500'}>• Minimum 8 characters</p>
                <p className={/[A-Z]/.test(password) ? 'text-emerald-500' : 'text-zinc-500'}>• At least one uppercase letter</p>
                <p className={/[a-z]/.test(password) ? 'text-emerald-500' : 'text-zinc-500'}>• At least one lowercase letter</p>
                <p className={/\d/.test(password) ? 'text-emerald-500' : 'text-zinc-500'}>• At least one number</p>
                <p className={/[@$!%*?&]/.test(password) ? 'text-emerald-500' : 'text-zinc-500'}>• At least one special character (@$!%*?&)</p>
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-500 border border-indigo-700 rounded-lg px-6 py-3 text-white text-sm font-semibold cursor-pointer mt-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-60"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center relative z-10">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
