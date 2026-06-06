import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, BookOpen, Users, Trophy } from 'lucide-react';

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' } }),
};

export default function HeroSection({ data }) {
  const title    = data?.title    || 'VJIT IT Academic Hub AI';
  const subtitle = data?.subtitle || 'AI-Powered Digital Academic Ecosystem for the IT Department';
  const tagline  = data?.tagline  || 'Where Innovation Meets Education';

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white dark:bg-zinc-950">
      {/* Background mesh gradient */}
      <div className="absolute inset-0 bg-mesh opacity-40 dark:opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Text content */}
        <div className="space-y-8">
          <motion.div
            custom={0} initial="hidden" animate="visible" variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" />
            {tagline}
          </motion.div>

          <motion.h1
            custom={1} initial="hidden" animate="visible" variants={fadeUp}
            className="text-5xl lg:text-6xl font-bold leading-tight text-gray-900 dark:text-white text-balance"
          >
            {title.split(' IT ')[0]}
            <span className="block gradient-text">IT Academic Hub</span>
            <span className="text-brand-500">AI</span>
          </motion.h1>

          <motion.p
            custom={2} initial="hidden" animate="visible" variants={fadeUp}
            className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl"
          >
            {subtitle}
          </motion.p>

          <motion.div
            custom={3} initial="hidden" animate="visible" variants={fadeUp}
            className="flex flex-wrap gap-4"
          >
            <Link to="/login" className="btn-primary btn-lg shadow-glow">
              Student Login
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#faculty" className="btn-secondary btn-lg">
              Faculty Portal
            </a>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            custom={4} initial="hidden" animate="visible" variants={fadeUp}
            className="flex flex-wrap gap-8 pt-4 border-t border-gray-100 dark:border-zinc-800"
          >
            {[
              { icon: Users,    label: 'Students',   value: '1,200+' },
              { icon: BookOpen, label: 'Subjects',    value: '40+' },
              { icon: Trophy,   label: 'Placements',  value: '95%' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Visual card */}
        <motion.div
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="hidden lg:block"
        >
          <div className="relative">
            <div className="card p-6 space-y-4 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">AI Assignment Analysis</span>
                <span className="badge-green">Live</span>
              </div>
              {[
                { label: 'Originality Score',  value: 92, color: 'bg-emerald-500' },
                { label: 'Understanding',       value: 85, color: 'bg-brand-500' },
                { label: 'Writing Quality',     value: 78, color: 'bg-amber-500' },
                { label: 'AI Probability',      value: 12, color: 'bg-red-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{label}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{value}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${value}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.8 }}
                      className={`h-full rounded-full ${color}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Floating notification card */}
            <motion.div
              animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute -top-6 -right-6 card p-3 shadow-soft flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-900 dark:text-white">Assignment Graded</div>
                <div className="text-xs text-gray-500">42/50 marks</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
