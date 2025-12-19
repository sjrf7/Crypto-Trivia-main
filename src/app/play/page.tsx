
'use client';

import { useState } from 'react';
import { GameClient } from '@/components/game/GameClient';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/hooks/use-i18n';

type PlayState = 'selection' | 'classic';

export default function PlayPage() {
  const [playState, setPlayState] = useState<PlayState>('selection');
  const [gameKey, setGameKey] = useState(0);
  const { t } = useI18n();

  const handleRestart = () => {
    setGameKey(prev => prev + 1);
    setPlayState('selection');
  };

  const renderContent = () => {
    switch (playState) {
      case 'selection':
        return (
          <motion.div
            key="selection"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl mx-auto"
          >
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="font-headline text-3xl">{t('play.title')}</CardTitle>
                <CardDescription>{t('play.description')}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4 items-center p-6 bg-secondary rounded-lg">
                    <Gamepad2 className="h-12 w-12 text-primary drop-shadow-glow-primary" />
                    <h3 className="text-xl font-headline">{t('play.classic.title')}</h3>
                    <p className="text-center text-sm text-muted-foreground flex-grow">{t('play.classic.description')}</p>
                    <Button onClick={() => setPlayState('classic')} className="w-full">
                        {t('play.classic.button')}
                    </Button>
                </div>
                 <div className="flex flex-col gap-4 items-center p-6 bg-secondary rounded-lg">
                    <Wand2 className="h-12 w-12 text-accent" />
                    <h3 className="text-xl font-headline">{t('play.ai.title')}</h3>
                    <p className="text-center text-sm text-muted-foreground flex-grow">{t('play.ai.description')}</p>
                    <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        <Link href="/play/ai">
                             {t('play.ai.button')}
                        </Link>
                    </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      case 'classic':
        return (
          <motion.div
            key="playing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-4/5"
          >
            <GameClient
              key={gameKey}
              onRestart={handleRestart}
            />
          </motion.div>
        );
    }
  };

  return (
    <div className="flex justify-center items-center h-full">
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
}
