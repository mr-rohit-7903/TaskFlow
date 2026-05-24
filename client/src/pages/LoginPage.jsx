import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => setForm({ email: 'demo@taskflow.com', password: 'demo123456' });

  const inputCls = 'w-full bg-surface-container-low border border-outline-variant rounded-xl px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition pl-10';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-fixed via-background to-secondary-container/20 flex items-center justify-center p-md">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-xl">
          <h1 className="text-3xl font-black text-on-background tracking-tight">TaskFlow</h1>
          <p className="text-sm text-on-surface-variant mt-1">Enterprise Project Management</p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-modal border border-outline-variant p-xl">
          <h2 className="text-xl font-bold text-on-surface mb-xs">Welcome back</h2>
          <p className="text-sm text-on-surface-variant mb-lg">Sign in to your workspace</p>

          <form onSubmit={handleSubmit} className="space-y-md">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className={inputCls}
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">lock</span>
              <input
                name="password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className={inputCls + ' pr-10'}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">{showPass ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-btn text-white py-sm rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo account */}
          <div className="mt-lg p-md bg-surface-container rounded-xl border border-outline-variant">
            <p className="text-xs text-on-surface-variant text-center mb-sm font-medium">Try a demo account</p>
            <button
              onClick={fillDemo}
              className="w-full text-xs font-semibold text-primary hover:text-primary/80 transition-colors py-1"
            >
              Fill demo credentials →
            </button>
          </div>

          <p className="text-sm text-center text-on-surface-variant mt-lg">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
