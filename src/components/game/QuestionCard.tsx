
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { TriviaQuestion } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Star, Clock, SkipForward } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useI18n } from '@/hooks/use-i18n';

interface QuestionCardProps {
  question: TriviaQuestion;
  onAnswer: (isCorrect: boolean) => void;
  questionNumber: number;
  totalQuestions: number;
  onUse5050: () => void;
  is5050Used: boolean;
  onUseTimeBoost: () => void;
  isTimeBoostUsed: boolean;
}

export function QuestionCard({ 
    question, 
    onAnswer,
    questionNumber, 
    totalQuestions, 
    onUse5050, 
    is5050Used,
    onUseTimeBoost,
    isTimeBoostUsed,
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const { t } = useI18n();

  const handleOptionClick = (option: string) => {
    if (isAnswered || option === '') return;
    setIsAnswered(true);
    setSelectedOption(option);
    const isCorrect = option === question.answer;
    onAnswer(isCorrect);
  };
  
  const getButtonClass = (option: string) => {
    if (!isAnswered) return 'bg-secondary hover:bg-secondary/80';
    if (option === question.answer) return 'bg-green-500 hover:bg-green-500/90 animate-pulse text-white';
    if (option === selectedOption) return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
    return 'bg-secondary opacity-50';
  };

  return (
    <motion.div
      key={questionNumber}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
    >
      <Card className="w-full max-w-2xl mx-auto border-primary shadow-lg shadow-primary/10">
        <CardHeader>
          <p className="text-sm text-muted-foreground">{t('game.question.header', { questionNumber, totalQuestions })}</p>
          <CardTitle className="font-headline text-2xl leading-tight">{question.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((option, index) => {
                if(option === '') return <div key={index} />; // Render empty div for hidden options
                return (
                    <motion.div
                        key={option + index}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            onClick={() => handleOptionClick(option)}
                            disabled={isAnswered}
                            className={cn('h-auto w-full py-4 text-base whitespace-normal justify-start', getButtonClass(option))}
                        >
                            <span className="mr-4 font-bold text-accent">{String.fromCharCode(65 + index)}</span>
                            <span>{option}</span>
                        </Button>
                    </motion.div>
                )
            })}
          </div>
        </CardContent>
        <CardFooter className="justify-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={onUse5050} disabled={is5050Used || isAnswered} variant="outline" size="icon">
                      <Star className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('game.question.powerup_5050')}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={onUseTimeBoost} disabled={isTimeBoostUsed || isAnswered} variant="outline" size="icon">
                      <Clock className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('game.question.powerup_time')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
