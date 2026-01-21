import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Ghost, Zap } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-black to-zinc-950 text-zinc-300">
      <nav className="fixed top-0 left-0 right-0 z-50 glass bg-black/40 backdrop-blur-xl border-b border-black/40 px-6 py-4 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-heading font-bold tracking-tighter flex items-center gap-3 text-zinc-100"
        >
          <div className="w-8 h-8 bg-black/70 rounded-lg border border-black/60 flex items-center justify-center">
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

      <footer className="py-12 px-6 glass bg-black/40 backdrop-blur-xl mt-20 border-t border-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 text-zinc-400">
          <div className="font-heading font-bold tracking-tighter flex items-center gap-2">
            <img
              src="/icons/icon.png"
              className="w-7 h-7 object-cover opacity-100"
            />
            this was made possible by nathan 🙏
          </div>
          <div className="flex gap-8 text-sm">
            <a href="https://drive.google.com/drive/folders/1nSb-4PAuBCMBNbfgmGKD1Z-B59WCN-B9?usp=sharing" className="hover:text-zinc-100 transition-colors">bro</a>
            <a href="#" className="hover:text-zinc-100 transition-colors">forgot</a>
            <a href="#" className="hover:text-zinc-100 transition-colors">this</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
