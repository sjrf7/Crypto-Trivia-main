
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, RotateCw, BarChart2, Share2, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import { TriviaQuestion } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '../ui/label';
import { motion } from 'framer-motion';
import { AnimatedScore } from './AnimatedScore';
import { useI18n } from '@/hooks/use-i18n';
import { useUser } from '@/hooks/use-user';

interface SummaryScreenProps {
  score: number;
  questionsAnswered: number;
  onRestart: () => void;
  questions: TriviaQuestion[];
}

export function SummaryScreen({ score, questionsAnswered, onRestart, questions }: SummaryScreenProps) {
    const { t } = useI18n();
    const { toast } = useToast();
    const [challengeUrl, setChallengeUrl] = useState('');
    const [wager, setWager] = useState('');
    const { user } = useUser();
    
    const generateChallenge = () => {
        const challenger = user?.displayName || 'A friend';
        const questionIndices = questions.map(q => q.originalIndex).join(',');
        const data = `${questionIndices}|${score}|${wager}|${challenger}`;
        const encodedData = btoa(data); 
        const url = `${window.location.origin}/challenge/${encodedData}`;
        setChallengeUrl(url);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(challengeUrl);
        toast({
            title: t('summary.toast.copied.title'),
            description: t('summary.toast.copied.description'),
        });
    }

  return (
    <motion.div 
        className="flex justify-center items-center h-full"
        key="summary"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Card className="w-full max-w-md text-center shadow-2xl">
        <CardHeader>
          <motion.div 
            className="mx-auto bg-primary/10 p-4 rounded-full mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 10 }}
          >
             <Award className="h-10 w-10 text-primary drop-shadow-glow-primary" />
          </motion.div>
          <CardTitle className="font-headline text-4xl">{t('summary.title')}</CardTitle>
          <CardDescription>{t('summary.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="text-6xl font-bold text-primary">
                <AnimatedScore score={score} />
            </div>
            <p className="text-muted-foreground">{t('summary.final_score')}</p>
            <p className="text-lg">
                {t('summary.questions_answered', { count: questionsAnswered })}
            </p>
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <motion.div 
                className="flex justify-center gap-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <Button onClick={onRestart} variant="outline">
                    <RotateCw className="mr-2 h-4 w-4" />
                    {t('summary.play_again_button')}
                </Button>
                <Button asChild>
                    <Link href="/leaderboard">
                        <BarChart2 className="mr-2 h-4 w-4" />
                        {t('summary.leaderboard_button')}
                    </Link>
                </Button>
            </motion.div>
            <motion.div 
                className="w-full"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
              <AlertDialog onOpenChange={(open) => {
                  // Generate link when dialog opens
                  if (open) generateChallenge();
              }}>
                <AlertDialogTrigger asChild>
                  <Button variant="secondary" className="w-full">
                      <Share2 className="mr-2 h-4 w-4" />
                      {t('summary.challenge.button')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('summary.challenge.title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('summary.challenge.description')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4 py-4">
                      <div className="space-y-2">
                          <Label htmlFor="wager">{t('summary.challenge.wager.label')}</Label>
                          <Input 
                              id="wager"
                              type="number"
                              placeholder={t('summary.challenge.wager.placeholder')}
                              value={wager}
                              onChange={(e) => {
                                  setWager(e.target.value);
                                  // Regenerate link on wager change
                                  setTimeout(generateChallenge, 100);
                              }}
                          />
                      </div>
                      <div className="space-y-2">
                          <Label>{t('summary.challenge.link.label')}</Label>
                          <div className="flex items-center space-x-2">
                              <Input value={challengeUrl} readOnly />
                              <Button onClick={copyToClipboard} size="icon">
                                  <ClipboardCheck className="h-4 w-4" />
                              </Button>
                          </div>
                      </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('summary.challenge.close_button')}</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
