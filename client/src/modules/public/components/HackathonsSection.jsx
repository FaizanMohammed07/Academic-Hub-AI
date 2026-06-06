import { motion } from "framer-motion";
import { Trophy, Users, CalendarDays, Medal } from "lucide-react";

const HACKATHONS = [
  { name: "Smart India Hackathon 2024", organizer: "MoE", result: "Finalists", team: "CodeCraft IT", members: 6, date: "Dec 2024", prize: "₹1 Lakh", rank: "Top 5", color: "amber" },
  { name: "JNTUH HackFest 2024", organizer: "JNTUH", result: "1st Place", team: "ByteForce", members: 4, date: "Oct 2024", prize: "₹75,000", rank: "Winner", color: "emerald" },
  { name: "NASSCOM Hack 2024", organizer: "NASSCOM", result: "2nd Place", team: "InnoIT", members: 5, date: "Sep 2024", prize: "₹50,000", rank: "Runner-up", color: "brand" },
  { name: "HackHyderabad 2023", organizer: "T-Hub", result: "3rd Place", team: "NexGen IT", members: 3, date: "Jul 2023", prize: "₹25,000", rank: "3rd", color: "purple" },
  { name: "Google DevFest Hack", organizer: "Google", result: "Participants", team: "CloudIT VJIT", members: 4, date: "Nov 2023", prize: "—", rank: "Top 20", color: "blue" },
  { name: "IEEE Xtreme Coding", organizer: "IEEE", result: "Top 10%", team: "AlgoIT", members: 3, date: "Oct 2023", prize: "Certificate", rank: "National", color: "rose" },
];

const RANK_COLORS = { Winner:"bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-200 dark:border-amber-800", "Runner-up":"bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-zinc-700", "3rd":"bg-orange-50 dark:bg-orange-950/40 text-orange-600 border-orange-200 dark:border-orange-800" };

export default function HackathonsSection({ data }) {
  return (
    <section id="hackathons" className="py-20 bg-gray-50 dark:bg-zinc-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 text-sm font-medium border border-amber-100 dark:border-amber-900 mb-4">Competitive Excellence</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Hackathons & Competitions</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">Our students compete and win at national and international hackathons.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {HACKATHONS.map((h, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="card p-5 hover:shadow-glow transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <Trophy className="w-8 h-8 text-amber-400" />
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${RANK_COLORS[h.rank] || 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 border-brand-200 dark:border-brand-800'}`}>{h.rank}</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{h.name}</h3>
              <p className="text-xs text-gray-400 mt-1">by {h.organizer}</p>
              <div className="mt-3 space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Team: <span className="font-medium text-gray-700 dark:text-gray-300">{h.team}</span> ({h.members} members)</div>
                <div className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />{h.date}</div>
                <div className="flex items-center gap-1.5"><Medal className="w-3.5 h-3.5" />Prize: <span className="font-medium text-gray-700 dark:text-gray-300">{h.prize}</span></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
