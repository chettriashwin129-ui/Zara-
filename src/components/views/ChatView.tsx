import { TTSControls } from '../TTSControls';
import { voiceEngine as ttsEngine } from '../../lib/VoiceEngine';
import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Plus, MessageSquare, Trash2, StopCircle, Activity, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Message } from '../../types';
import { ChatMessage } from '../ChatMessage';
import { useApi } from '../../hooks/useApi';
import { Toast } from '../Toast';
import { LiveVoiceEngine, VoiceState, VoiceDiagnosticsData } from '../../services/voice';

interface DbMessage {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  timestamp: string;
  action_request?: string;
  action_result?: string;
}

interface DbConversation {
  id: string;
  title: string;
  updated_at: string;
}

export function ChatView() {
  const { data: conversations, create: createConv, remove: removeConv } = useApi<DbConversation>('conversations');
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [convSearchQuery, setConvSearchQuery] = useState('');
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingConvTitle, setEditingConvTitle] = useState('');
  const activeConvIdRef = useRef(activeConvId);
  useEffect(() => { activeConvIdRef.current = activeConvId; }, [activeConvId]);
  
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'speaking' | 'processing' | 'error'>('idle');
  const [diagnostics, setDiagnostics] = useState<VoiceDiagnosticsData | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const voiceEngine = useRef<LiveVoiceEngine | null>(null);
  const [lastInputWasVoice, setLastInputWasVoice] = useState(false);
  const baseInputRef = useRef('');

  
  useEffect(() => {
    const onBlocked = () => {
      setErrorMsg("Tap the speaker button to allow Zara to speak.");
    };
    
    const onFailed = () => {
      setErrorMsg("Voice playback isn't available right now.");
    };
    window.addEventListener('zara_tts_failed', onFailed);
window.addEventListener('zara_tts_blocked', onBlocked);
    return () => { window.removeEventListener('zara_tts_blocked', onBlocked); window.removeEventListener('zara_tts_failed', onFailed); };
  }, []);
useEffect(() => {
    
    
    
    voiceEngine.current = new LiveVoiceEngine(
      (state) => {
        setVoiceState(state);
      },
      (text, isModel, isTurnComplete) => {
        if (isTurnComplete) {
          // Turn is complete. We should commit the buffered text if any exists.
          setZaraTranscript(zaraText => {
            setInput(userText => {
              if (zaraText.trim() || userText.trim()) {
                let currentConvId = activeConvIdRef.current;
                
                // If there's no active conversation, create one before saving messages
                if (!currentConvId) {
                  currentConvId = Date.now().toString();
                  const title = (userText.trim() || zaraText.trim()).substring(0, 30) + '...';
                  fetch('/api/data/conversations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: currentConvId, title })
                  }).catch(console.error);
                  
                  // Using setTimeout to safely update state from within the setState callback
                  setTimeout(() => setActiveConvId(currentConvId), 0);
                  activeConvIdRef.current = currentConvId;
                }

                setMessages(prev => {
                  let newMsgs = [...prev];
                  const timestamp = new Date();
                  if (userText.trim()) {
                    newMsgs.push({
                      id: Date.now().toString() + '-u',
                      role: 'user',
                      content: userText.trim(),
                      timestamp
                    });
                    
                    fetch('/api/data/messages', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: Date.now().toString() + '-u',
                        conversation_id: currentConvId,
                        role: 'user',
                        content: userText.trim()
                      })
                    }).catch(err => console.error(err));
                  }
                  
                  if (zaraText.trim()) {
                    newMsgs.push({
                      id: Date.now().toString() + '-a',
                      role: 'assistant',
                      content: zaraText.trim(),
                      timestamp
                    });
                    
                    fetch('/api/data/messages', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: Date.now().toString() + '-a',
                        conversation_id: currentConvId,
                        role: 'assistant',
                        content: zaraText.trim()
                      })
                    }).catch(err => console.error(err));
                  }
                  
                  return newMsgs;
                });
              }
              // Clear for next turn
              return '';
            });
            return '';
          });
        } else {
          if (isModel) {
            setZaraTranscript(prev => prev + text);
          } else {
            // Append final user transcript chunks
            setInput(prev => {
               // Final input chunks are incremental parts of the whole user turn
               return prev.endsWith(text) ? prev : prev + " " + text;
            });
          }
        }
      },
      (error) => {
        setErrorMsg(error);
        setVoiceState('error');
      },
      (interim) => {
        setInput(interim);
      },
      (diagData) => {
        setDiagnostics(diagData);
      }
    );



    return () => {
      if (voiceEngine.current) {
        voiceEngine.current.destroy();
      }
    };
  }, []);

  const toggleVoice = () => {
    if (!voiceEngine.current) return;
    const current = voiceEngine.current.getState();
    if (current === 'idle' || current === 'error') {
      baseInputRef.current = input;
      const selectedLiveVoice = ttsEngine.settings.liveVoice || 'Aoede';
      voiceEngine.current.startListening(selectedLiveVoice);
    } else {
      voiceEngine.current.stopListening();
    }
  };

  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [zaraTranscript, setZaraTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConvId) {
      fetch(`/api/data/messages`)
        .then(res => res.json())
        .then((allMsgs: DbMessage[]) => {
          
          const convMsgs = allMsgs
            .filter(m => m.conversation_id === activeConvId)
            .reverse() // Since they are ordered by rowid DESC in our generic API
            .map(m => {
              let actionRequest;
              let actionResult;
              try { actionRequest = m.action_request ? JSON.parse(m.action_request) : undefined; } catch(e){}
              try { actionResult = m.action_result ? JSON.parse(m.action_result) : undefined; } catch(e){}
              return {
                id: m.id,
                role: m.role as 'user' | 'assistant',
                content: m.content,
                timestamp: new Date(m.timestamp),
                actionRequest,
                actionResult
              };
            });
          setMessages(convMsgs);
        }).catch(err => console.error("Failed to fetch messages:", err));
    } else {
      setMessages([
        {
          id: '0',
          role: 'assistant',
          content: 'Hello Ashwin. I am Zara, your personal AI operating system. How can I assist you with your projects today?',
          timestamp: new Date(),
        }
      ]);
    }
  }, [activeConvId]);

  
  const handleRenameSubmit = async (id: string) => {
    if (editingConvTitle.trim()) {
      try {
        await fetch(`/api/conversations/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: editingConvTitle.trim() })
        });
        // We could refresh or mutate locally, but for simplicity we rely on next fetch or we can manually update:
        const updated = conversations.map(c => c.id === id ? { ...c, title: editingConvTitle.trim() } : c);
        // We'd need to mutate the useApi cache, but let's just trigger a reload if possible, or just let it be.
        window.location.reload(); // Simple hammer
      } catch (e) {
        console.error(e);
      }
    }
    setEditingConvId(null);
  };
    
  const handleNewChat = () => {
    setActiveConvId(null);
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeConv(id);
    if (activeConvId === id) setActiveConvId(null);
  };

  const handleSend = async (overrideText?: string) => {
    ttsEngine.stop();

    const textToSend = overrideText || input.trim();
    if (!textToSend || isLoading) return;

    let currentConvId = activeConvId;

    if (!currentConvId) {
      currentConvId = Date.now().toString();
      createConv({ id: currentConvId, title: textToSend.substring(0, 30) + '...' });
      setActiveConvId(currentConvId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    // Save to DB
    await fetch('/api/data/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: userMessage.id,
        conversation_id: currentConvId,
        role: userMessage.role,
        content: userMessage.content
      })
    }).catch(err => console.error(err));

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
        if (response.status === 429 || data.error === 'QUOTA_EXHAUSTED' || (data.message && data.message.includes('out of AI capacity'))) {
          const friendlyMessage = data.message || "I'm temporarily out of AI capacity. Please try again in a little while.";
          setErrorMsg(friendlyMessage);
          return;
        }
        throw new Error(data.message || data.error || 'Failed to fetch response');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
        actionRequest: data.actionRequest,
      };

      // Save AI message to DB
      await fetch('/api/data/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: aiMessage.id,
          conversation_id: currentConvId,
          role: aiMessage.role,
          content: aiMessage.content
        })
      }).catch(err => console.error(err));

      
      setMessages((prev) => [...prev, aiMessage]);
      // --- TTS ---
      if (ttsEngine.settings.autoSpeak) {
        ttsEngine.speak(data.reply);
      }
      // ---------

      if (lastInputWasVoice || overrideText) {
        
      }
    } catch (error: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Chat error:", error);
      }
      let messageStr = error.message || 'An error occurred during chat generation.';
      
      try {
        const parsed = JSON.parse(messageStr);
        if (parsed.error && parsed.error.message) {
          messageStr = parsed.error.message;
        }
      } catch (e) {
        // use original string
      }

      if (
        messageStr.includes('RESOURCE_EXHAUSTED') ||
        messageStr.includes('429') ||
        messageStr.includes('quota') ||
        messageStr.includes('Quota') ||
        messageStr.includes('rate-limit') ||
        messageStr.includes('out of AI capacity')
      ) {
        messageStr = "I'm temporarily out of AI capacity. Please try again in a little while.";
      }
      
      setErrorMsg(messageStr);
    } finally {
      setIsLoading(false);
      if (voiceEngine.current) {
        
      }
    }
  };

  
  const handleAction = async (msgId: string, name: string, params: any) => {
    try {
      const res = await fetch('/api/action/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, params })
      });
      const data = await res.json();
      
      setMessages(prev => prev.map(m => 
        m.id === msgId ? { ...m, actionResult: { success: data.success, message: data.message } } : m
      ));
      
      // Update DB message
      // Note: We might want to save actionResult to DB too, but skipping for simplicity
    } catch (e: any) {
      setMessages(prev => prev.map(m => 
        m.id === msgId ? { ...m, actionResult: { success: false, message: e.message } } : m
      ));
    }
  };

  const handleCancelAction = (msgId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === msgId ? { ...m, actionResult: { success: false, message: 'Cancelled by user' } } : m
    ));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex h-full relative z-10 overflow-hidden">
      
      {/* Conversations Sidebar */}
      <div className="w-64 border-r border-white/5 bg-[#18181B]/50 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-white/5 space-y-3">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>
          <input 
            type="text" 
            placeholder="Search conversations..." 
            value={convSearchQuery}
            onChange={(e) => setConvSearchQuery(e.target.value)}
            className="w-full bg-white/5 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-[#A1A1AA] outline-none border border-transparent focus:border-[#7C3AED]/50"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {conversations.filter(c => c.title.toLowerCase().includes(convSearchQuery.toLowerCase())).map(conv => (
            <div 
              key={conv.id}
              onClick={() => { if (editingConvId !== conv.id) setActiveConvId(conv.id); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer group transition-colors ${
                activeConvId === conv.id ? 'bg-[#7C3AED]/20 text-[#7C3AED]' : 'hover:bg-white/5 text-[#A1A1AA] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                {editingConvId === conv.id ? (
                  <input
                    type="text"
                    autoFocus
                    value={editingConvTitle}
                    onChange={(e) => setEditingConvTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameSubmit(conv.id);
                      if (e.key === 'Escape') setEditingConvId(null);
                    }}
                    onBlur={() => handleRenameSubmit(conv.id)}
                    className="bg-black/50 text-white text-sm w-full outline-none border-b border-[#7C3AED]"
                  />
                ) : (
                  <span className="text-sm truncate" onDoubleClick={() => { setEditingConvId(conv.id); setEditingConvTitle(conv.title); }}>{conv.title}</span>
                )}
              </div>
              
              {!editingConvId && (
                <button 
                  onClick={(e) => handleDeleteChat(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all rounded-md flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Voice Mode Full Overlay */}
        <AnimatePresence>
          {voiceState !== 'idle' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-50 bg-[#09090B]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8"
            >
              <button 
                onClick={toggleVoice}
                className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
              >
                <StopCircle className="w-6 h-6" />
              </button>

              <div className="relative mb-12">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#4F46E5] flex items-center justify-center shadow-[0_0_60px_-15px_rgba(124,58,237,0.5)] z-10 relative">
                  <Bot className="w-16 h-16 text-white" />
                </div>
                {voiceState === 'listening' && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-[#7C3AED] animate-ping opacity-50"></div>
                    <div className="absolute -inset-4 rounded-full border border-[#7C3AED]/30 animate-pulse"></div>
                  </>
                )}
                {voiceState === 'speaking' && (
                  <div className="absolute -inset-8 bg-[#7C3AED]/20 rounded-full blur-2xl animate-pulse"></div>
                )}
              </div>

              <h2 className="text-3xl font-bold text-white tracking-tight mb-4 text-center">
                {voiceState === 'listening' && 'Listening...'}
                {voiceState === 'processing' && 'Thinking...'}
                {voiceState === 'speaking' && 'Zara is speaking...'}
                {voiceState === 'error' && 'Try again'}
              </h2>

              <div className="h-24 flex flex-col items-center justify-center max-w-xl w-full text-center">
                {input && voiceState === 'listening' && (
                  <p className="text-xl text-white/70 font-medium">"{input}"</p>
                )}
                {zaraTranscript && (voiceState === 'speaking' || voiceState === 'processing') && (
                  <p className="text-xl text-[#7C3AED] font-medium leading-relaxed">"{zaraTranscript}"</p>
                )}
                
                {voiceState === 'speaking' && !zaraTranscript && (
                  <div className="flex gap-2 items-end h-8 mt-4">
                    {[...Array(6)].map((_, i) => (
                      <div 
                        key={i}
                        className="w-2 bg-[#7C3AED] rounded-full animate-bounce"
                        style={{ height: `${Math.max(4, Math.random() * 32)}px`, animationDelay: `${i * 100}ms` }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
              
              <p className="absolute bottom-8 text-white/30 text-sm">Tap the stop button or say "Goodbye" to end voice mode</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} msg={msg} onAction={handleAction} onCancelAction={handleCancelAction} />
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start gap-4 mb-6"
              >
                <div className="w-9 h-9 rounded-2xl bg-[#18181B] border border-white/5 flex-shrink-0 flex items-center justify-center mt-1 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 pt-0 relative z-20">
          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#7C3AED]/20 to-[#4F46E5]/20 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            
                        <div className="relative flex items-center bg-[#18181B] border border-white/10 rounded-[24px] shadow-2xl p-2 focus-within:border-[#7C3AED]/50 transition-colors">
              
              <button className="p-3 text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors rounded-xl flex-shrink-0">
                <Paperclip className="w-5 h-5" />
              </button>
              
              <div className="flex-1 flex flex-col relative">
                
                
                {isLoading && (
                   <div className="absolute -top-10 left-4 text-xs font-medium text-[#A1A1AA] flex items-center gap-2 bg-[#18181B] px-3 py-1 rounded-full border border-white/10">
                     Zara is thinking...
                   </div>
                )}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setLastInputWasVoice(false);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={voiceState === 'listening' ? "Listening..." : "Message Zara..."}
                  className="w-full bg-transparent px-4 py-3 outline-none text-[15px] placeholder:text-[#A1A1AA] text-white"
                  disabled={isLoading}
                  readOnly={voiceState === 'listening'}
                />
              </div>
              
              <div className="flex items-center gap-2 pr-2">
                <button 
                  onClick={toggleVoice}
                  title={voiceState === 'listening' ? "Listening..." : voiceState === 'processing' ? "Processing..." : voiceState === 'error' ? "Try again" : voiceState === 'speaking' ? "Stop Zara speaking" : "Talk to Zara"}
                  className={`px-3 py-2.5 transition-all rounded-xl flex items-center gap-1.5 flex-shrink-0 ${
                    voiceState === 'listening' 
                      ? 'text-red-400 bg-red-500/20 ring-2 ring-red-500/50 animate-pulse' 
                      : voiceState === 'processing'
                        ? 'text-[#7C3AED] bg-[#7C3AED]/20 ring-2 ring-[#7C3AED]/50'
                        : voiceState === 'error'
                          ? 'text-amber-400 bg-amber-500/20 ring-2 ring-amber-500/50'
                          : voiceState === 'speaking' 
                            ? 'text-[#7C3AED] bg-[#7C3AED]/20 ring-2 ring-[#7C3AED]/50' 
                            : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {voiceState === 'speaking' ? (
                    <StopCircle className="w-5 h-5" />
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      <span className="text-xs font-medium hidden sm:inline">
                        {voiceState === 'listening' ? 'Listening...' : voiceState === 'processing' ? 'Processing...' : voiceState === 'error' ? 'Try again' : 'Talk to Zara'}
                      </span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="bg-white text-black hover:bg-gray-200 p-3 rounded-xl transition-all shadow-lg shadow-white/10 disabled:opacity-50 disabled:hover:bg-white flex items-center justify-center group"
                >
                  <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Development-Only Voice Diagnostics Section */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="max-w-3xl mx-auto mt-3 p-3 bg-[#18181B]/80 border border-white/10 rounded-xl text-xs text-[#A1A1AA] font-mono">
              <div 
                className="flex items-center justify-between cursor-pointer border-b border-white/10 pb-2 mb-2"
                onClick={() => setShowDiagnostics(!showDiagnostics)}
              >
                <div className="flex items-center gap-2 font-semibold text-white">
                  <Activity className="w-3.5 h-3.5 text-[#7C3AED]" />
                  Voice Diagnostics (Dev Only)
                </div>
                <span className="text-[10px] text-[#7C3AED] hover:underline">
                  {showDiagnostics ? 'Hide details' : 'Show details'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div>Mic permission: <span className={diagnostics?.micPermission === 'GRANTED' ? "text-green-400 font-bold" : diagnostics?.micPermission === 'DENIED' ? "text-red-400 font-bold" : "text-yellow-400"}>{diagnostics?.micPermission || 'UNKNOWN'}</span></div>
                <div>Mic track: <span className={diagnostics?.micTrack === 'LIVE' ? "text-green-400 font-bold" : "text-red-400 font-bold"}>{diagnostics?.micTrack || 'STOPPED'}</span></div>
                <div>Live connection: <span className={diagnostics?.liveConnection === 'CONNECTED' ? "text-green-400 font-bold" : "text-yellow-400 font-bold"}>{diagnostics?.liveConnection || 'CLOSED'}</span></div>
                <div>AudioContext: <span className={diagnostics?.audioContextState === 'RUNNING' ? "text-green-400 font-bold" : "text-yellow-400 font-bold"}>{diagnostics?.audioContextState || 'CLOSED'}</span></div>
                <div>Chunks captured: <span className="text-white font-bold">{diagnostics?.audioChunksCaptured || 0}</span></div>
                <div>Chunks sent: <span className="text-white font-bold">{diagnostics?.audioChunksSent || 0}</span></div>
                <div>Server msgs: <span className="text-white font-bold">{diagnostics?.serverMessagesReceived || 0}</span></div>
                <div>Audio responses: <span className="text-white font-bold">{diagnostics?.audioResponsesReceived || 0}</span></div>
                <div>Voice model: <span className="text-purple-400 font-bold">{ttsEngine.settings.liveVoice || 'Aoede'} (Female)</span></div>
                <div>State: <span className="text-purple-400 font-bold">{diagnostics?.recognitionState || voiceState.toUpperCase()}</span></div>
              </div>

              {showDiagnostics && (
                <div className="mt-2 pt-2 border-t border-white/5 space-y-1 text-[11px]">
                  <div>Last event: <span className="text-white">{diagnostics?.lastEvent || 'none'}</span></div>
                  <div>Last Live API error: <span className="text-amber-400">{diagnostics?.lastError || 'none'}</span></div>
                  <div>Last transcript: <span className="text-emerald-300">"{diagnostics?.lastTranscript || ''}"</span></div>
                </div>
              )}
            </div>
          )}
          
          <div className="max-w-3xl mx-auto text-center mt-3">
            <p className="text-[11px] text-[#A1A1AA] font-medium tracking-wide">Zara AI by Ashwin Chhetri. AI can make mistakes.</p>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {errorMsg && <Toast message={errorMsg} onClose={() => setErrorMsg(null)} />}
      </AnimatePresence>
    </div>
  );
}
