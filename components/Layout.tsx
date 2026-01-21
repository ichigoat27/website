import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Zap } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-black text-neutral-200">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur border-b border-neutral-800 px-6 py-4 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-heading font-bold tracking-tighter flex items-center gap-3 text-white"
        >
          <div className="w-8 h-8 bg-black rounded-lg border border-neutral-700 flex items-center justify-center overflow-hidden">
            <img
              src="https://i.pinimg.com/736x/72/43/a8/7243a820937c0510004fa2fc0059c8c0.jpg"
              alt="logo"
              className="w-full h-full object-cover"
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

      <footer className="py-12 px-6 bg-black/80 border-t border-neutral-800 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 text-neutral-400">
          <div className="font-heading font-bold tracking-tighter flex items-center gap-2 text-neutral-300">
            <Zap size={16} />
            this was made possible by nathan 🙏
          </div>
          <div className="flex gap-8 text-sm">
            <a href="#" className="hover:text-white transition-colors">bro</a>
            <a href="#" className="hover:text-white transition-colors">forgot</a>
            <a href="#" className="hover:text-white transition-colors">this</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
