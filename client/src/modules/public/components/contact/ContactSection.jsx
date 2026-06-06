import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react";

const INFO = [
  { icon: MapPin, label: "Address", value: "Vignana Jyothi Nagar, Pragathi Nagar, Hyderabad — 500090, Telangana, India", color: "brand" },
  { icon: Phone, label: "Phone", value: "+91 40 2304 5678", color: "emerald" },
  { icon: Mail, label: "Email", value: "it.dept@vjit.ac.in", color: "blue" },
  { icon: Clock, label: "Office Hours", value: "Mon–Sat, 9:00 AM – 5:00 PM", color: "amber" },
];

export default function ContactSection({ data }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  };

  return (
    <section id="contact" className="py-20 bg-gray-50 dark:bg-zinc-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 text-sm font-medium border border-brand-100 dark:border-brand-900 mb-4">Get in Touch</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Contact Us</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">Reach out to the Department of Information Technology, VJIT.</p>
        </motion.div>
        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-5">
            {INFO.map((item, i) => (
              <div key={i} className="card p-4 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color === 'brand' ? 'bg-brand-50 dark:bg-brand-950/40' : item.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-950/40' : item.color === 'blue' ? 'bg-blue-50 dark:bg-blue-950/40' : 'bg-amber-50 dark:bg-amber-950/40'}`}>
                  <item.icon className={`w-5 h-5 ${item.color === 'brand' ? 'text-brand-500' : item.color === 'emerald' ? 'text-emerald-500' : item.color === 'blue' ? 'text-blue-500' : 'text-amber-500'}`} />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">{item.label}</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.value}</div>
                </div>
              </div>
            ))}
            <div className="card overflow-hidden rounded-2xl">
              <div className="w-full h-44 bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-950/30 dark:to-indigo-950/30 flex flex-col items-center justify-center gap-2">
                <MapPin className="w-10 h-10 text-brand-400" />
                <p className="text-sm font-medium text-brand-600 dark:text-brand-400">VJIT, Pragathi Nagar, Hyderabad</p>
                <p className="text-xs text-brand-400 dark:text-brand-500">Google Maps integration via Admin CMS</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="card p-6">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 text-center">
                <CheckCircle className="w-14 h-14 text-emerald-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Message Sent!</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Thank you for reaching out. Our team will respond within 1–2 business days.</p>
                <button onClick={() => { setSent(false); setForm({ name:"", email:"", subject:"", message:"" }); }} className="btn-secondary mt-2">Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Send a Message</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input className="input" placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input type="email" className="input" placeholder="you@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                  </div>
                </div>
                <div>
                  <label className="label">Subject</label>
                  <input className="input" placeholder="How can we help?" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea className="input resize-none" rows={5} placeholder="Your message..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center gap-2">
                  {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</> : <><Send className="w-4 h-4" />Send Message</>}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
