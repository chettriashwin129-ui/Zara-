const fs = require('fs');
let code = fs.readFileSync('src/components/views/ChatView.tsx', 'utf8');

const targetStr = `      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">`;

const replaceStr = `      {/* Main Chat Area */}
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
                        style={{ height: \`\${Math.max(4, Math.random() * 32)}px\`, animationDelay: \`\${i * 100}ms\` }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
              
              <p className="absolute bottom-8 text-white/30 text-sm">Tap the stop button or say "Goodbye" to end voice mode</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/views/ChatView.tsx', code);
