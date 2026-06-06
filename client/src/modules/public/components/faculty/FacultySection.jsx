import { motion } from "framer-motion";
import { Linkedin, Mail } from "lucide-react";

const DEMO_FACULTY = [
  { name: "Dr. A. Ramesh Kumar", designation: "Associate Professor", specialization: "Machine Learning & AI", experience: "12 Years", photo: null },
  { name: "Prof. B. Sunitha Devi", designation: "Assistant Professor", specialization: "Data Structures & Algorithms", experience: "8 Years", photo: null },
  { name: "Dr. C. Vijay Reddy", designation: "Professor", specialization: "Cloud Computing & DevOps", experience: "18 Years", photo: null },
  { name: "Prof. D. Priya Sharma", designation: "Assistant Professor", specialization: "Web Technologies", experience: "6 Years", photo: null },
  { name: "Dr. E. Nagaraj", designation: "Associate Professor", specialization: "Database Systems", experience: "14 Years", photo: null },
  { name: "Prof. F. Kavitha Rao", designation: "Assistant Professor", specialization: "Computer Networks", experience: "7 Years", photo: null },
];

const COLORS = ["brand", "emerald", "violet", "amber", "rose", "sky"];

export default function FacultySection({ data }) {
  const faculty = data?.faculty || DEMO_FACULTY;
  return (
    <section id="faculty" className="py-20 bg-gray-50 dark:bg-zinc-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-sm font-medium border border-emerald-100 dark:border-emerald-900 mb-4">Our Team</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Meet Our Faculty</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">Experienced educators and researchers dedicated to shaping the next generation of technology leaders.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {faculty.map((f, i) => {
            const color = COLORS[i % COLORS.length];
            return (
              <motion.div key={f.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="card p-6 flex flex-col items-center text-center gap-4 hover:shadow-soft transition-shadow group">
                <div className={`w-24 h-24 rounded-2xl bg-${color}-100 dark:bg-${color}-950/50 flex items-center justify-center text-3xl font-bold text-${color}-500 group-hover:scale-105 transition-transform overflow-hidden`}>
                  {f.photo ? <img src={f.photo} alt={f.name} className="w-full h-full object-cover" /> : f.name.split(" ").slice(-1)[0][0]}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{f.name}</div>
                  <div className={`text-sm text-${color}-600 dark:text-${color}-400 font-medium mt-0.5`}>{f.designation}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{f.specialization}</div>
                  <div className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-xs text-gray-600 dark:text-gray-400">{f.experience}</div>
                </div>
                <div className="flex gap-2 mt-auto">
                  <button className="btn-icon btn-ghost text-gray-400 hover:text-brand-500"><Mail className="w-4 h-4" /></button>
                  <button className="btn-icon btn-ghost text-gray-400 hover:text-sky-500"><Linkedin className="w-4 h-4" /></button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
