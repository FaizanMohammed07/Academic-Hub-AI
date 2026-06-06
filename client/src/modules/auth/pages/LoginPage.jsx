import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, GraduationCap, Users, Shield, Settings } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useLogin } from '@shared/hooks/useAuth';
import { useAuthStore } from '@store/authStore';
import { cn } from '@shared/utils/cn';

const schema = z.object({
  loginId:  z.string().min(1, 'Login ID is required'),
  password: z.string().min(1, 'Password is required'),
  role:     z.enum(['student', 'faculty', 'hod', 'admin']),
});

const ROLES = [
  { value: 'student', label: 'Student',  icon: GraduationCap, color: 'brand' },
  { value: 'faculty', label: 'Faculty',  icon: Users,          color: 'emerald' },
  { value: 'hod',     label: 'HOD',      icon: Shield,         color: 'amber' },
  { value: 'admin',   label: 'Admin',    icon: Settings,       color: 'rose' },
];

const PLACEHOLDER = {
  student: 'Roll Number (e.g. 21BD1A05G1)',
  faculty: 'Employee ID',
  hod:     'Employee ID',
  admin:   'Username',
};

const ROLE_REDIRECT = { student: '/student/dashboard', faculty: '/faculty/dashboard', hod: '/hod/dashboard', admin: '/admin/dashboard' };

export default function LoginPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const { mutate: login, isPending } = useLogin();

  if (isAuthenticated && user?.role) {
    return <Navigate to={ROLE_REDIRECT[user.role] || '/'} replace />;
  }

  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'student' },
  });

  const role = watch('role');

  const onSubmit = (data) => login(data);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-30" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-lg">VJIT IT Academic Hub</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Your Academic<br />
            <span className="text-brand-300">Universe</span><br />
            Awaits
          </h1>
          <p className="text-brand-200 text-lg leading-relaxed max-w-sm">
            AI-powered learning, smart assignments, digital portfolios, and real-time department analytics.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {['Plagiarism Detection', 'Smart Assignment Distribution', 'Academic Portfolio Generator', 'Real-time Analytics'].map((feat, i) => (
            <motion.div
              key={feat}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-3 text-white/80 text-sm"
            >
              <div className="w-5 h-5 rounded-full bg-brand-400/30 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-brand-400" />
              </div>
              {feat}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-zinc-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Select your role and sign in</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {ROLES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue('role', value)}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200',
                  role === value
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400'
                    : 'border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-zinc-700'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">{PLACEHOLDER[role]?.split('(')[0].trim()}</label>
              <input
                {...register('loginId')}
                placeholder={PLACEHOLDER[role]}
                className="input"
                autoComplete="username"
              />
              {errors.loginId && <p className="text-red-500 text-xs mt-1">{errors.loginId.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="input pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full btn-lg mt-2"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Forgot password?{' '}
            <a href="/forgot-password" className="text-brand-500 hover:underline font-medium">
              Reset here
            </a>
          </p>

          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-8">
            IT Department • Vignana Jyothi Institute of Technology
          </p>
        </motion.div>
      </div>
    </div>
  );
}
