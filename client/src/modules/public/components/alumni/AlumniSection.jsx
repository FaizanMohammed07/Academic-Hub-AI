import { motion } from "framer-motion";
import { Linkedin, Star } from "lucide-react";

const ALUMNI = [
  { name: "Rahul Sharma", batch: "2020", role: "SDE II", company: "Google", location: "Bangalore", avatar: "RS", color: "blue", quote: "VJIT IT gave me the foundation to crack FAANG." },
  { name: "Priya Nair", batch: "2021", role: "Data Scientist", company: "Microsoft", location: "Hyderabad", avatar: "PN", color: "emerald", quote: "The AI lab here sparked my passion for ML research." },
  { name: "Kiran Reddy", batch: "2019", role: "Backend Engineer", company: "Amazon", location: "Seattle", avatar: "KR", color: "amber", quote: "Problem-solving skills from VJIT set me apart." },
  { name: "Sneha Patel", batch: "2022", role: "Cloud Architect", company: "AWS", location: "Bangalore", avatar: "SP", color: "purple", quote: "Interning during college at top companies was a game changer." },
  { name: "Arjun Mehta", batch: "2020", role: "Fullstack Dev", company: "Flipkart", location: "Bangalore", avatar: "AM", color: "rose", quote: "Faculty mentorship here is unmatched anywhere." },
  { name: "Divya Krishnan", batch: "2021", role: "AI Researcher", company: "IIIT-H", location: "Hyderabad", avatar: "DK", color: "teal", quote: "VJIT's research culture prepared me for my PhD journey." },
];

const AVATAR_COLORS = { blue:"bg-blue-100 dark:bg-blue-950/50 text-blue-600", emerald:"bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600", amber:"bg-amber-100 dark:bg-amber-950/50 text-amber-600", purple:"bg-purple-100 dark:bg-purple-950/50 text-purple-600", rose:"bg-rose-100 dark:bg-rose-950/50 text-rose-600", teal:"bg-teal-100 dark:bg-teal-950/50 text-teal-600" };

export default function AlumniSection({ data }) {
  return (
    <section id="alumni" className="py-20 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-sm font-medium border border-indigo-100 dark:border-indigo-900 mb-4">Our Pride</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Alumni Success Stories</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">Our graduates are making an impact at the world's leading tech companies.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ALUMNI.map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="card p-5 hover:shadow-glow transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-12 h-12 rounded-2xl ${AVATAR_COLORS[a.color]} flex items-center justify-center font-bold text-sm flex-shrink-0`}>{a.avatar}</div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{a.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{a.role} · {a.company}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Batch of {a.batch} · {a.location}</div>
                </div>
              </div>
              <blockquote className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed border-l-2 border-brand-300 dark:border-brand-700 pl-3">
                "{a.quote}"
              </blockquote>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <button className="text-brand-500 hover:text-brand-600 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
