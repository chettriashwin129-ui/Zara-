export class AudioEncoder {
  static encodeFloat32ToPCM16Base64(inputData: Float32Array): { base64: string, maxAmp: number } {
    const pcm16 = new Int16Array(inputData.length);
    let maxAmp = 0;
    for (let i = 0; i < inputData.length; i++) {
      let s = inputData[i];
      if (Math.abs(s) > maxAmp) maxAmp = Math.abs(s);
      let clamped = Math.max(-1, Math.min(1, s));
      pcm16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
    }
    
    // Base64 encode
    const bytes = new Uint8Array(pcm16.buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    
    return { base64, maxAmp };
  }
}
