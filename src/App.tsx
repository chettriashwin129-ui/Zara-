import { useState, useRef, useEffect } from 'react';
import { Send, Mic, User, Sparkles, Settings, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Message } from './types';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '0',
          role: 'assistant',
          content: 'Hello, I am Zara. How can I assist you today?',
          timestamp: new Date(),
        }
      ]);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch response');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-[#020205] text-slate-200 font-sans overflow-hidden relative">
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]"></div>

      {/* Sidebar - Placeholder for Memory/Settings */}
      <aside className="w-72 border-r border-white/10 bg-white/5 backdrop-blur-2xl hidden md:flex flex-col z-10">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="font-bold text-white tracking-tighter">ZA</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">Zara AI</h1>
            <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-semibold">Companion v1.0.4</p>
          </div>
        </div>
        
        <div className="flex-1 p-6 space-y-8">
          <section>
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-4">Capabilities</h3>
            <div className="space-y-3">
              <button className="w-full bg-white/5 p-3 rounded-lg border border-white/5 flex items-center gap-3 text-slate-300 hover:bg-white/10 transition-colors">
                <Bot className="w-4 h-4 text-emerald-400" />
                <span className="text-sm">Chat Interface</span>
              </button>
              <button className="w-full bg-white/5 p-3 rounded-lg border border-white/5 flex items-center gap-3 text-slate-300 opacity-60 cursor-not-allowed">
                <Mic className="w-4 h-4 text-slate-500" />
                <span className="text-sm">Voice I/O (Soon)</span>
              </button>
              <button className="w-full bg-white/5 p-3 rounded-lg border border-white/5 flex items-center gap-3 text-slate-300 opacity-60 cursor-not-allowed">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-sm">Live2D Avatar (Soon)</span>
              </button>
            </div>
          </section>
        </div>

        <div className="p-6 bg-white/5 border-t border-white/10">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-slate-300 transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative z-10">
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-white/5 backdrop-blur-md z-10 md:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-bold text-white tracking-tighter text-xs">ZA</span>
            </div>
            <h1 className="font-medium tracking-wide">Zara</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start gap-4'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex-shrink-0 flex items-center justify-center mt-1">
                      <span className="text-[10px] font-bold text-white">Z</span>
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] md:max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-indigo-600/20 border border-indigo-500/30 p-4 rounded-2xl rounded-tr-none backdrop-blur-sm text-sm leading-relaxed'
                        : 'bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none backdrop-blur-sm text-sm leading-relaxed text-slate-200'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex-shrink-0 flex items-center justify-center mt-1">
                  <span className="text-[10px] font-bold text-white">Z</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none backdrop-blur-sm flex items-center justify-center">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-4 md:p-8 pb-10 relative z-10">
          <div className="max-w-3xl mx-auto relative flex items-center">
            <button className="absolute left-4 p-2 text-slate-400 hover:text-indigo-400 transition-colors rounded-xl">
              <Mic className="w-5 h-5" />
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Command Zara..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pl-14 pr-32 outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600 backdrop-blur-xl"
              disabled={isLoading}
            />
            
            <div className="absolute right-3 flex items-center gap-2">
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-indigo-600/20 uppercase tracking-widest disabled:opacity-50 disabled:hover:bg-indigo-600"
              >
                Execute
              </button>
            </div>
          </div>
          <div className="max-w-3xl mx-auto text-center mt-3">
            <p className="text-[10px] text-slate-600">Zara may produce inaccurate information about people, places, or facts.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
