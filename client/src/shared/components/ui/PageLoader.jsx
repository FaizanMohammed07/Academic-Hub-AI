import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 border-2 border-gray-200 dark:border-zinc-700 border-t-brand-500 rounded-full"
      />
    </div>
  );
}
