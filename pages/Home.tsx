import React, { useEffect, useRef, useState } from 'react'
import { Message } from '../types'
import { Send, Fan, Copy, Check } from 'lucide-react'
import { GoogleGenAI, Chat } from '@google/genai'

export const Home: React.FC = () => {
  const scrollImages = [
    'https://i.redd.it/manga-volume-covers-v0-p4pvga7sqeza1.jpg?width=6376&format=pjpg&auto=webp&s=580d6104f600038a23fc1ff7ac6314b9d2bdac53',
    'https://www.dexerto.com/cdn-image/wp-content/uploads/2024/12/30/bleach-tybw-cover.jpg?width=1200&quality=60&format=auto',
    'https://fictionhorizon.com/wp-content/uploads/2023/03/IchigoMerged.jpg',
    'https://wallpapers-clan.com/wp-content/uploads/2024/02/bleach-ichigo-kurosaki-blue-desktop-wallpaper-cover.jpg'
  ]

  return (
    <div className="px-6 space-y-32 pb-32 overflow-x-hidden">
      <section className="h-[80vh] flex flex-col justify-center items-center text-center max-w-5xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-heading font-extrabold tracking-tighter leading-none mb-8 animate-in slide-in-from-bottom duration-1000">
          test phase <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            test phase
          </span>
        </h1>
        <p className="text-cyan-100/50 max-w-md animate-in fade-in duration-1000 delay-300 tracking-wide">
          "welcome to the whatever this is."
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
          <div className="p-3 bg-cyan-950/30 rounded-xl border border-cyan-500/20">
            <Fan className="text-cyan-400 animate-spin-slow" size={24} />
          </div>
          <div>
            <h2 className="text-4xl font-heading font-bold text-cyan-100">urahara</h2>
            <p className="text-xs text-cyan-100/40 uppercase tracking-widest">
              12th division
            </p>
          </div>
        </div>

        <ChatInterface />
      </section>
    </div>
  )
}

const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg overflow-hidden border border-cyan-500/30 bg-[#0a0a0a] my-3 shadow-lg w-full">
      <div className="flex justify-between items-center px-4 py-2 bg-cyan-950/30 border-b border-cyan-500/10">
        <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-widest">
          {language || 'code'}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-[10px] text-cyan-100/50 hover:text-cyan-100 transition-colors uppercase tracking-wider font-bold"
        >
          {copied ? (
            <>
              <Check size={12} className="text-green-400" />
              <span className="text-green-400">copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>copy</span>
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
  )
}

const MessageContent: React.FC<{ text: string }> = ({ text }) => {
  const parts: any[] = []
  let last = 0
  const r = /```(\w+)?\s*([\s\S]*?)```/g
  let m

  while ((m = r.exec(text)) !== null) {
    if (m.index > last) {
      parts.push({ t: 'text', c: text.substring(last, m.index) })
    }
    parts.push({ t: 'code', l: m[1], c: m[2] })
    last = r.lastIndex
  }

  if (last < text.length) {
    parts.push({ t: 'text', c: text.substring(last) })
  }

  return (
    <div className="w-full min-w-0">
      {parts.map((p, i) =>
        p.t === 'code' ? (
          <CodeBlock key={i} code={p.c} language={p.l} />
        ) : (
          <span key={i} className="whitespace-pre-wrap break-words">
            {p.c}
          </span>
        )
      )}
    </div>
  )
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'what is your request today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scroll = useRef<HTMLDivElement>(null)
  const chatRef = useRef<Chat | null>(null)

  useEffect(() => {
    if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight
  }, [messages])

  const session = () => {
    if (!chatRef.current) {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' })
      chatRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction:
            'you are kisuke urahara from bleach. be helpful. stay in character. all lowercase. if code is asked only return code.'
        }
      })
    }
    return chatRef.current
  }

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || loading) return

    const msg = input
    setInput('')
    setMessages(p => [...p, { role: 'user', text: msg }])
    setLoading(true)

    try {
      const chat = session()
      const res = await chat.sendMessageStream({ message: msg })
      let full = ''
      setMessages(p => [...p, { role: 'model', text: '' }])

      for await (const c of res) {
        if (c.text) {
          full += c.text
          setMessages(p => {
            const h = [...p]
            h[h.length - 1].text = full
            return h
          })
        }
      }
    } catch {
      setMessages(p => [...p, { role: 'model', text: 'signal lost', isError: true }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass rounded-[2rem] border border-cyan-500/20 overflow-hidden flex flex-col h-[700px] bg-slate-950/60">
      <div ref={scroll} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`w-10 h-10 rounded-xl overflow-hidden border flex-shrink-0 ${
                m.role === 'model'
                  ? 'bg-cyan-950/40 border-cyan-500/20 shadow-[0_0_16px_rgba(34,211,238,0.5)]'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <img
                src={m.role === 'model' ? '/urahara.png' : '/user.png'}
                className="w-full h-full object-cover"
              />
            </div>

            <div
              className={`max-w-[85%] p-4 rounded-2xl ${
                m.role === 'user'
                  ? 'bg-cyan-100 text-cyan-950'
                  : m.isError
                  ? 'bg-red-900/20 text-red-200'
                  : 'bg-slate-900/60 text-cyan-100/90'
              }`}
            >
              {m.text ? <MessageContent text={m.text} /> : <span>...</span>}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="p-4 border-t border-cyan-500/20 bg-slate-950/80">
        <div className="relative flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="enter request"
            className="w-full bg-cyan-900/10 border border-cyan-500/20 rounded-xl px-4 py-4 pr-12 text-cyan-100"
          />
          <button
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 bg-cyan-600 rounded-lg"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}

const VibeImage: React.FC<{ src: string; direction: 'left' | 'right' }> = ({ src, direction }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)

  useEffect(() => {
    const o = new IntersectionObserver(([e]) => setV(e.isIntersecting), {
      threshold: 0.2
    })
    if (ref.current) o.observe(ref.current)
    return () => o.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`w-full max-w-4xl aspect-video rounded-[3rem] overflow-hidden transition-all duration-1000 ${
        v ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <img src={src} className="w-full h-full object-cover grayscale hover:grayscale-0" />
    </div>
  )
}
