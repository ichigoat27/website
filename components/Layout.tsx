
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Ghost, Zap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col vibe-gradient text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-cyan-900/30 px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-heading font-bold tracking-tighter flex items-center gap-3 text-cyan-100">
          <div className="w-8 h-8 bg-cyan-950 rounded-lg border border-cyan-500/30 flex items-center justify-center">
             <Ghost size={18} className="text-cyan-400" />
          </div>
          Soul Society
        </Link>
        
        <div className="flex items-center gap-6">
          {/* Top right navigation removed as requested */}
        </div>
      </nav>

      <main className="flex-grow pt-24">
        {children}
      </main>

      <footer className="py-12 px-6 glass mt-20 border-t border-cyan-900/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 text-cyan-100">
          <div className="font-heading font-bold tracking-tighter flex items-center gap-2">
            <Zap size={16} />
            Seireitei Communications
          </div>
          <div className="flex gap-8 text-sm">
            <a href="#" className="hover:text-cyan-400 transition-colors">Gotei 13</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Kido Corps</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">R&D</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
