
import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../types';
import { Send, User, Bot, Fan, Copy, Check } from 'lucide-react';
import { GoogleGenAI, Chat } from "@google/genai";

export const Home: React.FC = () => {
  // Mock abstract/vibe images with a cooler tone
  const scrollImages = [
    'https://preview.redd.it/what-makes-ichigo-such-an-iconic-protagonist-v0-ahs1df7rv46e1.jpeg?auto=webp&s=dbf34ad0eb1b17610c5e93150c774b422eeb6e6e',
    'https://www.dexerto.com/cdn-image/wp-content/uploads/2024/12/30/bleach-tybw-cover.jpg?width=1200&quality=60&format=auto',
    'https://fictionhorizon.com/wp-content/uploads/2023/03/IchigoMerged.jpg',
    'https://wallpapers-clan.com/wp-content/uploads/2024/02/bleach-ichigo-kurosaki-blue-desktop-wallpaper-cover.jpg'
  ];

  return (
    <div className="px-6 space-y-32 pb-32 overflow-x-hidden">
      {/* Hero Section */}
      <section className="h-[80vh] flex flex-col justify-center items-center text-center max-w-5xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-heading font-extrabold tracking-tighter leading-none mb-8 animate-in slide-in-from-bottom duration-1000">
          TEST PHASE <br /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">TEST PHASE</span>
        </h1>
        <p className="text-cyan-100/50 max-w-md animate-in fade-in duration-1000 delay-300 tracking-wide">
          "Welcome to the Database."
        </p>
      </section>

      {/* Scroll Effects Images */}
      <section className="space-y-64">
        {scrollImages.map((src, idx) => (
          <div key={idx} className="relative min-h-[60vh] flex items-center justify-center">
             <VibeImage 
               src={src} 
               direction={idx % 2 === 0 ? 'left' : 'right'} 
             />
          </div>
        ))}
      </section>

      {/* Chat Section */}
      <section className="max-w-4xl mx-auto w-full pt-32">
        <div className="flex items-center gap-3 mb-8">
           <div className="p-3 bg-cyan-950/30 rounded-xl border border-cyan-500/20">
             <Fan className="text-cyan-400 animate-spin-slow" size={24} />
           </div>
           <div>
             <h2 className="text-4xl font-heading font-bold text-cyan-100">Urahara</h2>
             <p className="text-xs text-cyan-100/40 uppercase tracking-widest">12th Division</p>
           </div>
        </div>
        
        <ChatInterface />
      </section>
    </div>
  );
};

const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-cyan-500/30 bg-[#0a0a0a] my-3 shadow-lg w-full">
      <div className="flex justify-between items-center px-4 py-2 bg-cyan-950/30 border-b border-cyan-500/10">
        <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-widest">
          {language || 'CODE'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] text-cyan-100/50 hover:text-cyan-100 transition-colors uppercase tracking-wider font-bold"
        >
          {copied ? (
            <>
              <Check size={12} className="text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto bg-black/40">
        <pre className="text-sm font-mono text-cyan-50 leading-relaxed">
          <code>{code.trim()}</code>
        </pre>
      </div>
    </div>
  );
};

const MessageContent: React.FC<{ text: string }> = ({ text }) => {
  const parts = [];
  let lastIndex = 0;
  // Match code blocks enclosed in ```
  const regex = /```(\w+)?\s*([\s\S]*?)```/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    parts.push({ type: 'code', language: match[1], content: match[2] });
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex) });
  }

  if (parts.length === 0) return <span className="whitespace-pre-wrap">{text}</span>;

  return (
    <div className="w-full min-w-0">
      {parts.map((part, idx) => {
        if (part.type === 'code') {
          return <CodeBlock key={idx} code={part.content} language={part.language} />;
        }
        return <span key={idx} className="whitespace-pre-wrap break-words">{part.content}</span>;
      })}
    </div>
  );
};

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "What is your request today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const chatSessionRef = useRef<Chat | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getChatSession = () => {
    if (!chatSessionRef.current) {
       const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
       chatSessionRef.current = ai.chats.create({
         model: 'gemini-3-flash-preview',
         config: {
           systemInstruction: "You are Kisuke Urahara from Bleach. Be helpful but maintain your character. Keep responses concise. talk in all lowercase unless needed, if code is asked just send the code and no explaination or crumbs, just pure code. You are a genius in Code. also make every variable simple if possible by making it one",
         }
       });
    }
    return chatSessionRef.current;
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const chat = getChatSession();
      const result = await chat.sendMessageStream({ message: userMsg });
      
      let fullResponse = "";
      setMessages(prev => [...prev, { role: 'model', text: "" }]);

      for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
          fullResponse += text;
          setMessages(prev => {
            const newHistory = [...prev];
            const lastMsg = newHistory[newHistory.length - 1];
            if (lastMsg.role === 'model') {
               lastMsg.text = fullResponse;
            }
            return newHistory;
          });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Interference in the Dangai... I lost the signal.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass rounded-[2rem] border border-cyan-500/20 overflow-hidden flex flex-col h-[700px] shadow-2xl shadow-cyan-900/20 bg-slate-950/60">
      {/* Chat History */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'model' ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20' : 'bg-white/5 text-white border border-white/10'}`}>
              {msg.role === 'model' ? <Bot size={20} /> : <User size={20} />}
            </div>
            
            <div className={`max-w-[85%] p-4 rounded-2xl leading-relaxed shadow-lg overflow-hidden ${
              msg.role === 'user' 
                ? 'bg-cyan-100 text-cyan-950 font-medium' 
                : msg.isError 
                  ? 'bg-red-900/20 text-red-200 border border-red-500/20'
                  : 'bg-slate-900/60 border border-cyan-500/20 text-cyan-100/90'
            }`}>
              {msg.text ? (
                <MessageContent text={msg.text} />
              ) : (
                <div className="flex gap-1 items-center h-6">
                   <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                   <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                   <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl">
        <div className="relative flex items-center gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter spirit communication..."
            className="w-full bg-cyan-900/10 border border-cyan-500/20 rounded-xl px-4 py-4 pr-12 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-950/30 transition-all text-cyan-100 placeholder-cyan-100/30"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-900/50"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

const VibeImage: React.FC<{ src: string; direction: 'left' | 'right' }> = ({ src, direction }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { 
        threshold: 0.2,
        rootMargin: "0px 0px -100px 0px"
      }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const xOffset = direction === 'left' ? '-100px' : '100px';

  return (
    <div 
      ref={ref}
      className={`w-full max-w-4xl aspect-video rounded-[3rem] overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] transform
        ${isVisible 
          ? 'opacity-100 translate-x-0 scale-100 blur-0' 
          : `opacity-0 scale-95 blur-xl`
        }
      `}
      style={{ 
        transform: isVisible ? 'translateX(0) scale(1)' : `translateX(${xOffset}) scale(0.95)`
      }}
    >
      <img 
        src={src} 
        loading="lazy"
        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 mix-blend-luminosity hover:mix-blend-normal" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-cyan-900/20 mix-blend-overlay pointer-events-none"></div>
    </div>
  );
};
