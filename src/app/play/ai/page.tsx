
'use client';

import { useState } from 'react';
import { GameClient } from '@/components/game/GameClient';
import { GameSetup } from '@/components/game/GameSetup';
import { TriviaQuestion } from '@/lib/types';
import { AnimatePresence } from 'framer-motion';
import { AITriviaGame } from '@/lib/types/ai';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/use-i18n';

export default function AiPlayPage() {
  const [game, setGame] = useState<AITriviaGame | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { language, t } = useI18n();

  const handleGameStart = async (topic: string, numQuestions: number, difficulty: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-trivia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, numQuestions, difficulty, language }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate trivia game.');
      }
      
      const aiGame = await response.json();
      setGame(aiGame);
    } catch (e: any) {
      console.error(e);
      const errorMessage = e.message || 'An unexpected error occurred while generating the game.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: t('ai_page.error_toast.title'),
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setGame(null);
    setError(null);
    setGameKey(prev => prev + 1);
  };

  const formattedQuestions: TriviaQuestion[] | undefined = game?.questions.map((q, i) => ({ ...q, originalIndex: i }));

  if (error && !game) {
    return (
        <div className="flex justify-center items-center h-full">
            <Alert variant="destructive" className="max-w-lg">
                <Terminal className="h-4 w-4" />
                <AlertTitle>{t('ai_page.error_alert.title')}</AlertTitle>
                <AlertDescription>
                   {error}
                </AlertDescription>
            </Alert>
        </div>
    )
  }

  return (
    <div className="flex justify-center items-center h-full">
      <AnimatePresence mode="wait">
        {!game ? (
          <GameSetup key="setup" onGameStart={handleGameStart} isLoading={isLoading} />
        ) : (
          <div className="w-full lg:w-4/5">
             <GameClient
                key={gameKey}
                challengeQuestions={formattedQuestions}
                onRestart={handleRestart}
                isAiGame={true}
                aiGameTopic={game.topic}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
