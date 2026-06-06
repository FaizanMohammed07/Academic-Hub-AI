import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, BookOpen, Trophy, Briefcase, Award, GraduationCap } from "lucide-react";

const STATS = [
  { icon: Users,          value: 1240, suffix: "+", label: "Students Enrolled",   color: "bg-brand-50 dark:bg-brand-950/40 border-brand-100 dark:border-brand-900",    icon_c: "text-brand-500" },
  { icon: GraduationCap, value: 32,   suffix: "+", label: "Expert Faculty",       color: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900", icon_c: "text-emerald-500" },
  { icon: BookOpen,       value: 8,   suffix: "",  label: "Semesters",             color: "bg-violet-50 dark:bg-violet-950/40 border-violet-100 dark:border-violet-900",  icon_c: "text-violet-500" },
  { icon: Briefcase,      value: 95,  suffix: "%", label: "Placement Rate",        color: "bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900",    icon_c: "text-amber-500" },
  { icon: Trophy,         value: 120, suffix: "+", label: "Awards & Achievements", color: "bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900",      icon_c: "text-rose-500" },
  { icon: Award,          value: 15,  suffix: "+", label: "Years of Excellence",   color: "bg-sky-50 dark:bg-sky-950/40 border-sky-100 dark:border-sky-900",          icon_c: "text-sky-500" },
];

function CountUp({ target, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let v = 0;
    const step = target / 80;
    const t = setInterval(() => { v += step; if (v >= target) { setCount(target); clearInterval(t); } else setCount(Math.floor(v)); }, 20);
    return () => clearInterval(t);
  }, [inView, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function StatsSection({ data }) {
  return (
    <section id="about" className="py-20 bg-gray-50 dark:bg-zinc-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 text-sm font-medium border border-brand-100 dark:border-brand-900 mb-4">Department at a Glance</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Numbers That Define Excellence</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">Consistent performance, dedicated faculty, and outstanding student outcomes across every semester.</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className={`rounded-2xl border p-6 flex flex-col gap-3 ${s.color}`}>
              <div className="w-11 h-11 rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm">
                <s.icon className={`w-5 h-5 ${s.icon_c}`} />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white"><CountUp target={s.value} suffix={s.suffix} /></div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
