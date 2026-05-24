import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('All fields required');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to TaskFlow');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-surface-container-low border border-outline-variant rounded-xl px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition pl-10';

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColor = ['', 'bg-error', 'bg-amber-500', 'bg-emerald-500'][strength];
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][strength];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-fixed via-background to-secondary-container/20 flex items-center justify-center p-md">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-xl">
          <h1 className="text-3xl font-black text-on-background tracking-tight">TaskFlow</h1>
          <p className="text-sm text-on-surface-variant mt-1">Enterprise Project Management</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl shadow-modal border border-outline-variant p-xl">
          <h2 className="text-xl font-bold text-on-surface mb-xs">Create your account</h2>
          <p className="text-sm text-on-surface-variant mb-lg">
            {/* First registered user becomes admin */}
            Start managing your team's work today.
          </p>

          <form onSubmit={handleSubmit} className="space-y-md">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">badge</span>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" className={inputCls} autoComplete="name" />
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">email</span>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" className={inputCls} autoComplete="email" />
            </div>

            <div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">lock</span>
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password (min 6 chars)"
                  className={inputCls + ' pr-10'}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-[18px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {form.password && (
                <div className="mt-1.5 flex items-center gap-xs">
                  <div className="flex-1 h-1 bg-surface-container-high rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strengthColor}`} style={{ width: `${(strength / 3) * 100}%` }} />
                  </div>
                  <span className={`text-[10px] font-bold ${['', 'text-error', 'text-amber-500', 'text-emerald-600'][strength]}`}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">lock_reset</span>
              <input
                name="confirm"
                type={showPass ? 'text' : 'password'}
                value={form.confirm}
                onChange={handleChange}
                placeholder="Confirm password"
                className={inputCls + (form.confirm && form.confirm !== form.password ? ' border-error/50 ring-1 ring-error/30' : '')}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-btn text-white py-sm rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-xs text-on-surface-variant text-center mt-md bg-surface-container rounded-xl p-sm">
            <span className="material-symbols-outlined text-[12px] align-middle mr-0.5">info</span>
            The first registered user automatically becomes Admin.
          </p>

          <p className="text-sm text-center text-on-surface-variant mt-lg">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
