
'use client';

import { useEffect, useState, useMemo } from 'react';
import { TriviaQuestion } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';

import { GameScreen } from './GameScreen';
import { SummaryScreen } from './SummaryScreen';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2 } from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';
import { WagerCard } from './WagerCard';
import { AITriviaGame } from '@/lib/types/ai';
import { useFarcasterIdentity } from '@/hooks/use-farcaster-identity';
import { useAccount } from 'wagmi';

type GameStatus = 'setup' | 'wager' | 'playing' | 'summary';

interface GameClientProps {
    challengeQuestions?: TriviaQuestion[] | AITriviaGame['questions'];
    scoreToBeat?: number;
    wager?: number;
    challenger?: string;
    challengeMessage?: string;
    onRestart?: () => void;
    isAiGame?: boolean;
    aiGameTopic?: string;
    challengeId?: string;
}

interface GameResult {
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  consecutiveCorrect: number;
  powerupsUsed: number;
  wonChallenge: boolean;
}

const screenVariants = {
  initial: { opacity: 0, scale: 0.95 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 0.95 },
};

const screenTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export function GameClient({ 
    challengeQuestions, 
    scoreToBeat, 
    wager, 
    challenger,
    challengeMessage, 
    onRestart,
    isAiGame = false,
    aiGameTopic = '',
    challengeId,
}: GameClientProps) {
  const [gameStatus, setGameStatus] = useState<GameStatus>('setup');
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [isChallenge, setIsChallenge] = useState(false);
  const { t } = useI18n();
  const { authenticated } = useFarcasterIdentity();
  const { isConnected } = useAccount();

  const classicQuestions = useMemo(() => t('classic_questions', undefined, { returnObjects: true }) as TriviaQuestion[], [t]);

  useEffect(() => {
    if (challengeQuestions && challengeQuestions.length > 0) {
      setIsChallenge(!!scoreToBeat);
      setQuestions(challengeQuestions.map((q, i) => ({...q, originalIndex: q.originalIndex ?? i})));
       if (challenger) {
          setGameStatus('wager');
      } else {
          setGameStatus('playing');
      }
    } 
    else if (!isAiGame) {
      handleStartClassic();
    }
  }, [challengeQuestions, scoreToBeat, wager, challenger, isAiGame]);


  useEffect(() => {
    if (gameStatus === 'wager' && authenticated && isConnected) {
      handleWagerAccept();
    }
  }, [authenticated, isConnected, gameStatus]);


  const handleStartClassic = () => {
    const shuffled = [...classicQuestions]
      .map((q, i) => ({ ...q, originalIndex: i }))
      .sort(() => 0.5 - Math.random());
    
    const selectedQuestions = shuffled.slice(0, 10);

    setQuestions(selectedQuestions);
    setGameStatus('playing');
    setIsChallenge(false);
  };

  const handleGameEnd = (result: GameResult) => {
    setGameResult(result);
    setGameStatus('summary');
  };

  const handleRestart = () => {
    if (onRestart) {
        onRestart();
    } else {
        setGameStatus('setup');
        setGameResult(null);
        setIsChallenge(false);
        setQuestions([]);
    }
  };
  
  const handleWagerAccept = () => {
    if (authenticated && isConnected) {
      console.log('Wager accepted. Starting game.');
      setGameStatus('playing');
    } else {
      console.log('User must sign in and connect wallet to accept wager.');
    }
  }

  const renderWelcomeScreen = () => (
    <motion.div 
      className="flex flex-col items-center justify-center h-full text-center"
      key="welcome"
      variants={screenVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={screenTransition}
    >
        <motion.div 
          className="mx-auto bg-primary/10 p-4 rounded-full mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 10 }}
        >
          <Gamepad2 className="h-12 w-12 text-primary drop-shadow-glow-primary" />
        </motion.div>
        <motion.h2 
          className="text-3xl font-headline mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {t('game.client.title')}
        </motion.h2>
        <motion.p 
          className="text-muted-foreground max-w-md mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {t('game.client.description')}
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button onClick={handleStartClassic} size="lg"><Gamepad2/>{t('game.client.start_classic_button')}</Button>
        </motion.div>
    </motion.div>
  );

  const renderGameContent = () => {
    switch (gameStatus) {
      case 'setup':
        return renderWelcomeScreen();
      case 'wager':
        return <WagerCard 
                    wager={wager!} 
                    challenger={challenger!}
                    message={challengeMessage} 
                    onAccept={handleWagerAccept}
                    onDecline={handleRestart}
                />;
      case 'playing':
        return <GameScreen 
                  questions={questions} 
                  onGameEnd={handleGameEnd} 
                  scoreToBeat={scoreToBeat} 
                  isChallenge={isChallenge}
                  isAiGame={isAiGame}
                  aiGameTopic={aiGameTopic}
               />;
      case 'summary':
        return <SummaryScreen 
                  {...gameResult!}
                  scoreToBeat={scoreToBeat}
                  challenger={challenger}
                  onRestart={handleRestart} 
                  questions={questions} 
                  isAiGame={isAiGame}
                  aiGameTopic={aiGameTopic}
                  challengeId={challengeId}
                  isChallenge={isChallenge}
               />;
      default:
        return renderWelcomeScreen();
    }
  };

  return (
    <Card className="h-full min-h-[600px] flex flex-col">
      <CardContent className="h-full flex flex-col justify-center flex-grow">
        <AnimatePresence mode="wait">
          {renderGameContent()}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
