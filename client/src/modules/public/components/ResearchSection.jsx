import { motion } from "framer-motion";
import { BookOpen, ExternalLink, Users, CalendarDays } from "lucide-react";

const PAPERS = [
  { title: "Deep Learning Approaches for Crop Disease Detection Using CNN", authors: ["Dr. P. Rao", "Dr. M. Singh"], journal: "IEEE Access", year: 2024, domain: "AI/ML", citations: 18 },
  { title: "Blockchain-based Secure Data Sharing in Healthcare IoT Systems", authors: ["Dr. R. Verma", "Mr. S. Kumar"], journal: "Springer LNCS", year: 2024, domain: "Blockchain", citations: 12 },
  { title: "Efficient Intrusion Detection using Random Forest on CICIDS Dataset", authors: ["Dr. A. Nair", "Ms. P. Reddy"], journal: "Elsevier JNCA", year: 2023, domain: "Cybersecurity", citations: 34 },
  { title: "Federated Learning for Privacy-Preserving Medical Imaging Analysis", authors: ["Dr. P. Rao", "Dr. L. Sharma"], journal: "Nature Scientific Reports", year: 2023, domain: "AI/ML", citations: 27 },
  { title: "Smart Traffic Management using Multi-Agent Reinforcement Learning", authors: ["Dr. M. Singh", "Mr. V. Teja"], journal: "IEEE T-ITS", year: 2023, domain: "IoT", citations: 21 },
  { title: "Natural Language Processing for Regional Language Sentiment Analysis", authors: ["Dr. R. Verma", "Ms. K. Patel"], journal: "ACL Findings", year: 2022, domain: "NLP", citations: 45 },
];

const DOMAIN_COLORS = { "AI/ML":"bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400", "Blockchain":"bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400", "Cybersecurity":"bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400", "IoT":"bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400", "NLP":"bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" };

export default function ResearchSection({ data }) {
  return (
    <section id="research" className="py-20 bg-gray-50 dark:bg-zinc-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 text-sm font-medium border border-teal-100 dark:border-teal-900 mb-4">Academic Excellence</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Research & Publications</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">Our faculty and students publish cutting-edge research in top-tier journals and conferences.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-5">
          {PAPERS.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="card p-5 hover:shadow-glow transition-shadow group">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BookOpen className="w-5 h-5 text-teal-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2">{p.title}</h3>
                    <ExternalLink className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-brand-500 transition-colors flex-shrink-0 mt-0.5" />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{p.authors.join(", ")}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${DOMAIN_COLORS[p.domain] || "bg-gray-100 dark:bg-zinc-800 text-gray-500"}`}>{p.domain}</span>
                  <span className="text-gray-400 dark:text-gray-500">{p.journal}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
                  <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{p.year}</span>
                  <span>{p.citations} citations</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-8 text-center">
          <p className="text-sm text-gray-400">Full research database available to registered users in the portal.</p>
        </motion.div>
      </div>
    </section>
  );
}
