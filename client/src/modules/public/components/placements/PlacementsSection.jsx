import { motion } from "framer-motion";
import { TrendingUp, Building2, IndianRupee } from "lucide-react";

const COMPANIES = ["TCS","Infosys","Wipro","HCL","Capgemini","Accenture","IBM","Amazon","Microsoft","Google","Deloitte","Cognizant","Tech Mahindra","Hexaware","Mphasis"];
const STATS = [
  { label: "Placement Rate", value: "95%", icon: TrendingUp, color: "emerald" },
  { label: "Companies Visited", value: "40+", icon: Building2, color: "brand" },
  { label: "Highest Package", value: "18 LPA", icon: IndianRupee, color: "amber" },
];

export default function PlacementsSection({ data }) {
  return (
    <section id="placements" className="py-20 bg-gray-50 dark:bg-zinc-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-sm font-medium border border-emerald-100 dark:border-emerald-900 mb-4">Career Success</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Placements & Opportunities</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">Our students are recruited by top MNCs and startups across India and globally.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="card p-6 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-${s.color}-50 dark:bg-${s.color}-950/40 flex items-center justify-center`}>
                <s.icon className={`w-7 h-7 text-${s.color}-500`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-5 text-center">Our Recruiters</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {COMPANIES.map((c, i) => (
              <motion.span key={c} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-950/50 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-default">
                {c}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
