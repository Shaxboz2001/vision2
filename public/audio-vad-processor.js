// public/audio-vad-processor.js
//
// AudioWorklet — raw PCM capture + RMS calculation.
//
// Performance notes:
//   - HAR DOIM ishlaydi (idle holda ham) — wake word boshini ushlash uchun
//   - PCM Transferable orqali yuboriladi (zero-copy)
//   - msgEvery=2 → har ~16ms message (CPU friendly, VAD responsive)
//   - Long session uchun stable: hech qanday allocation main thread'da yo'q

class VadProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.frameCount = 0;
    this.msgEvery = 2; // 128 * 2 = 256 samples ≈ 16ms @ 16kHz
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const ch = input[0];

    // RMS — VAD signal
    let sumSq = 0;
    for (let i = 0; i < ch.length; i++) {
      sumSq += ch[i] * ch[i];
    }
    const rms = Math.sqrt(sumSq / ch.length);

    this.frameCount++;
    if (this.frameCount % this.msgEvery !== 0) return true;

    // PCM ni copy qilish (AudioWorklet buffer ni reuse qiladi)
    const pcm = new Float32Array(ch.length);
    pcm.set(ch);

    // Transferable orqali — zero-copy
    this.port.postMessage({ type: "frame", rms, pcm }, [pcm.buffer]);

    return true;
  }
}

registerProcessor("vad-processor", VadProcessor);
