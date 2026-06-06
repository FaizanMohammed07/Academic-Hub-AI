import { motion } from "framer-motion";
import { Trophy, Medal, Star } from "lucide-react";

const ACHIEVEMENTS = [
  { title: "Smart India Hackathon 2024", subtitle: "National Finalist", student: "Team Innovators (6 students)", type: "Hackathon", icon: Trophy, color: "amber" },
  { title: "JNTUH Merit Scholarship", subtitle: "University Rank Holders", student: "5 Students – 2023-24", type: "Academic", icon: Medal, color: "brand" },
  { title: "IEEE International Conference", subtitle: "Best Paper Award", student: "Dr. Ramesh Kumar et al.", type: "Research", icon: Star, color: "emerald" },
  { title: "CodeChef University Championship", subtitle: "1st Place – Division II", student: "Sai Kiran (21BD1A05A3)", type: "Coding", icon: Trophy, color: "violet" },
  { title: "NASSCOM Emerging Tech Fest", subtitle: "Innovation Challenge Winner", student: "Team Nexus (4 students)", type: "Innovation", icon: Medal, color: "rose" },
  { title: "TCS iON Career Edge", subtitle: "100% Certification", student: "Entire 2024 Final Year Batch", type: "Certification", icon: Star, color: "sky" },
];

const BADGE_COLOR = {
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  brand: "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
};

export default function AchievementsSection({ data }) {
  const items = data?.achievements || ACHIEVEMENTS;
  return (
    <section id="achievements" className="py-20 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 text-sm font-medium border border-amber-100 dark:border-amber-900 mb-4">Pride Moments</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Student & Faculty Achievements</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">From national competitions to research publications — our department shines at every level.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div key={a.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="card p-5 flex gap-4 hover:shadow-soft transition-shadow group">
                <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${BADGE_COLOR[a.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">{a.title}</div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{a.subtitle}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{a.student}</div>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${BADGE_COLOR[a.color]}`}>{a.type}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
