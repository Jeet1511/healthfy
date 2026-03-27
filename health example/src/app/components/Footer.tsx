import { HeartPulse } from "lucide-react";
import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-red-500/20 p-2 rounded-xl group-hover:bg-red-500/30 transition-colors">
              <HeartPulse className="w-5 h-5 text-red-500" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">LifeLine</span>
          </Link>
          <div className="flex gap-6 text-slate-500">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
          </div>
          <p>© 2026 LifeLine Healthcare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
