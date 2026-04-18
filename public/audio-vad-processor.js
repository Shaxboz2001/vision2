// public/audio-vad-processor.js
//
// AudioWorklet — raw PCM capture + RMS calculation.
// Main thread ga PCM chunks va RMS yuboradi, u yerda ring buffer va VAD logic ishlaydi.
//
// Bu processor HAR DOIM ishlaydi (idle holda ham), shu tarzda wake word
// boshi ("mu" qismi) yo'qolmaydi — main thread ring buffer orqali pre-roll ni saqlaydi.

class VadProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.frameCount = 0;
    // Har 2 frame da xabar (128 samples * 2 = 256 samples ≈ 16ms @ 16kHz)
    // Bu CPU yuklamasini kamaytiradi, lekin VAD responsiveness ni saqlaydi.
    this.msgEvery = 2;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const ch = input[0];
    // PCM ni copy qilish — AudioWorklet buffer ni reuse qiladi
    const pcm = new Float32Array(ch.length);
    pcm.set(ch);

    // RMS hisoblash (VAD signal)
    let sumSq = 0;
    for (let i = 0; i < ch.length; i++) {
      sumSq += ch[i] * ch[i];
    }
    const rms = Math.sqrt(sumSq / ch.length);

    this.frameCount++;
    if (this.frameCount % this.msgEvery === 0) {
      // PCM Transferable sifatida — zero-copy
      this.port.postMessage({ type: "frame", rms, pcm }, [pcm.buffer]);
    }

    return true;
  }
}

registerProcessor("vad-processor", VadProcessor);
