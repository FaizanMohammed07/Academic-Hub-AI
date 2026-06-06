import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="bg-gray-900 dark:bg-zinc-950 text-gray-400 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">VJIT IT Hub</div>
              <div className="text-xs text-gray-500">Academic Ecosystem</div>
            </div>
          </div>
          <p className="text-sm leading-relaxed">
            AI-powered digital academic platform for the Department of Information Technology,
            Vignana Jyothi Institute of Technology, Hyderabad.
          </p>
        </div>

        <div>
          <h3 className="text-white font-semibold text-sm mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {['About', 'Faculty', 'Placements', 'Achievements', 'Research', 'Gallery', 'Contact'].map((l) => (
              <li key={l}>
                <a href={`#${l.toLowerCase()}`} className="hover:text-brand-400 transition-colors">{l}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold text-sm mb-4">Contact</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-brand-400 flex-shrink-0" />
              Vignana Jyothi Nagar, Pragathi Nagar, Hyderabad — 500090
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
              +91 40 2304 5678
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
              it.dept@vjit.ac.in
            </li>
          </ul>
          <div className="mt-6">
            <Link to="/login" className="btn-primary btn-sm">
              Portal Login
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <span>© {new Date().getFullYear()} VJIT IT Academic Hub. All rights reserved.</span>
          <span>Department of Information Technology • VJIT, Hyderabad</span>
        </div>
      </div>
    </footer>
  );
}
