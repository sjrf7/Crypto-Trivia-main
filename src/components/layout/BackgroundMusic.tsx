
'use client';

import React, { createContext, useContext, useState, useRef, ReactNode, useCallback, useEffect } from 'react';

interface MusicContextType {
  isPlaying: boolean;
  toggleMusic: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const BackgroundMusicProvider = ({ children }: { children: ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.1;
      if (isPlaying) {
        audio.play().catch(err => {
          console.error("Audio autoplay failed:", err);
        });
      }
    }
    
    const handleFirstUserInteraction = () => {
        if (audio && audio.paused && isPlaying) {
            audio.play().catch(console.error);
        }
        window.removeEventListener('click', handleFirstUserInteraction);
        window.removeEventListener('keydown', handleFirstUserInteraction);
    };

    window.addEventListener('click', handleFirstUserInteraction);
    window.addEventListener('keydown', handleFirstUserInteraction);

    return () => {
        window.removeEventListener('click', handleFirstUserInteraction);
        window.removeEventListener('keydown', handleFirstUserInteraction);
    };
  }, []);

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.1;

    setIsPlaying(prev => {
        if(prev) {
            audio.pause();
        } else {
            audio.play().catch(err => {
                console.error("Failed to play audio:", err);
                return false; // Return false to not update state if play fails
            });
        }
        return !prev;
    });
  }, []);
  
  return (
    <MusicContext.Provider value={{ isPlaying, toggleMusic }}>
      <audio ref={audioRef} src="/sounds/background-music.mp3" loop preload="auto" />
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a BackgroundMusicProvider');
  }
  return context;
};
