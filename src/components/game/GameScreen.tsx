
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { TriviaQuestion } from '@/lib/types';
import { QuestionCard } from './QuestionCard';
import { Progress } from '@/components/ui/progress';
import { Timer, Trophy, Target, Hourglass, Loader, Swords, Wand2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { AnimatedScore } from './AnimatedScore';
import { useI18n } from '@/hooks/use-i18n';

const GAME_TIME_SECONDS = 120;

interface GameResult {
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  consecutiveCorrect: number;
  powerupsUsed: number;
  wonChallenge: boolean;
}

interface GameScreenProps {
  questions: TriviaQuestion[];
  onGameEnd: (result: GameResult) => void;
  scoreToBeat?: number;
  isChallenge?: boolean;
  isAiGame?: boolean;
  aiGameTopic?: string;
}

export function GameScreen({ 
    questions, 
    onGameEnd, 
    scoreToBeat, 
    isChallenge = false,
    isAiGame = false,
    aiGameTopic = ''
}: GameScreenProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_SECONDS);
  const [shuffledQuestions, setShuffledQuestions] = useState<TriviaQuestion[]>([]);
  const { t } = useI18n();

  // Stat tracking for achievements
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [maxConsecutive, setMaxConsecutive] = useState(0);
  const [powerupsUsedCount, setPowerupsUsedCount] = useState(0);
  
  // Power-up states
  const [is5050Used, setIs5050Used] = useState(false);
  const [isTimeBoostUsed, setIsTimeBoostUsed] = useState(false);

  // Sound Refs
  const correctSoundRef = useRef<HTMLAudioElement>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement>(null);
  const timerSoundRef = useRef<HTMLAudioElement>(null);
  const powerupSoundRef = useRef<HTMLAudioElement>(null);

  const endGame = useCallback(() => {
    const finalResult: GameResult = {
        score,
        questionsAnswered: currentQuestionIndex,
        correctAnswers,
        consecutiveCorrect: Math.max(maxConsecutive, consecutiveCorrect),
        powerupsUsed: powerupsUsedCount,
        wonChallenge: isChallenge && scoreToBeat !== undefined && score > scoreToBeat
    };
    onGameEnd(finalResult);
  }, [score, currentQuestionIndex, correctAnswers, maxConsecutive, consecutiveCorrect, powerupsUsedCount, isChallenge, scoreToBeat, onGameEnd]);


  useEffect(() => {
    if (questions && questions.length > 0) {
      // Always shuffle the options for every question to prevent cheating in challenges
      const shuffleOptions = (questionsToShuffle: TriviaQuestion[]) => {
        return questionsToShuffle
          .filter(q => q && q.options)
          .map(q => ({
            ...q,
            options: [...q.options].sort(() => Math.random() - 0.5)
          }));
      };
      
      const optionsShuffled = shuffleOptions(questions);

      // Only shuffle the order of questions if it's NOT a challenge or AI game
      if (isChallenge || isAiGame) {
        setShuffledQuestions(optionsShuffled);
      } else {
        setShuffledQuestions([...optionsShuffled].sort(() => Math.random() - 0.5));
      }
    } else {
        setShuffledQuestions([]);
    }
  }, [questions, isChallenge, isAiGame]);


  useEffect(() => {
    if (shuffledQuestions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        if (prevTime === 11) { // Play sound at 10 seconds left
            timerSoundRef.current?.play().catch(console.error);
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [endGame, shuffledQuestions.length]);


  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      const points = 100;
      setScore((prevScore) => prevScore + points);
      setCorrectAnswers((prev) => prev + 1);
      setConsecutiveCorrect(prev => prev + 1);
      correctSoundRef.current?.play().catch(console.error);
    } else {
      setMaxConsecutive(prev => Math.max(prev, consecutiveCorrect));
      setConsecutiveCorrect(0);
      incorrectSoundRef.current?.play().catch(console.error);
    }
    
    // Delay before moving to the next question to show feedback
    setTimeout(() => {
      const isLastQuestion = currentQuestionIndex >= shuffledQuestions.length - 1;
      const finalScore = score + (isCorrect ? 100 : 0);
      const finalCorrect = correctAnswers + (isCorrect ? 1 : 0);
      const finalConsecutive = isCorrect ? consecutiveCorrect + 1 : consecutiveCorrect;

      if (!isLastQuestion) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      } else {
        const finalResult: GameResult = {
            score: finalScore,
            questionsAnswered: currentQuestionIndex + 1,
            correctAnswers: finalCorrect,
            consecutiveCorrect: Math.max(maxConsecutive, finalConsecutive),
            powerupsUsed: powerupsUsedCount,
            wonChallenge: isChallenge && scoreToBeat !== undefined && finalScore > scoreToBeat
        };
        onGameEnd(finalResult);
      }
    }, 1500);
  };
  
  const handleUse5050 = () => {
    if (is5050Used) return;
    powerupSoundRef.current?.play().catch(console.error);
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const correctAnswer = currentQuestion.answer;
    const incorrectOptions = currentQuestion.options.filter(opt => opt !== correctAnswer);
    if (incorrectOptions.length < 2) return;
    
    const optionsToKeep = [correctAnswer, incorrectOptions[0]];
    
    const newQuestions = [...shuffledQuestions];
    newQuestions[currentQuestionIndex] = {
        ...currentQuestion,
        options: currentQuestion.options.map(opt => optionsToKeep.includes(opt) ? opt : ''),
        hiddenOptions: currentQuestion.options.filter(opt => !optionsToKeep.includes(opt))
    };
    
    setShuffledQuestions(newQuestions);
    setIs5050Used(true);
    setPowerupsUsedCount(prev => prev + 1);
  };
  
  const handleUseTimeBoost = () => {
      if(isTimeBoostUsed) return;
      powerupSoundRef.current?.play().catch(console.error);
      setTimeLeft(prev => prev + 15);
      setIsTimeBoostUsed(true);
      setPowerupsUsedCount(prev => prev + 1);
  }

  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex) / totalQuestions) * 100;
  
  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <Loader className="animate-spin h-8 w-8 text-primary" />
            <p className="mt-4 text-muted-foreground">{t('game.screen.loading')}</p>
        </div>
    )
  }

  const headerContent = () => {
    if (isChallenge) {
        return (
            <motion.div 
                className="text-center bg-card p-3 rounded-lg border-2 border-primary"
                initial={{y: -20, opacity: 0}}
                animate={{y: 0, opacity: 1}}
                exit={{y: -20, opacity: 0}}
            >
                <h3 className="font-headline text-lg flex items-center justify-center gap-2"><Swords className="h-5 w-5 text-primary"/>{t('game.screen.challenge_mode.title')}</h3>
                <p className="text-muted-foreground">{t('game.screen.challenge_mode.description')} <span className="font-bold text-accent">{scoreToBeat}</span>!</p>
            </motion.div>
        );
    }
    if (isAiGame) {
        return (
            <motion.div 
                className="text-center bg-card p-3 rounded-lg border-2 border-accent"
                initial={{y: -20, opacity: 0}}
                animate={{y: 0, opacity: 1}}
                exit={{y: -20, opacity: 0}}
            >
                <h3 className="font-headline text-lg flex items-center justify-center gap-2"><Wand2 className="h-5 w-5 text-accent"/>{t('game.screen.ai_mode.title')}</h3>
                <p className="text-muted-foreground">{t('game.screen.ai_mode.description')} <span className="font-bold text-accent">{aiGameTopic}</span></p>
            </motion.div>
        );
    }
    return null;
  }

  return (
    <motion.div 
        className="flex flex-col gap-8 w-full"
        key="playing"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
        {/* Hidden audio elements */}
        <audio ref={correctSoundRef} src="/sounds/correct.mp3" preload="auto" />
        <audio ref={incorrectSoundRef} src="/sounds/incorrect.mp3" preload="auto" />
        <audio ref={timerSoundRef} src="/sounds/timer.mp3" preload="auto" />
        <audio ref={powerupSoundRef} src="/sounds/powerup.mp3" preload="auto" />

        <AnimatePresence>
            {headerContent()}
        </AnimatePresence>
      <div className="grid grid-cols-3 gap-4 text-center">
        <motion.div 
            className="flex items-center justify-center gap-2 bg-card p-4 rounded-lg"
            initial={{y: -20, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{delay: 0.1}}
        >
          <Trophy className="h-6 w-6 text-primary drop-shadow-glow-primary" />
          <span className="text-xl font-bold">
            <AnimatedScore score={score} />
          </span>
        </motion.div>
        <motion.div 
            className="flex items-center justify-center gap-2 bg-card p-4 rounded-lg"
            initial={{y: -20, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{delay: 0.2}}
        >
           <Target className="h-6 w-6 text-accent drop-shadow-glow-accent" />
           <span className="text-xl font-bold">{currentQuestionIndex + 1} / {totalQuestions}</span>
        </motion.div>
        <motion.div 
            className="flex items-center justify-center gap-2 bg-card p-4 rounded-lg"
            initial={{y: -20, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{delay: 0.3}}
        >
          <Hourglass className="h-6 w-6 text-destructive" />
          <span className="text-xl font-bold">{timeLeft}s</span>
        </motion.div>
      </div>
      
      <div>
        <Progress value={progress} className="w-full" />
      </div>

      <AnimatePresence mode="wait">
        <QuestionCard
          key={currentQuestionIndex}
          question={currentQuestion}
          onAnswer={handleAnswer}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
          onUse5050={handleUse5050}
          is5050Used={is5050Used}
          onUseTimeBoost={handleUseTimeBoost}
          isTimeBoostUsed={isTimeBoostUsed}
        />
      </AnimatePresence>
    </motion.div>
  );
}
