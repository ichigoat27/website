import React, { useEffect, useRef, useState } from 'react'
import { Message } from '../types'
import { Send, Copy, Check } from 'lucide-react'
import { GoogleGenAI, Chat } from '@google/genai'

export const Home: React.FC = () => {
  const scrollImages = [
    'https://i.redd.it/manga-volume-covers-v0-p4pvga7sqeza1.jpg?width=6376&format=pjpg&auto=webp&s=580d6104f600038a23fc1ff7ac6314b9d2bdac53',
    'https://www.dexerto.com/cdn-image/wp-content/uploads/2024/12/30/bleach-tybw-cover.jpg?width=1200&quality=60&format=auto',
    'https://fictionhorizon.com/wp-content/uploads/2023/03/IchigoMerged.jpg',
    'https://wallpapers-clan.com/wp-content/uploads/2024/02/bleach-ichigo-kurosaki-blue-desktop-wallpaper-cover.jpg'
  ]

  return (
    <div className="px-6 space-y-32 pb-32 overflow-x-hidden bg-gradient-to-br from-black via-zinc-900 to-neutral-800 text-zinc-200">
      <section className="h-[80vh] flex flex-col justify-center items-center text-center max-w-5xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-none mb-8">
          TEST PHASE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-500">
            TEST PHASE
          </span>
        </h1>
        <p className="text-zinc-400 max-w-md">
          Welcome to the whatever this is.
        </p>
      </section>

      <section className="space-y-64">
        {scrollImages.map((src, i) => (
          <div key={i} className="relative min-h-[60vh] flex items-center justify-center">
            <VibeImage src={src} direction={i % 2 === 0 ? 'left' : 'right'} />
          </div>
        ))}
      </section>

      <section className="max-w-4xl mx-auto w-full pt-32">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/10">
            <img src="/icons/ura.png" className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-4xl font-bold">Urahara</h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">
              12th Division
            </p>
          </div>
        </div>

        <ChatInterface />
      </section>
    </div>
  )
}

const CodeBlock = ({ code, language }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg overflow-hidden border border-white/10 bg-black my-3 w-full">
      <div className="flex justify-between items-center px-4 py-2 bg-zinc-900/60">
        <span className="text-[10px] uppercase text-zinc-400">
          {language || 'CODE'}
        </span>
        <button onClick={copy} className="flex items-center gap-1 text-xs">
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </div>
      <pre className="p-4 text-sm text-zinc-200 overflow-x-auto">
        <code>{code.trim()}</code>
      </pre>
    </div>
  )
}

const MessageContent = ({ text }: { text: string }) => {
  const parts: any[] = []
  let last = 0
  const r = /```(\w+)?\s*([\s\S]*?)```/g
  let m

  while ((m = r.exec(text))) {
    if (m.index > last) parts.push({ t: 'text', c: text.slice(last, m.index) })
    parts.push({ t: 'code', l: m[1], c: m[2] })
    last = r.lastIndex
  }

  if (last < text.length) parts.push({ t: 'text', c: text.slice(last) })

  return (
    <>
      {parts.map((p, i) =>
        p.t === 'code' ? (
          <CodeBlock key={i} code={p.c} language={p.l} />
        ) : (
          <span key={i} className="whitespace-pre-wrap break-words">
            {p.c}
          </span>
        )
      )}
    </>
  )
}

const ChatInterface = () => {
  const [m, s] = useState<Message[]>([
    {
      role: 'model',
      text:
        'What is thy request?'
    }
  ])
  const [i, si] = useState('')
  const [l, sl] = useState(false)
  const r = useRef<HTMLDivElement>(null)
  const c = useRef<Chat | null>(null)

  useEffect(() => {
    r.current && (r.current.scrollTop = r.current.scrollHeight)
  }, [m])

  const chat = () => {
    if (!c.current) {
      const a = new GoogleGenAI({ apiKey: process.env.API_KEY || '' })
      c.current = a.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction:
            'You are Kisuke Urahara from Bleach. Polite, playful, mysterious. Keep names capitalized correctly. Use lowercase generally, but preserve proper nouns. If code is asked, output only code.'
        }
      })
    }
    return c.current
  }

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!i.trim() || l) return
    const u = i
    si('')
    s(v => [...v, { role: 'user', text: u }])
    sl(true)

    try {
      const res = await chat().sendMessageStream({ message: u })
      let f = ''
      s(v => [...v, { role: 'model', text: '' }])

      for await (const ch of res) {
        if (ch.text) {
          f += ch.text
          s(v => {
            const n = [...v]
            n[n.length - 1].text = f
            return n
          })
        }
      }
    } finally {
      sl(false)
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-black/70 flex flex-col h-[700px]">
      <div ref={r} className="flex-1 overflow-y-auto p-6 space-y-6">
        {m.map((x, k) => (
          <div
            key={k}
            className={`flex gap-4 ${x.role === 'user' && 'flex-row-reverse'}`}
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center">
              <img
                src={x.role === 'model' ? '/icons/ura.png' : '/icons/icon.png'}
                className="w-7 h-7 rounded-md"
              />
            </div>
            <div className="max-w-[85%] p-4 rounded-2xl bg-zinc-900/70">
              <MessageContent text={x.text} />
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="p-4 border-t border-white/10">
        <div className="relative flex items-center">
          <input
            value={i}
            onChange={e => si(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 pr-12"
            placeholder="Enter request"
          />
          <button className="absolute right-2 p-2">
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}

const VibeImage = ({
  src,
  direction
}: {
  src: string
  direction: 'left' | 'right'
}) => {
  const r = useRef<HTMLDivElement>(null)
  const [v, sv] = useState(false)

  useEffect(() => {
    const o = new IntersectionObserver(([e]) => sv(e.isIntersecting), {
      threshold: 0.2
    })
    r.current && o.observe(r.current)
    return () => o.disconnect()
  }, [])

  return (
    <div
      ref={r}
      className={`w-full max-w-4xl aspect-video rounded-3xl overflow-hidden transition-all duration-1000 ${
        v ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        transform: v
          ? 'translateX(0) scale(1)'
          : `translateX(${direction === 'left' ? '-100px' : '100px'}) scale(0.95)`
      }}
    >
      <img src={src} className="w-full h-full object-cover grayscale" />
    </div>
  )
}
