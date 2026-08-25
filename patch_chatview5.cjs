const fs = require('fs');
let code = fs.readFileSync('src/components/views/ChatView.tsx', 'utf8');

const targetVisual = `{zaraTranscript && voiceState !== 'idle' && (
                  <div className="absolute -top-20 left-4 text-xs font-medium text-emerald-400 bg-[#18181B] px-4 py-2 rounded-2xl border border-emerald-500/30 shadow-lg max-w-sm truncate">
                     {zaraTranscript}
                  </div>
                )}`;
code = code.replace(targetVisual, "");

const oldSmallOverlay = `{voiceState !== 'idle' && (
                   <div className="absolute -top-10 left-4 text-xs font-medium text-[#7C3AED] flex items-center gap-2 bg-[#18181B] px-3 py-1 rounded-full border border-[#7C3AED]/30 shadow-lg">
                     {voiceState === 'listening' && (
                       <>
                         <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                         <span className="text-red-400 font-semibold">Listening...</span>
                       </>
                     )}
                     {voiceState === 'processing' && (
                       <>
                         <div className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse"></div>
                         <span className="text-[#7C3AED] font-semibold">Processing...</span>
                       </>
                     )}
                     {voiceState === 'error' && (
                       <>
                         <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                         <span className="text-amber-400 font-semibold">Try again</span>
                       </>
                     )}
                     {voiceState === 'speaking' && (
                       <>
                         <div className="flex gap-0.5 items-center">
                           <div className="w-1 h-2 bg-[#7C3AED] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                           <div className="w-1 h-3 bg-[#7C3AED] rounded-full animate-bounce" style={{animationDelay: '100ms'}}></div>
                           <div className="w-1 h-2 bg-[#7C3AED] rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
                         </div>
                         <span>Zara is speaking...</span>
                       </>
                     )}
                   </div>
                )}`;
code = code.replace(oldSmallOverlay, "");

fs.writeFileSync('src/components/views/ChatView.tsx', code);
