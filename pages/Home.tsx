import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../types';
import { Send, Copy, Check } from 'lucide-react';
import { GoogleGenAI, Chat } from "@google/genai";

export const Home: React.FC = () => {
  const scrollImages = [
    'https://i.redd.it/manga-volume-covers-v0-p4pvga7sqeza1.jpg?width=6376&format=pjpg&auto=webp&s=580d6104f600038a23fc1ff7ac6314b9d2bdac53',
    'https://www.dexerto.com/cdn-image/wp-content/uploads/2024/12/30/bleach-tybw-cover.jpg?width=1200&quality=60&format=auto',
    'https://fictionhorizon.com/wp-content/uploads/2023/03/IchigoMerged.jpg',
    'https://wallpapers-clan.com/wp-content/uploads/2024/02/bleach-ichigo-kurosaki-blue-desktop-wallpaper-cover.jpg'
  ];

  return (
    <div className="px-6 space-y-32 pb-32 overflow-x-hidden bg-gradient-to-b from-white via-neutral-200 to-black text-neutral-200">
      <section className="h-[80vh] flex flex-col justify-center items-center text-center max-w-5xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-heading font-extrabold tracking-tighter leading-none mb-8 animate-in slide-in-from-bottom duration-1000 text-white">
          TEST PHASE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            TEST PHASE
          </span>
        </h1>
        <p className="text-neutral-400 max-w-md animate-in fade-in duration-1000 delay-300 tracking-wide">
          "Welcome to the whatever this is."
        </p>
      </section>

      <section className="space-y-64">
        {scrollImages.map((src, idx) => (
          <div key={idx} className="relative min-h-[60vh] flex items-center justify-center">
            <VibeImage src={src} direction={idx % 2 === 0 ? 'left' : 'right'} />
          </div>
        ))}
      </section>

      <section className="max-w-4xl mx-auto w-full pt-32">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-black/40 rounded-xl border border-neutral-700 overflow-hidden">
            <img
              src="https://i.pinimg.com/736x/72/43/a8/7243a820937c0510004fa2fc0059c8c0.jpg"
              alt="avatar"
              className="w-6 h-6 object-cover"
            />
          </div>
          <div>
            <h2 className="text-4xl font-heading font-bold text-white">Urahara</h2>
            <p className="text-xs text-neutral-400 uppercase tracking-widest">
              12th Division
            </p>
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
    <div className="rounded-lg overflow-hidden border border-neutral-700 bg-black my-3 shadow-lg w-full">
      <div className="flex justify-between items-center px-4 py-2 bg-black/60 border-b border-neutral-800">
        <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold tracking-widest">
          {language || 'CODE'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] text-neutral-400 hover:text-white transition-colors uppercase tracking-wider font-bold"
        >
          {copied ? (
            <>
              <Check size={12} className="text-white" />
              <span className="text-white">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto bg-black">
        <pre className="text-sm font-mono text-neutral-200 leading-relaxed">
          <code>{code.trim()}</code>
        </pre>
      </div>
    </div>
  );
};

const MessageContent: React.FC<{ text: string }> = ({ text }) => {
  const parts: any[] = [];
  let lastIndex = 0;
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

  return (
    <div className="w-full min-w-0">
      {parts.map((part, idx) =>
        part.type === 'code' ? (
          <CodeBlock key={idx} code={part.content} language={part.language} />
        ) : (
          <span key={idx} className="whitespace-pre-wrap break-words">
            {part.content}
          </span>
        )
      )}
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
        config: { systemInstruction: " " }
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
        if (chunk.text) {
          fullResponse += chunk.text;
          setMessages(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1].text = fullResponse;
            return newHistory;
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-neutral-800 overflow-hidden flex flex-col h-[700px] shadow-2xl bg-black/80">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-neutral-700 bg-black">
              <img
                src="https://i.pinimg.com/736x/72/43/a8/7243a820937c0510004fa2fc0059c8c0.jpg"
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>

            <div className={`max-w-[85%] p-4 rounded-2xl leading-relaxed shadow-lg overflow-hidden ${
              msg.role === 'user'
                ? 'bg-neutral-200 text-black font-medium'
                : 'bg-black/60 border border-neutral-800 text-neutral-200'
            }`}>
              {msg.text && <MessageContent text={msg.text} />}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-neutral-800 bg-black/80">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter request"
            className="w-full bg-black border border-neutral-700 rounded-xl px-4 py-4 pr-12 text-neutral-200 placeholder-neutral-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

const VibeImage: React.FC<{ src: string; direction: 'left' | 'right' }> = ({ src }) => {
  return (
    <div className="w-full max-w-4xl aspect-video rounded-[3rem] overflow-hidden">
      <img
        src={src}
        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
      />
    </div>
  );
};
