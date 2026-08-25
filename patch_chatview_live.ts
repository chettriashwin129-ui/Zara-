import fs from 'fs';
let content = fs.readFileSync('src/components/views/ChatView.tsx', 'utf-8');

const targetInit = `    voiceEngine.current = new GeminiLiveService(
      (state) => {
        setVoiceState(state);
        if (state === 'idle') {
          setZaraTranscript('');
        }
      },
      (text) => {
        // Final transcript (Zara's text)
        setZaraTranscript(prev => prev + text);
      },
      (error) => {
        setErrorMsg(error);
        setVoiceState('error');
      },
      (interim) => {
        // Interim transcript (User's text)
        setInput(interim);
      },
      (diagData) => {
        setDiagnostics(diagData);
      }
    );`;

const injectionInit = `    voiceEngine.current = new GeminiLiveService(
      (state) => {
        setVoiceState(state);
      },
      (text, isModel, isTurnComplete) => {
        if (isTurnComplete) {
          // Turn is complete. We should commit the buffered text if any exists.
          setZaraTranscript(zaraText => {
            setInput(userText => {
              if (zaraText.trim() || userText.trim()) {
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
                    
                    // Fire-and-forget save to DB
                    fetch('/api/data/messages', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: Date.now().toString() + '-u',
                        conversation_id: activeConvId,
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
                    
                    // Fire-and-forget save to DB
                    fetch('/api/data/messages', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: Date.now().toString() + '-a',
                        conversation_id: activeConvId,
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
               // Sometimes API sends duplicate or accumulating strings for transcription?
               // The API usually sends complete segments for final input transcription, but let's just append for now, or replace?
               // Wait, inputTranscription in Gemini Live returns complete text for the turn chunk, or incremental?
               // Actually, interim is full replacement, final is append.
               return prev + text + " ";
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
    );`;

content = content.replace(targetInit, injectionInit);
fs.writeFileSync('src/components/views/ChatView.tsx', content);
console.log("Patched ChatView init");
