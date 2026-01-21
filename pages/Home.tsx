import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../types';
import { Send, Fan, Copy, Check } from 'lucide-react';
import { GoogleGenAI, Chat } from "@google/genai";

export const Home: React.FC = () => {
  const scrollImages = [
    'https://i.redd.it/manga-volume-covers-v0-p4pvga7sqeza1.jpg?width=6376&format=pjpg&auto=webp&s=580d6104f600038a23fc1ff7ac6314b9d2bdac53',
    'https://www.dexerto.com/cdn-image/wp-content/uploads/2024/12/30/bleach-tybw-cover.jpg?width=1200&quality=60&format=auto',
    'https://fictionhorizon.com/wp-content/uploads/2023/03/IchigoMerged.jpg',
    'https://wallpapers-clan.com/wp-content/uploads/2024/02/bleach-ichigo-kurosaki-blue-desktop-wallpaper-cover.jpg'
  ];

  return (
    <div className="px-6 space-y-32 pb-32 overflow-x-hidden">
      <section className="h-[80vh] flex flex-col justify-center items-center text-center max-w-5xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-heading font-extrabold tracking-tighter leading-none mb-8 animate-in slide-in-from-bottom duration-1000">
          TEST PHASE <br /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">TEST PHASE</span>
        </h1>
        <p className="text-cyan-100/50 max-w-md animate-in fade-in duration-1000 delay-300 tracking-wide">
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
    <div className="glass rounded-[2rem] border border-cyan-500/20 overflow-hidden flex flex-col h-[700px] shadow-2xl shadow-cyan-900/20 bg-slate-950/60">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${
                msg.role === 'model'
                  ? 'bg-cyan-950/40 border border-cyan-500/20'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <img
                src={msg.role === 'model' ? 'data:image/jpeg;base64,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' : 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUTExMWFhUVGBcbFxgXFxgZFxgeFxoXFxgfGhgYHSggGBolGxcXIzEhJSkrLi4uFyAzODMtNygtLisBCgoKDg0OGBAQFSsdHR0tLS0tLS0tLS0rLS0tLS0tKy0tLS0tLS0tLS0tLS0tLS03LS0tNystNysrLS03LTctN//AABEIAOEA4QMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAAFAAIDBAYBBwj/xABMEAACAAMFBAcEBwUGBQIHAAABAgADEQQSITFBBVFhcQYTIoGRobEyQlLBFCNictHh8AczgpKyQ1NjosLSFRY0c/Gz0xckVFWDk8P/xAAZAQADAQEBAAAAAAAAAAAAAAAAAQIDBAX/xAAkEQACAgICAgMAAwEAAAAAAAAAAQIRAyESMUFREyIyFGGBBP/aAAwDAQACEQMRAD8Ar7Q2pLk4HFvhWle/4RxgC21bTOe4lQxySUtWpxY4kcaCLlh6MuT9eSt7ESko0965ltEGXaJJxxIjU2PZMuShvBJUs+0iE1Y6dZN9qacBgMMdY3lllPt0Iydi6OvMaswlm1RCGbk85qqg4C8Ym2zsGSinAXkGPVkgJu6ya5qeZpX4TBXbXSBZS9WoKgYLLlkK9NL7D9yp+FaueGUZC2Wt5tLx7INVlrhLXkurb2OPGMJNLQA21WqYtVBV1ulKgXaAkVAPv5ZkAbs4qJaQM6jn+MFWWucVptm3RKaBjZdp1gnsC2qs4zTWkqVNev2rtxfJmgG9kxwGJyu1BJ7s4IWCwz0LAUqwusrCtAcTfZaXDwxOMMaRupG2WSTLRaC6ijwAEDrVbGf2mJiiWnilUVgAMVeh/wAwHrEEzaKpTrFdMc2WoPIqTBbKItoPix+GS3+c0/0wFLRa2jtJDfCAsHRVqAQBQsT7WeYgf1vBvD8ICWPrHIaJo4+B/CFfG+Ak7SLNht8ySfqyKaqfZ7tx4iKnWD9A/hCvg7/A/hA1fZUW0zQr0vAp9WVONVJw4UYAjfhTSOWrpi7AgMiZUN410pjQekCLFa7ley1Dd0wBU1xqRvgw20MK0VVOINSR33VwPAxn8cTX5WRbP6Uza9ohs6UO7OmGMH7L0uTs3q44aYHDAnWAybPowmK1xqY3BQGor2lqQfCLNcxMlK1cS8tRU0+JDnhTInlGc4V0awn7NjZNqy5mRB4a+EWpk8ARkrDLs5N+WAKZ3DdAyrVMge6DJtCkYV5axnzrRqopgvpNN+qp8boPVj5LGedqAnTOC/SV8JQ+2fJG/OA8wYgcankPzpHRi/Jy5/2clLQU5+JNT6w+sKI57UEaGJFMeJZMUXegJi/IyEAh8KOwoAPRLXbJFkQhQC5xa8ST96ZMapHLPQCMVtbb8ya1QSPtZEV0QV7A+17Z3jKB9qtbzTVzrUCpwrhrixyqxxNdBQCGCUxnAv69co7ChpPn6nAU4k4UzjNbYDhFrZ+znnAsKJKU9uc+EteA+NuA/KCezuj3sfSFa8+MuzqaTHA96Y39kgOfcMzdjZ2TY6gq8yjOuCKMJUqmHYTIH7RxzyyjWMBgLZXR1WBKK8pSKda+E+aDuX+xTAYYE7hSsEW2NcAVACorSmm89redeOO+DVqtKy1LO1Bv1J0AAxZjoBUmMb0h6SVqgxph1deyp3zmU40/ulPBichckkBS2rb0T2RwDUqCdQi5zDvPsjUxlrUGmGrGuOFaacsO4YDnjF2fNZ2LOxZiKVO7cAMFHARGVjGxNg95JhhQ7oI3Ils9gMwXq3UGbmn+WuGG/KGmGwXKlMxooJPDLmTkBBKx7NUEBh1rj3R7C8yTj3+EXJEiq3ZYKS9TiGc8K4gHecTGu6J7MWjMVFBgo9YpbKowlp2biQilWz6tsyP8M5MOGnCKFPLDUHwMezWvZEiat1pYpoQSpU7wwNQeIjK7d2EigGfWgwW1IovLwtKDslf8SgpXGmtODEYQQkYqagkHh8xkRzgntHZLyGCzRS9ijrjLmDS42R5Z84q/RxGbdCFZbZdoAbnDEyz85fMVEFpFrUkKewxyBpQ8VYdlhyxgR9Hh0qVdFMCpOKtip/2niMYLRSYbmSRWoqrDJlJUjv15GJEtzp7YLLqyDEfeTUfdiPZVkZ1PVNfK+1IJ+uUf4bH94vA46Z4QSGy3Kh1BZTipXH/xjpnEyxqXZccjQF27alcSGVgwLviN9w+HfjFQPlxJ9KxJ0ksVwJMK0ImLU0pUEFcd+OsDnnUodxHngfXyhwjxVE5JcnYQMUdoTcQB+tYu3sKwGmTLzFvDlv5xRmPfL9coKy8hAYt6iDEs4CAB8KFCgAhhQosbNsMy0TBKlCrEVJPsoPiO/gNe6M6sZFZpDzXEuWpZ2yA4ZknRRXM+eUbHY+xlkMRLpOtIwZ2/cyCQMKfFwrU4YqIt7I2eqr1VnbDKbaPedhmsvCmGVcl4msHrJZ0lKERQqjxqczXU1rUnGOiMKGR2GxiVU1LO3tzG9pzvO4blGAiW02gS1ricQFVc2OgGlcDnhga4Q6Y4UFiQFUVJOQA3x590j260wlFwrUMdVU/2a0yOAvnfRRlDcqA7tzbzM1FYFsQXX2UBwuyq675uZxpQRn44BQUGQ7h3DSOxzyk2IUKFBLZFgRl6+aaSVyH94a4Gmqk/zGukCQJEFgsAdetmm5I0ORmctbtcK65CDD2YzAC63VHsS9w0LbzSmGnHS0kpnYTJgoR7EvD6saE/bI/lGA1JmdcIougZ1VTQZkxudm2e5LVeGPOM7suzXpyA6Y+EaxmAzIEaQXkGKOMNKV4aY+Uc6wbx4xxpyjNh4iNLRIEtmxiikS0WbIb27M2A5yWPsN9k4bisY/aOxQFM2QzTZQJvKQROk60mLnQbyK0z3x6M1sl/GvjA3aHUM3WLMEucBQTFFSaZBx76cD3EZiWkwPNV9co7BnbFnkOS0ukufU3pQr1U7eZLEYHWh1JqNYBCcPDSlCOFN8c7jQiVJjKQyMVdTVWGh+fKNvsLbfWBnUDrFFZ8pa9of3spd+GI1yzpXBiYN8S2e0tLYTJbUdDVTyzB4EZiKi2gNL06mLNkuyG8oAZSMahCGwOusYdzUEb/AMI0y2oTFZqUDV61PgZq9td6mpNOPOMpKPZGuFK79PlFDZba03pRAzIoPCKSNUCOy8B3n1MRrgSu/EfP5QhEl7EDjBSwzKih0ygLPahU8fWCNlm3SeUAgnTjCgT9OaFAAZ2ds957FUKhVxmTH9iWN7HlkPTONxsnZQMsS0DJZz7RbCdaDvc5qmAwzOWAFDR2ZPs4VVVKSUNUS9i7Y/WTCcXOoB1xzpQw23QcgPGKjSKoLS5YAAUAAYAAUAAyAAypHe+gGZ3UFce79bg3/HOC95gBtzpKzIeyLlaAY/XEZ1/wRSp+KlMs75oB/Szb16kuWSARUEZ0+L/YOBbDs1yKigoIY89mYszXmY1JOp+XLQCFfjGTbAkhRH1sds/1jBRlmxBxA4faOQiVERd2fYRNq7mkhK3z8dMwOGjHuEaGzSzMImMt1RTqkyoBkxGQY7tBTUwOs79ayhJf1cqlxACasuTMNw90HUV1EFFkWuYaLKYfabsAd5xPcItIosM1MyIge1LWgxO4ZnkMz3Rek9HAvanzieC9kfzGp8KRYFus1nBElFrqRmebHtN3mHXsZTstntDYy5bL9pmuDwxbyidtkzhi8+UvJWPgSwPlA61dJ2clUJJGaoLzAcTkO8wJa0z5hyAwzclj4Lh5wnOKCjRNY5Wtqb+FFHqDEZWzjObObvQegEYeba5zOUL0ONAoCg7sSCRX5wLmoSxDs5vYAsxJB7zvHpvhc0DR6K82wjN5nfOI8gYiFu2aN55z2/3R5HbpZViDn+vKK4irJPY22nsrVZZplemVyy96BFtmbOJJ+rmIallBUTl4y3X2qD3WGI1jz4Kgp56esIzAaEkYacPD1gsdGnt8qQjgIwdGxVq0OGYcKcDTI0x4RCyD3WNdK5eOYjPTAKAhc9MfUQ2VaHTIkcDl4QhNGikWl5TB9RxqCNRUeVdaQ17PMN6ZLS/KLMwKnFakkhl0IqYGyNp78OX5xckWsjFJhQ7wacqg4NjzxgAdZ9nznxVTQ49qgWvMmtOQi8uwphpemIp4KW8yRBPYAmTJRYNLJVz1iksty9irAqGBUndgDnBGfZJye1JPNXlsPUGBjoxG2rC8mgJDqfZYClCNCMaH846rVHP8I021LPflMpRq6CmNRSkZWSpAocwSDwoYBND7ohQ3rljkAj0rrbBMGNnlc0N0+K0h6WGwHITl4CdMp5tGJt1glB1RJYBpUkYEDIZHXGOzrAqIGDzVY1ydjpXU8hErIjTiafaLWJL11pt1cKCYS8xiPZUMCAoqKscIy0/tm87NUYDFSANwFPOmMds9hLXQ82ZjU5rrWua5mkMnbNo6p1j0O8rXDT2YTmmJxY0yF+Jv8v8AthfR01LeK/IRQ2vZjKDXWbClKnQ90B1t0z4zDWyXGjWWLZiTXEsYDNmJJKjkTnXLlGns0uzKBKloFlISJj4dbOOoL5qoOBu7qYDPy36fM/vGBOZrTLlELTSc2J7zFoD2mf0xlSxdDSk3C8MuVYF23p6uk5f4QT6CPJiYVYB2bPafTZ2PYBY/Ex/0iM7a9sz5uDTGpuHZHgIHQ+WDWALPQuhko/Rix94he5ST6tBixyaiYf4R/F+UN2LK6qRJkAfWlASoxIJxN7dnBa2S1kIF1zPEn8I5ZJ22aozPSSxdWyzQMML3CmvgaHkN8V9obPExesUVp7QGZHDxw7o0rL1sgHMrgR5ivMVgXZ5XUtdzQiq/dOYJ3g4QroKMdtiwFpYcYsmDU95dGG+laGAlnlAtRmCjUkEgeEenzbBLFCa3STdZcxeoSrA6GlRzI3Rlekmw0FZkhq49pMjX7I+UbQyJ6IaPTP2YWLZDSgku0SzOY9sTaCYx+yr5r93vjV9J+hknqxMlWdJzIwLyrssGalCGVSVpfAN5amhIA1j5iezOuLIy8SCPOkbLo7+1DaFkUIJxmIMlmAOAO/tH+YRtZFE3SsWaZOCybKLMqVvIUKz2bEUKrku6kaDor+yZrRLadPR5QcDqkLATBvZg9aA4UBxio/7abYSGMqyXtCbO97x66Ov+263Ee4D9iUF83d6eESBQ6X/svnWRTNllpiKCWBUBxTGtBgRvpiN0efkkD840/SDp/bbZUTZhKH3Sez/KtFPhGYnzi1KmvdDGOs9rdKlXIqKGhzHzEH9mdIrSagsGuivaGPipHzjMQX2JLqJh4fnBJ0gRqbPtKc4JIQUIHvfrURnbbOYl5l0ANiRU4E89/wCMaHZcjs01AZ/6aekZzb4ui7vI8AMvPyjGEm2NoEX2hRFCjYk3tglVJY5uak8B+J05xYtMq+wXQCp7z+UTWdaYagDwy9fWOMhQlzirEVPwkCleW+OOzcitKVZQPhb0oPOH22V2pTcQe5gRDpo7aH7w8RUekXZcu9J4yz5A19DAAB6R2aqEjVT4jERi51nZTRgVO4x6TarN1kphqMecSWOwSbVKlictaC7eGDCmFQe7IxpHJx0Lg2eWkRyNrt79n1olVaSROTHIUmDmuvMGMc8ogkEEEZgjEd0dFmTTQyFHaRJKkMzAKCScgBUnlSAVDEQk0GZyg/s6zmU6hB1k85KMRL38K+kWtk9HJyh3mfVAVWtKucsEXea0rWNjsTZkuxyy13ttiTma6LXh+cZynRagyx0e2X9EWrm/PmYzGzoBjdBrljFfbNuvkmuA3Z1yFO+kVtp7WEtakks5wGp3AeVTEWxZbTnDGhCGppkW0AOoUY8zwjCVs1j6LeyLa0mZcm0uvkw11r94Y4a0rBDakgJxX5Nl51i1bdkBpdCKnUa8KHQjMHfAG2y2CXJhJCgqkwYMoOjHCnpCvwU40Ptlnmqt+Sa7hhRuGORGdIATbdKnVE+SrmtCQOrmAjMUOZHOL+y9tvZ36uaAVOteyw7/ACMTdJdly3uzwA6E+17wr7jn+ltDQHA1jWKoyZmbd0dqGezMZijOWcJi9x9rujPzWw9kA8MPKNxs7YZDVSYRUBpTAZAAAhhgVIrv35ZQO6SbDmmswpU0qzS8m4kUqG7ouORXQnB1dGQMKJHlEUrUVFRXXiOEMIjQzGwocq1gpsbo/aLU1JKEjVjgo5sYAoFqsano9YSbO7U9uYqDxF7yjRSOhEizS789jMmUJIGEtaY5ZnmfCLGw7MFs8rCgYNMI3Xu184xyTVUjRQa7HbPkC/M/l8jGG6W/vQPsj9eUegyGoVJ95yT4UjF9ObPR1bmvgaxOJ7HJaMrChQo6TI9UlWerXRmcz+vSLm1ZQUrLGgx5n9ecFdm2VZSmY+mQ9IHWVDNmtMOpNP1yEcTVG4GtshpQp8NHU8Ae0OJGI7wYuWScFY7jj4YE+HpFzbci/KNMGGKndprhQ8YF2SzuKduunaUYVFDlSEBNOtKSZnbPZamOhDYDnj6w7ZpEua0vR+3LrXvz1y8OMDZlXlNKYgzLOe0CPblmoJrifZ45rDrFazMAkzTdmo1JM07xkG4kHLWuGUXx0OMqZ6BYp15a6678Iobb6OWa1Cs2WL2jrg/iM++K2wbcWJDC63suvwtpQ6g5g8YPgxcHockjAD9mMq9U2hiu66L381aeUafZnR2TZVpZ0CzDhfbFxxqcyNANaQYgdty2dXLpeC3gatX2VHtkbjSgB0JinIniCZvVggj91KwXUuwzY6tuB3ljAa2W9nBZadWubn92tMMKe01cMPKCVl2c1oIvArJAoqDC8B8VMacNdYLtsZWYVA6tKXF0J+JhwyUaYmMkt2VRkNjdGJk9uttBah9lcRgcr1MhTQd8avYVhWXMnqAAFdAoAFB9VLJoOfrBpEAFBlFLZ5+stH/cH/py40oOui1OOEUZ0lXHa1wyr5RftPswPvxlPs0htGb2x0PWnYqg4Yp3qcu6BdhnTLMTIngmVM7NfdNdKnLvxHGPR5D1EUNobLVweyCDmpxB7ordENKzLbImmzTbpN6UxpU+6W9g4+6w7J4iNnMsaNjSh3jOMcJHVTUksKypl5VJzFQWCk7wwNDxjaWRaKBWtNd/5wLY+imNjySnVTJUtkBNAVBArieWO6AO0f2dWSYaozyq6Kbw8CDTxjYQo0VohpMyWyv2f2SVi4M4/bwUfwjA98aqVLVFCqoVVGAUUA7hD4gtcyiwpS0NIzPS20l1MsHGZVRyOfjgP4ofPUKqSwcaBRyWB8uYJs8uT2UxHIVun+Jsf4RDPp15zMyqaINyrix7zhGPgJbZbnn6xR8NB+MB+m9jLy2NMVow7hQ+UE5OLA7yPWLe2JAZanWoPfhBB0yZdHj9OEKNP/y6YUdHyoxo3u1LUTSWvfxJi7s2SEQncKDm3684D2JcSxyHrGg2et4qu7tH18sIwjtmz6KW05dJT8wvzMDZa/V3uIp+u+CvSCb2FUasT3/oxTnS7sqnL8YmSpgjN9IZrSJ0u1JjUAMNGGoPnFuXLlsVKreV1Nz/ABEGaGv9olez+RpzpPLvSEGtK13UIHzjmwtms0i9La8BjcyKkVFVOQdSCPtA0Ma3cQXZdtEuZLCzlqwXCpBvMtfZmbnGjZVqDvjWbMtizUVga1AIO+vp/wCYG9H9qiYCj0vrgcCCdDUHGh3HKCFi2bLlFurqqsa3dAdaD3a7svGBFl2AD2Fp9pmM/wC7l3VQbyoDEneAWPeOEH4aksDIak+JJMUIUtAAAIfHIUACgbsk/WWr/vn/ANOXBKAexrQvX2xbwr1wNOBlp+u6GJhq1D6vvgRWCtrnKJZBIgL1wjnytXo2xrQRsD6RdgRZZnaHGDBjTG7RORUwPtyxFrrLS9eUjmpBrwNAR3wXjjJWldDHYpKiWxQoUKGIRjL9Kdp3VuKal92i6nhuHFhrhGktLdmMc2zJ06YZkw3JZNTj22oOyBXIYmldSTrhEmUloDAuJLdq7WgZ6YAkUCJoSq57qHUxDsW0dZMIAwBuINwWmfExb23NFxpoAEmRVJSjJ5mQPELU9+PMb0YW6eIYk8arLx8TDr6mb0zUWBa9zKfGDAk3g6a405j8oH2QBZnBhBK21lTVbTD9esZpaBgT6O27yhRqfpEmOwUgozNkS8QvujE8TBRrTcU09pqKP13CKssLKSrEAe8YH7Mthnzb/uIDT9ccImI2EJyX5oXRFx/XOFbjVacosSpd0VPtP2jwGQ9IrK15iTkKeUNgCOkBF19yywvfn8x4RS6DW245lN7wDD73vfIx3bT3iFHvtXzoPGnlAaReSkxMCrVBPnXgRGi6olOpWej27ZqzSrqbk1fZca71bepAg1KrQVzpATY9uWdKWYpzwO8HjxEGpLVFYIf2bT9j4UKFFkChQoUACjKdKNm3Z62lGK36K7CtKj2HYVowwumulN0auGz5YZSpxBFMYT6GuzK2Ryy1IowNGG5hn8vEb4pW0Ga3VKaL7xGZ0NOAqBxJpoYIzNmGU7FTUXaAHCoHs460xFc6HhCsdmIqzAX2xNK0GYAFQMAPMmOZqmb+CxsixhbqoKIuQEaCKthk3Rzi1G+ONIym7YoUKFGhAoUKFCAhtRwpFKdKvCmIqNP1wiefMqYznS/bHUSrifvXwXgNWPdWkZfqRr+VZj+l+0lmzOplikuSQMMia/8AmGWQEOSvtBcBvuEVr3UgSUqQgzqak+8cYOWMXXRhkwHmLpHOoHiI2lpUcrtuzTbMtSzUF04jFfWh4wctL9bKp7yen5GMXaFNnmXk9l6MFGu+hyB1G/Ebo01itYmoHQ89MTnhpGFUtFoH3ZnGFBLrR8B8YUSMx23NsNPIUXghoRge1oPvE6RrNh2dZMm9NooChnxryFdSYD7FslGa1WkgsSTLBwAAHtUyGGApgBziW1W0zDfYHq0qyoM2p7zVy7/WNmk3USE/IatltwLnAvgo56cMIpCdcl01evgNf1vgIk5582XeOCEsd1TUNT7Oa1+yTF/aM8BWfRQaclBIHM5nhGbjuh2CWnAzxUgUqf5RUDuz8Ygnm5KUjImh3Y4j0MUtnVcljndmn5D+o+EG9sbPKWZ5RxaUSpI4dpT3rSNXGtkFLoxtT6LOdWP1LEVHw1yb7uYPdHp1mm8cDr6c48fmgFJbnPFJg5i8tRxp5xo+iG3rhWzzWqh/dMdDkVJ03DuhzXk1xvVHpEKIbNMqKHSJXBoaGhoaEioHdrAnY3o7CgStpta4NIWZ9qU4APErMII5VbnEE/bkxTQyJ1dwkzG8ClQfGE2NbDsIiMtaNsWiYCqSbUtfhlGWe4zMPnFPqbYcpFpP37Qo9HMFv0P/AE2M+SGFCO+KsmyhT2iPGMydnW5v7GWP+5Pdj5Q5Oj1tOb2ZeSMx8zC4XsOVaNeJq/EPERz6QnxL4iMxL6MWnW1gDW7KQRLL6JsCT9KmgnO6ssV/ywUw0aE2lPiHjEcy3SwK3hTy8YD/APK5/wDq7RTmn+2Hp0Ss9QZjTZ1NJkwlTzVaAiHT9i0SHbTTTcsydYQcWJpLT7z0xP2RU8oIywyIA7331NKDHQDQcDE8qWqiigKBkAKDwGAijb7Si5uFopILZUGZ40wyhS6BdlfaNuSRLMyYaKPEncN5jy/aVtec7u/tORTcADWg5Co01i5tTbT2tquLqLW4BWhOrcz2RyJgda1oRrSp8K18YcVQpSsjsydupxIBPnhj/C3jGilqKU3UI4q351HdArZNmvdYRiVCqOYGPmTF+UxpVa1TvJRsiBvBr/LBPszQUs6pPl9U5F4Yox03g00gbLnTJE00wf3lOTDjxzxHAxA1oKuG0NMVyrngeODA92kHp9mS1y65TF1UUPMDdkCO7QRHQDP+aD/cj/8AYv4woEf8FtHxSPAQoPqFh+w7OnWpqnCXoSDd4ffPAYCIukEkXDLlGktWAmTcC02YpNVU0pdli8TpUARt7TJZ8L11Peu+0eF73RyFeIjHdK59+alnlLRZeGFAq6tgNwuigwqRHoTxRxw12Z3bKVgsZugA0LUw+ED2RXlnxMSvZRPfqxjKlIzzOIUEqp+8wqeFYdKlvPYybPjpMme4tc1qMznWmOnGDW0rAlksM2Whq0xWUtqxcXSeAC1oNKRjgwNvlJFSkujAbKsTCzm0Y0xlU43C5PiQI33SPZjMOulrfDIBNl6sordZPtCpBGoiey7D/wDkRZ2oGKVJ3Oe1Xxw7oLbOLGVLqKMFUNvBUUPPER1RwqqZFnmtt2b1liW0ScWlgS5oGvVkXHpwWncRuMVJ+wr8lZ0u9RlVruF4E0JI8zHpkqwLKmM8tQFm/vVwCg/GNODDv3xlrDMlh50qWyssuYbpU1FH7Q8CSI5v+qPDaNsO3TOdC+krTaSZn71Rg2QdRh3t64xt0aojyfpBYjKmiYrXbxvI2IusMSOIpG06MdIRPUChvj2xhQDRhqQY517NPaZpo7WOQoYhVpDOtXfDZ0qsVWWkQ5NFximW/pK8fKF9KX4T4xTpCpE/IyvjRbNsHwjxjiT66RWVSchFyVLoOMUm2S0kSRyFDZky6CaE0BNBmaY4ceEWQNnvQcTkNTyjzLprtszSZCMplqasQpxIBoK1oQDqKVrwgr0x6QB16qQQXIBLg+wGyAp7xB8IwlukkVoRQEjhphAlsUn4RYUYBaZCvPFRT9bodNcHuw540PoYkltQ04geFRE9ms15/uqzHjRa+phN7EloZsa2XDXRibwrxqDzFYKz5ZDBpZxOKfC+ZZTurmNxJjKbRlihcb8e7D5RBIt8xRQMbvwnLflpzEXwvZnZrURZyEISDT2Tgy1xpQ5ivsnhTUxFs+1zJN12NAWIqMgwwoa5NTQ5jlh3o/tWXM7NoUkLiXU0dDleUjEfaGRqNa10o6P2iS/WyurtMqYAJi0u9Yma1FSpYaMCMzhFxw8hciH/AI2Phl+f4Qot/wDD7F/9tnecKK/if2PmHdu25kWi1xHuEGa50WWvu7y5wHHQRYujU2YS089Wp/s0btUzozg4Ak1OpNSTGtuitdd+vjHQI73BPszIbLZUlIElqFUDBQKAfjENosQmOrPQqlCq/arWp5ADzi5SFFUSjgjkOIjzfp103Has9lbeJkweaof9UTOaiigd+0PpOZ0w2eU/1KYMQcJja1pmAcOOMCOh89pc4HJJlUO6tKr5jzgCiliAMycO+NVapAlSAFzQqR94EfnHn5HyTsuDpmq2tY+tlMnCq8GGXn5RhbDa3kTb8tirqSOBBGWPH0jfWO0CYiuPeAMZXpLsu7MvioWZmcMGr2huyINI48Tr6s68qupI9D6P7YlT0UISTTEH2lpne79/GDJjxvYm13sswOBUvg6/EFJFeYNTyMeuWG0rMRXVgVYAgjI1jaqMlsnhkyWDnD4UA0Vvox34Q4WYamJ4ULiiuTGrLUZCHQo47UBzw3Zw+iXs6TGU6Y9I+oHUy6dY655mXn2iOABI4iJ+lnSJJEkXbrmZUKnxVBFd6hToaeIjzW87AszX3mHFjiSaAerAQybJAtGbGoZganMk0LE8a0iBwSBjjie8tj5Q6f2SOTZV3tQ6blhpJF37OffUfjCYFuSgIvU4nDH3vwEHGkiVZHYijMKU5kCg8IqbHs18qNBSuuoP4wc2xiqL8UxRTTVj6Rg5fY3jHRgpSVExDvPcdIEuMY0Vul3bTPX7VfECA+0pVGroY7F0cL7GWG1NKcOhoR4EagjUGPbeiG05NokX5QCGv1ksZKxzoNAc/wBGPCawZ6MbeexzhMTEZMujD8RoY3xT4sGe9XDHYxX/AMSbF8M39d8KOj5Ik0baFSOwo0EcpHG/XziDaFvlyEMya4RRqfQDUx5N0w6bzLTWXKrLkZfaf7xGnCM55EhhTp303vXrPZm7OImTAcW3hTou8jOPOXesJmhojjlJsoJbAlXpy8MY0W1q9XQZsyjxMC+jUqhvbwfKNFZpN+fIXP6yv8is3yjOTHHbotdHAURpRzlkj8Pl4xa21ZeslMKYgVXmAT5ioiWdJC2lmGAZQTzGHyEWDHBJ1M9BL60eeScSuOOYxzvUJr5Qa6N7eayjE1lvhjkjE+1TdnUcOUUtoWUy5rqNLwB59pPKv8sUVe6XWgpViB3sKf5j4R1p2jmeme0yJ4bLEALjoajDyp4xMIwfQ7bJQfR2NS1TLJrjSgCnSuGHARt5U6pu6gAk6Y1HjUQDJYRNMYYs0EGmhI/lz9DFeXagaXsFmUuHQ3lvUPgYYFuvy/X64wB250kSzS2Ljt3roljMkZU3LTGvziptvpBKs0tQHN6WzBUr2mABFOApdIJ3CPP59pe0TBNmtV3JotOygGIA3QV7JbOTLS8+Y82a1WN7AZLUEBQOZGPzMQy2oJY3N8/wUGIbMCWNCKYnCm/50ESy5JN3hdrwqzV/yiGyUTMQTj7pUen4GJJQvEGuGHoT8/SK9nGNaZkHfkMfWNJsDZJdizDsqRhvNKU4gYE90ZydGkVbCWx7GZcsVFCaVG4ioia1pWZK4Fz4KV9Wi+E/XGE8rt03KfM1PmI5fNnVXgw3SCRS1TG3rLJ8Lv8ApgVa5V5DvAqI0u2pVZswbkQd4LN8xACO+H5R52T9MzpEIGJ7ZKusR3jvivFknawo5CgA+lJ89Ja3nYKu9iAPExi+kv7RJMnsWYLNc5sTSWvzY8MBHldu2hMnNfmzGdjqxJpyrlyEVaxvLK30KgjtnbM+0tfmzCx0FaKvJRgIG3o5CjFuxih6LUgb4aIubNl1au6EAf2Sl0gbhB/Y3/UJwRz4gL84B7NGPdBjZzFZpOFRLNK5Ylc+GEZ5OisX6CbTy1pK17KJQ8yQT8otgVgT0NkFxOmnGrUrqSCWb1HhByUKPTjHFNfY9CLtGY6TybpDUzGPNA3qG8oAT5VRl71f8vnitf4o323rBfRlABPu13xhVlk1Q4MtAdKEYd+kbYnowyR2RSQaCowI5H2ag1HEabzF6x261J7FqmKop7XazpqTX3opBrqDDIUOOq1/CJ5ZwC/FTzCn5iNG2QkX02vbQMLT7WBBQZscfNohmbStjrc+k0AOHZA9mpXLisVgCXukYVqOZUHwrSOLM+rPG8fEsfHtQcmFFXqrr3yxdyQxY61BOuZiSYB2QMqeFS1MeQMNK9sKfcIr4IN3ExFMmEpUDP0Cn8TFdk9Ibs9BTDOp/H/TFmyqbzA49k/0sB6wyxJdWhxqx8KDnviWyMb7Huw++B+MJvsEX7DYjMZUWla86DOp4Aeo3xv7NYRKlAcMK8dTzJNecV+jGyLi3mHaahPd7I5DzJi9ty03ErqoqPQY6Y0jJq1ZutFfZxDEnRaiu+n54d0dlS+2TpQeVYsbNlXZXd/586xxWCgschU+GMRRd6Zi9pGtonEfHdH8KqD51gDa5dGIgrKmFhePvlm/mZj6ERS2muI4j5x2JUjz5O2AtqS8A27CBhg5bEqhEAzDQHIUKFDAUKFChgKFChQgOiCey8mjsKAA3s7M8oIyfbf/ALRhQozydF4+w/0J/wCl/wDyTf6hFwe33woUcuTs7YdFm25GMDbf+of73yWOQocBTBTZNzf5xZs39n92X/8AzhQo1fRkiaT+9H3h/SkV/wCzPf8AKFChCR3+0mc//binK9n+b0hQo0RmydPZHP8A2xbsX7/+KX/WY5CiH5Lj2j1yzZDkIz3TH92/8H9QhQoXhGnlhiyfuop2z91M+4/9JhQol/pD8MxEn2U+6vpFPaea8vnChR1I4X2DZ2R5GAJhQoECGwoUKGM//9k='}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>

            <div className={`max-w-[85%] p-4 rounded-2xl leading-relaxed shadow-lg overflow-hidden ${
              msg.role === 'user'
                ? 'bg-cyan-100 text-cyan-950 font-medium'
                : 'bg-slate-900/60 border border-cyan-500/20 text-cyan-100/90'
            }`}>
              {msg.text && <MessageContent text={msg.text} />}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter request"
            className="w-full bg-cyan-900/10 border border-cyan-500/20 rounded-xl px-4 py-4 pr-12 text-cyan-100 placeholder-cyan-100/30"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-cyan-600 text-white rounded-lg"
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
      <img src={src} className="w-full h-full object-cover grayscale hover:grayscale-0" />
    </div>
  );
};
