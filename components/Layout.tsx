import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Ghost, Zap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-zinc-900 to-neutral-800 text-zinc-200">
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-heading font-bold tracking-tighter flex items-center gap-3 text-zinc-100"
        >
          <div className="w-8 h-8 bg-zinc-900 rounded-lg border border-white/10 flex items-center justify-center">
            <img
              src="/icons/ichi.png"
              className="w-7 h-7 object-cover opacity-100"
            />
          </div>
          Ichigoat
        </Link>
        
        <div className="flex items-center gap-6">
          {/* Top right navigation removed as requested */}
        </div>
      </nav>

      <main className="flex-grow pt-24">
        {children}
      </main>

      <footer className="py-12 px-6 glass mt-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 text-zinc-300">
          <div className="font-heading font-bold tracking-tighter flex items-center gap-2">
            <img
              src="/icons/icon.png"
              className="w-7 h-7 object-cover opacity-100"
            />
            this was made possible by nathan 🙏
          </div>
          <div className="flex gap-8 text-sm">
            <a href="#" className="hover:text-zinc-100 transition-colors">bro</a>
            <a href="#" className="hover:text-zinc-100 transition-colors">forgot</a>
            <a href="#" className="hover:text-zinc-100 transition-colors">this</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
