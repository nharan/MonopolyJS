import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import SoundManager from '../utils/SoundManager';

const SoundToggle: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const soundManager = SoundManager.getInstance();

  useEffect(() => {
    // Initialize state from sound manager
    setSoundEnabled(soundManager.isEnabled());
  }, []);

  const toggleSound = () => {
    const isEnabled = soundManager.toggleSound();
    setSoundEnabled(isEnabled);
  };

  return (
    <button 
      onClick={toggleSound}
      className="p-2 rounded-full bg-white shadow hover:bg-gray-100 transition-colors"
      title={soundEnabled ? "Mute sounds" : "Unmute sounds"}
    >
      {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
  );
};

export default SoundToggle; 