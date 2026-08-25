export interface LiveSessionEvents {
  onOpen: () => void;
  onAudio: (base64Data: string) => void;
  onInterrupted: () => void;
  onTurnComplete: () => void;
  onTranscript: (text: string, isModel: boolean) => void;
  onInterimTranscript: (text: string) => void;
  onError: (msg: string) => void;
}

export class LiveSessionManager {
  private ws: WebSocket | null = null;
  private events: LiveSessionEvents;
  
  public serverMessagesReceived: number = 0;
  public audioResponsesReceived: number = 0;
  public audioChunksSent: number = 0;

  constructor(events: LiveSessionEvents) {
    this.events = events;
  }

  connect() {
    this.serverMessagesReceived = 0;
    this.audioResponsesReceived = 0;
    this.audioChunksSent = 0;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.ws = new WebSocket(`${protocol}//${window.location.host}/live`);

    this.ws.onopen = () => {
      this.events.onOpen();
    };

    this.ws.onmessage = async (event) => {
      this.serverMessagesReceived++;
      try {
        const msg = JSON.parse(event.data);

        if (msg.error) {
          this.events.onError(msg.error);
        }
        if (msg.audio) {
          this.audioResponsesReceived++;
          this.events.onAudio(msg.audio);
        }
        if (msg.interrupted) {
          this.events.onInterrupted();
        }
        if (msg.turnComplete) {
          this.events.onTurnComplete();
        }
        if (msg.liveMessage) {
          const liveMsg = msg.liveMessage;
          
          // Model text
          const modelParts = liveMsg.serverContent?.modelTurn?.parts;
          if (modelParts) {
            for (const part of modelParts) {
              if (part.text) {
                this.events.onTranscript(part.text, true);
              }
            }
          }
          
          // User text
          const interimInput = liveMsg.serverContent?.interimInputTranscription;
          if (interimInput && interimInput.text) {
            this.events.onInterimTranscript(interimInput.text);
          }
          
          const finalInput = liveMsg.serverContent?.inputTranscription;
          if (finalInput && finalInput.text) {
            this.events.onTranscript(finalInput.text, false);
          }
        }
      } catch (err) {
        console.error("[VOICE] Error parsing server message:", err);
      }
    };

    this.ws.onerror = (e) => {
      console.error("[VOICE] Websocket error:", e);
      this.events.onError("Connection to Zara failed.");
    };

    this.ws.onclose = () => {
      // closed
    };
  }
  
  sendAudioChunk(base64Data: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        realtimeInput: {
          mediaChunks: [{
            mimeType: "audio/pcm;rate=16000",
            data: base64Data
          }]
        }
      }));
      this.audioChunksSent++;
    }
  }

  sendClientContent(text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        clientContent: {
          turns: [{
            role: "user",
            parts: [{ text }]
          }],
          turnComplete: true
        }
      }));
    }
  }
  
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
