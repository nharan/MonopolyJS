class SoundManager {
  private static instance: SoundManager;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;

  private constructor() {
    // Initialize with available sounds
    this.loadSound('dice-roll', 'sound/dice-roll.mp3');
    this.loadSound('player-move', 'sound/player-move.mp3');
    this.loadSound('buy-property', 'sound/buy-property.mp3');
    this.loadSound('pay-rent', 'sound/pay-rent.mp3');
    this.loadSound('pay-tax', 'sound/pay-tax.mp3');
    this.loadSound('go-to-jail', 'sound/go-to-jail.mp3');
    this.loadSound('get-out-of-jail', 'sound/get-out-of-jail.mp3');
    this.loadSound('pass-go', 'sound/pass-go.mp3');
    this.loadSound('button-click', 'sound/button-click.mp3');
    this.loadSound('auction-win', 'sound/auction-win.mp3');
    this.loadSound('game-over', 'sound/game-over.mp3');
    this.loadSound('auction-start', 'sound/auction-start.mp3');
    this.loadSound('auction-bid', 'sound/auction-bid.mp3');
    this.loadSound('game-start', 'sound/game-start.mp3');
    this.loadSound('turn-start', 'sound/turn-start.mp3');
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private loadSound(name: string, path: string): void {
    try {
      const audio = new Audio(`/${path}`);
      
      // Preload the audio
      audio.load();
      
      // Set initial volume
      audio.volume = 0.5; // Set to maximum volume
      
      this.sounds.set(name, audio);
    } catch (error) {
      console.error(`Failed to load sound: ${name}`, error);
    }
  }

  public play(name: string): void {
    if (!this.enabled) return;
    
    const sound = this.sounds.get(name);
    if (sound) {
      try {
        // Create a clone to allow overlapping sounds
        const clone = sound.cloneNode() as HTMLAudioElement;
        clone.volume = 1.0; // Set volume to 100%
        
        // Force a reload to ensure proper playback
        clone.load();
        
        const playPromise = clone.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error(`Failed to play sound: ${name}`, error);
          });
        }
      } catch (error) {
        console.error(`Error playing sound: ${name}`, error);
      }
    } else {
      console.warn(`Sound not found: ${name}`);
    }
  }

  public toggleSound(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }
}

export default SoundManager; 