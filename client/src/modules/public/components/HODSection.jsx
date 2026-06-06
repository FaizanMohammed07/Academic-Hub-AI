import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export default function HODSection({ data }) {
  const name    = data?.name    || "Dr. [HOD Name]";
  const title   = data?.title   || "Head of Department, Information Technology";
  const message = data?.message || "The Department of Information Technology at VJIT is committed to providing quality education that blends theoretical knowledge with practical expertise. Our dedicated faculty, state-of-the-art infrastructure, and industry-aligned curriculum ensure our students are well-prepared for the challenges of the digital world. We take pride in our students achievements and continuously strive to foster innovation, research, and holistic development. Welcome to a department where every student matters, every idea is valued, and excellence is a way of life.";
  const photo   = data?.photo   || null;
  const quals   = data?.qualifications || ["Ph.D. in Computer Science", "M.Tech – Information Technology", "15+ Years Academic Experience"];

  return (
    <section className="py-20 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 text-sm font-medium border border-amber-100 dark:border-amber-900 mb-4">Leadership</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Message from the HOD</h2>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-2 flex flex-col items-center gap-5">
            <div className="relative">
              {photo ? (
                <img src={photo} alt={name} className="w-52 h-64 object-cover rounded-2xl shadow-soft" />
              ) : (
                <div className="w-52 h-64 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-soft">
                  <span className="text-white text-6xl font-bold opacity-40">{name[0]}</span>
                </div>
              )}
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-amber-400 rounded-xl flex items-center justify-center shadow-glow-amber">
                <Quote className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{name}</div>
              <div className="text-sm text-amber-600 dark:text-amber-400 font-medium mt-1">{title}</div>
              <div className="mt-3 space-y-1">
                {quals.map((q) => (
                  <div key={q} className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />{q}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }} className="lg:col-span-3">
            <div className="relative bg-gray-50 dark:bg-zinc-900 rounded-2xl p-8 border border-gray-100 dark:border-zinc-800">
              <Quote className="absolute top-6 left-6 w-10 h-10 text-brand-100 dark:text-brand-900" />
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg italic pt-6">{message}</p>
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{name[0]}</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{title}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
