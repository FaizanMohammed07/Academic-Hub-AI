import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, X } from "lucide-react";

const CATEGORIES = ["All", "Events", "Labs", "Achievements", "Graduation", "Sports"];

const GALLERY = [
  { id: 1, title: "SIH 2024 Finals", category: "Achievements", gradient: "from-indigo-400 to-purple-500", emoji: "🏆" },
  { id: 2, title: "AI/ML Lab", category: "Labs", gradient: "from-blue-400 to-cyan-500", emoji: "🖥️" },
  { id: 3, title: "Annual Tech Fest", category: "Events", gradient: "from-pink-400 to-rose-500", emoji: "🎉" },
  { id: 4, title: "Graduation 2024", category: "Graduation", gradient: "from-amber-400 to-orange-500", emoji: "🎓" },
  { id: 5, title: "Network Lab", category: "Labs", gradient: "from-teal-400 to-emerald-500", emoji: "🌐" },
  { id: 6, title: "Sports Day", category: "Sports", gradient: "from-lime-400 to-green-500", emoji: "⚽" },
  { id: 7, title: "Hackathon 2024", category: "Events", gradient: "from-violet-400 to-purple-600", emoji: "💡" },
  { id: 8, title: "Industry Visit — Microsoft", category: "Events", gradient: "from-sky-400 to-blue-600", emoji: "🏢" },
  { id: 9, title: "Best Project Award", category: "Achievements", gradient: "from-yellow-400 to-amber-500", emoji: "⭐" },
];

export default function GallerySection({ data }) {
  const [active, setActive] = useState("All");
  const [lightbox, setLightbox] = useState(null);
  const items = active === "All" ? GALLERY : GALLERY.filter(g => g.category === active);

  return (
    <section id="gallery" className="py-20 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 text-sm font-medium border border-pink-100 dark:border-pink-900 mb-4">Campus Life</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Photo Gallery</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">Glimpses of our vibrant academic and cultural life.</p>
        </motion.div>
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActive(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${active === cat ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700"}`}>
              {cat}
            </button>
          ))}
        </div>
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }} onClick={() => setLightbox(item)}
                className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <span className="text-4xl">{item.emoji}</span>
                  <span className="text-white font-semibold text-sm text-center px-4 drop-shadow">{item.title}</span>
                  <span className="text-white/70 text-xs">{item.category}</span>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Image className="w-8 h-8 text-white" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        <p className="text-center text-sm text-gray-400 dark:text-gray-600 mt-8">Real photos managed via Admin CMS Portal.</p>
      </div>
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className={`absolute inset-0 bg-gradient-to-br ${lightbox.gradient}`} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <span className="text-7xl">{lightbox.emoji}</span>
                <span className="text-white font-bold text-xl">{lightbox.title}</span>
                <span className="text-white/70 text-sm">{lightbox.category}</span>
              </div>
              <button onClick={() => setLightbox(null)} className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
