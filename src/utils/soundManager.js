const SOUND_STORAGE_KEY = "apfelkomplott-sound-enabled";

let audioContext = null;
let noiseBuffer = null;

function canUseAudio() {
  return typeof window !== "undefined" && typeof window.AudioContext !== "undefined";
}

function getAudioContext() {
  if (!canUseAudio()) return null;

  if (!audioContext) {
    audioContext = new window.AudioContext();
  }

  return audioContext;
}

function getNoiseBuffer(context) {
  if (noiseBuffer) return noiseBuffer;

  const duration = 0.18;
  const frameCount = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const channel = buffer.getChannelData(0);

  for (let index = 0; index < frameCount; index += 1) {
    channel[index] = (Math.random() * 2 - 1) * (1 - index / frameCount);
  }

  noiseBuffer = buffer;
  return noiseBuffer;
}

function getStoredPreference() {
  try {
    return localStorage.getItem(SOUND_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function isSoundEnabled() {
  const stored = getStoredPreference();
  return stored == null ? true : stored === "1";
}

export function setSoundEnabled(enabled) {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    // Ignore storage failures and fall back to the in-memory default.
  }
}

function scheduleTone(context, startAt, tone) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = tone.type ?? "sine";
  oscillator.frequency.setValueAtTime(tone.frequency, startAt);

  const attack = tone.attack ?? 0.01;
  const duration = tone.duration ?? 0.12;
  const release = tone.release ?? 0.08;
  const peak = tone.volume ?? 0.04;
  const endAt = startAt + duration;

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peak, startAt + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, endAt + release);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(startAt);
  oscillator.stop(endAt + release);
}

function scheduleNoiseBurst(context, startAt, burst) {
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  source.buffer = getNoiseBuffer(context);

  filter.type = burst.filterType ?? "bandpass";
  filter.frequency.setValueAtTime(burst.frequency ?? 2200, startAt);
  filter.Q.setValueAtTime(burst.q ?? 1.2, startAt);

  const attack = burst.attack ?? 0.002;
  const duration = burst.duration ?? 0.055;
  const release = burst.release ?? 0.04;
  const peak = burst.volume ?? 0.035;
  const endAt = startAt + duration;

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peak, startAt + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, endAt + release);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);

  source.start(startAt);
  source.stop(endAt + release);
}

function playPattern(pattern) {
  if (!isSoundEnabled()) return;

  const context = getAudioContext();
  if (!context) return;

  void context.resume().then(() => {
    const startAt = context.currentTime + 0.01;
    pattern.forEach((tone, index) => {
      const offset = tone.offset ?? index * 0.08;
      scheduleTone(context, startAt + offset, tone);
    });
  }).catch(() => {
    // Browsers can still block audio until the first user interaction.
  });
}

export function playUiClick() {
  playPattern([
    { frequency: 620, duration: 0.04, volume: 0.022, type: "triangle" },
    { frequency: 880, duration: 0.05, volume: 0.018, type: "triangle", offset: 0.045 },
  ]);
}

export function playPhaseAdvance() {
  playPattern([
    { frequency: 392, duration: 0.08, volume: 0.03, type: "triangle" },
    { frequency: 523, duration: 0.08, volume: 0.026, type: "triangle", offset: 0.07 },
    { frequency: 659, duration: 0.1, volume: 0.024, type: "triangle", offset: 0.14 },
  ]);
}

export function playRotation() {
  playPattern([
    { frequency: 180, duration: 0.16, volume: 0.02, type: "sawtooth" },
    { frequency: 240, duration: 0.16, volume: 0.018, type: "triangle", offset: 0.05 },
    { frequency: 320, duration: 0.18, volume: 0.016, type: "sine", offset: 0.12 },
    { frequency: 420, duration: 0.12, volume: 0.018, type: "triangle", offset: 0.24 },
  ]);
}

export function playCardReveal() {
  playPattern([
    { frequency: 440, duration: 0.08, volume: 0.025, type: "sine" },
    { frequency: 587, duration: 0.08, volume: 0.023, type: "sine", offset: 0.08 },
    { frequency: 784, duration: 0.12, volume: 0.026, type: "sine", offset: 0.16 },
  ]);
}

export function playSuccess() {
  playPattern([
    { frequency: 523, duration: 0.06, volume: 0.024, type: "triangle" },
    { frequency: 659, duration: 0.08, volume: 0.024, type: "triangle", offset: 0.07 },
  ]);
}

export function playError() {
  playPattern([
    { frequency: 240, duration: 0.08, volume: 0.028, type: "sawtooth" },
    { frequency: 180, duration: 0.12, volume: 0.026, type: "sawtooth", offset: 0.08 },
  ]);
}

export function playGameWin() {
  playPattern([
    { frequency: 523, duration: 0.09, volume: 0.03, type: "triangle" },
    { frequency: 659, duration: 0.09, volume: 0.03, type: "triangle", offset: 0.09 },
    { frequency: 784, duration: 0.1, volume: 0.03, type: "triangle", offset: 0.18 },
    { frequency: 1046, duration: 0.18, volume: 0.032, type: "triangle", offset: 0.28 },
  ]);
}

export function playGameLoss() {
  playPattern([
    // A soft descending "oops" cue fits game over better than a harsh alarm.
    { frequency: 587, duration: 0.08, volume: 0.024, type: "sine" },
    { frequency: 523, duration: 0.08, volume: 0.024, type: "sine", offset: 0.08 },
    { frequency: 440, duration: 0.11, volume: 0.026, type: "triangle", offset: 0.16 },
    { frequency: 349, duration: 0.18, volume: 0.028, type: "triangle", offset: 0.28 },
  ]);
}

export function playSellCelebration() {
  if (!isSoundEnabled()) return;

  const context = getAudioContext();
  if (!context) return;

  void context.resume().then(() => {
    const startAt = context.currentTime + 0.01;

    // Short filtered noise bursts make the sale feel more like applause
    // while the bright notes keep the feedback positive and game-like.
    scheduleNoiseBurst(context, startAt, { frequency: 2400, duration: 0.04, volume: 0.028 });
    scheduleNoiseBurst(context, startAt + 0.06, { frequency: 2800, duration: 0.04, volume: 0.03 });
    scheduleNoiseBurst(context, startAt + 0.13, { frequency: 2200, duration: 0.05, volume: 0.026 });

    scheduleTone(context, startAt + 0.015, {
      frequency: 659,
      duration: 0.07,
      volume: 0.02,
      type: "triangle",
    });
    scheduleTone(context, startAt + 0.09, {
      frequency: 784,
      duration: 0.08,
      volume: 0.022,
      type: "triangle",
    });
    scheduleTone(context, startAt + 0.17, {
      frequency: 988,
      duration: 0.12,
      volume: 0.024,
      type: "triangle",
    });
  }).catch(() => {
    // Browsers can still block audio until the first user interaction.
  });
}
