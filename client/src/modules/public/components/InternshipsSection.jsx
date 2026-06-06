import { motion } from "framer-motion";
import { Briefcase, Calendar, MapPin, ExternalLink } from "lucide-react";

const INTERNSHIPS = [
  { company: "Microsoft", role: "SDE Intern", duration: "2 months", location: "Hyderabad", stipend: "₹25,000/mo", batch: "2024", color: "blue" },
  { company: "Amazon", role: "Cloud Intern", duration: "3 months", location: "Bangalore", stipend: "₹30,000/mo", batch: "2024", color: "amber" },
  { company: "TCS iON", role: "Full Stack Intern", duration: "6 weeks", location: "Remote", stipend: "₹15,000/mo", batch: "2024", color: "indigo" },
  { company: "Infosys", role: "AI/ML Intern", duration: "2 months", location: "Pune", stipend: "₹20,000/mo", batch: "2023", color: "emerald" },
  { company: "NASSCOM", role: "Research Intern", duration: "3 months", location: "Hyderabad", stipend: "₹18,000/mo", batch: "2023", color: "purple" },
  { company: "Wipro", role: "DevOps Intern", duration: "2 months", location: "Chennai", stipend: "₹16,000/mo", batch: "2023", color: "rose" },
];

const COLOR_MAP = { blue:"bg-blue-50 dark:bg-blue-950/40 text-blue-600", amber:"bg-amber-50 dark:bg-amber-950/40 text-amber-600", indigo:"bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600", emerald:"bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600", purple:"bg-purple-50 dark:bg-purple-950/40 text-purple-600", rose:"bg-rose-50 dark:bg-rose-950/40 text-rose-600" };

export default function InternshipsSection({ data }) {
  return (
    <section id="internships" className="py-20 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 text-sm font-medium border border-purple-100 dark:border-purple-900 mb-4">Industry Exposure</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Student Internships</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">Real-world experience at leading companies through our industry partnership program.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {INTERNSHIPS.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="card p-5 hover:shadow-glow transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${COLOR_MAP[item.color]} flex items-center justify-center font-bold text-sm`}>
                  {item.company.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400">{item.batch}</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{item.company}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />{item.role}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{item.duration}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.stipend}</span>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-10 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">These are select highlights. Full records managed via the Admin Portal.</p>
        </motion.div>
      </div>
    </section>
  );
}
