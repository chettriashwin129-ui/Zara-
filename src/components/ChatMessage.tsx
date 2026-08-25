import { voiceEngine } from '../lib/VoiceEngine';
import { Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Copy, RotateCcw, Zap, CheckCircle2, XCircle } from 'lucide-react';
import type { Message } from '../types';

interface ChatMessageProps {
  onAction?: (msgId: string, name: string, params: any) => void;
  onCancelAction?: (msgId: string) => void;
  msg: Message;
}

export function ChatMessage({ msg, onAction, onCancelAction }: ChatMessageProps) {
  const isUser = msg.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start gap-4'} mb-6 group`}
    >
      
        {msg.actionRequest && !msg.actionResult && (
          <div className="mt-4 bg-[#18181B] border border-[#7C3AED]/30 p-4 rounded-2xl w-full max-w-sm shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-[#7C3AED]" />
              <h4 className="text-sm font-semibold text-white">Zara wants to</h4>
            </div>
            <p className="text-[#A1A1AA] text-sm mb-4">{msg.actionRequest.description}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => onAction && onAction(msg.id, msg.actionRequest!.name, msg.actionRequest!.params)}
                className="flex-1 bg-white text-black hover:bg-white/90 px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              >
                Approve
              </button>
              <button 
                onClick={() => onCancelAction && onCancelAction(msg.id)}
                className="px-3 py-2 rounded-xl text-xs font-medium text-[#A1A1AA] hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {msg.actionResult && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            {msg.actionResult.success ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-green-500/90 font-medium">Action completed: {msg.actionResult.message}</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-500/90 font-medium">Action failed or cancelled</span>
              </>
            )}
          </div>
        )}

        {!isUser && (
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex-shrink-0 flex items-center justify-center mt-1 shadow-lg shadow-[#7C3AED]/20 relative">
          <div className="absolute inset-0 bg-white/20 blur-[2px] rounded-full"></div>
          <span className="text-xs font-bold text-white relative z-10">ZA</span>
        </div>
      )}
      
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[75%]`}>
        <div
          className={`px-5 py-4 text-[15px] leading-relaxed shadow-sm ${
            isUser
              ? 'bg-[#18181B] border border-white/5 text-white rounded-3xl rounded-tr-sm'
              : 'bg-transparent text-white/90'
          }`}
        >
          {isUser ? (
            <p>{msg.content}</p>
          ) : (
            <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#18181B] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-code:text-[#7C3AED] max-w-none">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
        
        {!isUser && (
          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium">
              <Copy className="w-3.5 h-3.5" />
              Copy
            </button>
            <button onClick={() => voiceEngine.speak(msg.content, true)} className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium" aria-label="Play Zara response">
              <Volume2 className="w-3.5 h-3.5" />
              Play
            </button>
            <button className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium">
              <RotateCcw className="w-3.5 h-3.5" />
              Regenerate
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
