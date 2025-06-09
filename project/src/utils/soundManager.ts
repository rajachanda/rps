class SoundManager {
  private audioContext: AudioContext | null = null;
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playClickSound() {
    this.createTone(800, 0.1, 'square');
  }

  playWinSound() {
    this.createTone(523, 0.2); // C5
    setTimeout(() => this.createTone(659, 0.2), 100); // E5
    setTimeout(() => this.createTone(784, 0.3), 200); // G5
  }

  playLoseSound() {
    this.createTone(392, 0.3, 'sawtooth'); // G4
    setTimeout(() => this.createTone(349, 0.3, 'sawtooth'), 150); // F4
    setTimeout(() => this.createTone(294, 0.4, 'sawtooth'), 300); // D4
  }

  playTieSound() {
    this.createTone(440, 0.2); // A4
    setTimeout(() => this.createTone(440, 0.2), 300); // A4
  }

  playCountdownSound() {
    this.createTone(1000, 0.1, 'square');
  }

  playStartSound() {
    this.createTone(659, 0.15); // E5
    setTimeout(() => this.createTone(784, 0.15), 100); // G5
    setTimeout(() => this.createTone(1047, 0.2), 200); // C6
  }
}

export const soundManager = new SoundManager();