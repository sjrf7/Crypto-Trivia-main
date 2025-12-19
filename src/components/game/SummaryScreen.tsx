
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, RotateCw, BarChart2, Share2, ClipboardCheck, User, Trophy, Swords, Loader, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { TriviaQuestion } from '@/lib/types';
import {
  AlertDialog,
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
import { useUserStats } from '@/hooks/use-user-stats';
import { Textarea } from '../ui/textarea';
import { useNotifications } from '@/hooks/use-notifications';
import { AITriviaGame } from '@/lib/types/ai';
import { cn } from '@/lib/utils';
import { useFarcasterIdentity } from '@/hooks/use-farcaster-identity';

interface SummaryScreenProps {
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  onRestart: () => void;
  questions: TriviaQuestion[] | AITriviaGame['questions'];
  isAiGame?: boolean;
  aiGameTopic?: string;
  challengeId?: string;
  consecutiveCorrect: number;
  powerupsUsed: number;
  wonChallenge: boolean;
  isChallenge: boolean;
  scoreToBeat?: number;
  challenger?: string;
}

export function SummaryScreen({ 
  score, 
  questionsAnswered, 
  correctAnswers,
  onRestart, 
  questions,
  isAiGame = false,
  aiGameTopic = '',
  challengeId,
  consecutiveCorrect,
  powerupsUsed,
  wonChallenge,
  isChallenge,
  scoreToBeat,
  challenger,
}: SummaryScreenProps) {
    const { t } = useI18n();
    const { toast } = useToast();
    const [challengeUrl, setChallengeUrl] = useState('');
    const [wager, setWager] = useState('');
    const [challengeMessage, setChallengeMessage] = useState('');
    const { farcasterProfile, authenticated } = useFarcasterIdentity();
    const { addGameResult } = useUserStats(farcasterProfile?.fid?.toString());
    const [isGenerating, setIsGenerating] = useState(false);
    const { addNotification } = useNotifications();
    const summarySoundRef = useRef<HTMLAudioElement>(null);


    useEffect(() => {
      summarySoundRef.current?.play().catch(console.error);

      if (authenticated && addGameResult) {
        addGameResult({
          score,
          questionsAnswered,
          correctAnswers,
          isAiGame,
          consecutiveCorrect,
          powerupsUsed,
          wonChallenge,
        });
      }
      
       if (isChallenge && farcasterProfile) {
            const title = t(wonChallenge ? 'notifications.challenge_won.title' : 'notifications.challenge_lost.title');
            const description = t(wonChallenge ? 'notifications.challenge_won.description' : 'notifications.challenge_lost.description', {
                challenger: challenger || 'a friend'
            });
            addNotification({ type: 'challenge', title, description });
        }
      
    }, []);
    
    const generateChallenge = useCallback(async () => {
      setIsGenerating(true);
      setChallengeUrl('');

      try {
        if (!authenticated || !farcasterProfile) {
            toast({
                variant: "destructive",
                title: t('summary.challenge.not_logged_in.title'),
                description: t('summary.challenge.not_logged_in.description'),
            });
            return;
        }

        const challengerName = farcasterProfile?.display_name || farcasterProfile?.username || 'A friend';
        let url = '';

        if (isAiGame) {
           const aiGame: AITriviaGame = {
             topic: aiGameTopic,
             questions: questions as AITriviaGame['questions'],
           }
            const res = await fetch('/api/challenge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    game: aiGame,
                    scoreToBeat: score,
                    wager: Number(wager) || 0,
                    challenger: challengerName
                })
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create challenge link.');
            }
            const { challengeId } = await res.json();
            url = `${window.location.origin}/challenge/ai/${challengeId}`;
        } else {
          const questionIndices = (questions as TriviaQuestion[]).map(q => q.originalIndex).filter(i => i !== undefined).join(',');
          if (!questionIndices) throw new Error('Could not generate challenge: No original indices found.');
          
          const dataSegment = `classic|${questionIndices}|${score}|${wager || 0}|${challengerName}|${encodeURIComponent(challengeMessage)}`;
          const encodedData = btoa(dataSegment).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
          url = `${window.location.origin}/challenge/classic/${encodedData}`;
        }
        
        setChallengeUrl(url);

      } catch (error) {
          console.error("Error creating challenge:", error);
          toast({
              variant: "destructive",
              title: "Error creating challenge",
              description: error instanceof Error ? error.message : "An unknown error occurred.",
          });
      } finally {
        setIsGenerating(false);
      }
    }, [questions, score, wager, challengeMessage, farcasterProfile, authenticated, isAiGame, aiGameTopic, toast, t]);

    const copyToClipboard = () => {
        if (!challengeUrl) return;
        navigator.clipboard.writeText(challengeUrl);
        toast({
            title: t('summary.toast.copied.title'),
            description: t('summary.toast.copied.description'),
        });
    }

    const getSummaryTitle = () => {
      if (isChallenge) {
        if (wonChallenge) return t('summary.challenge_win_title');
        if (score === scoreToBeat) return t('summary.challenge_tie_title');
        return t('summary.challenge_loss_title');
      }
      return t('summary.title');
    }

    const getSummaryDescription = () => {
        if (isChallenge) {
          return t('summary.challenge_description');
        }
        return isAiGame 
            ? t('summary.ai_description', { topic: aiGameTopic })
            : t('summary.description');
    }
    
    const getSummaryIcon = () => {
        if (isChallenge) {
            return wonChallenge ? <Trophy className="h-10 w-10 text-primary drop-shadow-glow-primary" /> : <Swords className="h-10 w-10 text-muted-foreground" />
        }
        return <Award className="h-10 w-10 text-primary drop-shadow-glow-primary" />;
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
      <audio ref={summarySoundRef} src="/sounds/summary.mp3" preload="auto" />
      <Card className="w-full max-w-md text-center shadow-2xl">
        <CardHeader>
          <motion.div 
            className="mx-auto bg-primary/10 p-4 rounded-full mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 10 }}
          >
             {getSummaryIcon()}
          </motion.div>
          <CardTitle className="font-headline text-4xl">{getSummaryTitle()}</CardTitle>
          <CardDescription>{getSummaryDescription()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {isChallenge && scoreToBeat !== undefined ? (
              <div className="grid grid-cols-2 gap-4 items-center bg-secondary p-4 rounded-lg">
                <div className="text-center">
                  <Label>{farcasterProfile?.display_name || t('summary.your_score')}</Label>
                  <div className="text-4xl font-bold text-primary">
                    <AnimatedScore score={score} />
                  </div>
                </div>
                 <div className="text-center">
                  <Label>{challenger}</Label>
                  <div className="text-4xl font-bold text-muted-foreground">
                    <AnimatedScore score={scoreToBeat} />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="text-6xl font-bold text-primary">
                    <AnimatedScore score={score} />
                </div>
                <p className="text-muted-foreground">{t('summary.final_score')}</p>
              </>
            )}
            <p className="text-lg pt-2">
                {t('summary.questions_answered', { count: questionsAnswered, total: questions.length })}
            </p>
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <motion.div 
                className="flex flex-col sm:flex-row justify-center gap-4 w-full"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <Button onClick={onRestart} variant="outline" className="w-full sm:w-auto">
                    <RotateCw className="mr-2 h-4 w-4" />
                    {t('summary.play_again_button')}
                </Button>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/leaderboard">
                        <BarChart2 className="mr-2 h-4 w-4" />
                        {t('summary.leaderboard_button')}
                    </Link>
                </Button>
            </motion.div>
            
            {!isChallenge && (
                <motion.div 
                    className="w-full"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                <AlertDialog onOpenChange={(open) => {
                    if (open) {
                        setIsGenerating(false);
                        setChallengeUrl('');
                        generateChallenge();
                    }
                }}>
                    <AlertDialogTrigger asChild>
                    <Button variant="secondary" className="w-full" disabled={!authenticated}>
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
                        {!isAiGame && (
                            <div className="space-y-2">
                                <Label htmlFor="challenge-message">{t('summary.challenge.message.label')}</Label>
                                <Textarea
                                    id="challenge-message"
                                    placeholder={t('summary.challenge.message.placeholder')}
                                    value={challengeMessage}
                                    onChange={(e) => setChallengeMessage(e.target.value)}
                                    disabled={isGenerating}
                                    maxLength={100}
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="wager">{t('summary.challenge.wager.label')}</Label>
                            <Input 
                                id="wager"
                                type="number"
                                placeholder={t('summary.challenge.wager.placeholder')}
                                value={wager}
                                onChange={(e) => setWager(e.target.value)}
                                disabled={isGenerating}
                            />
                        </div>

                         <Button onClick={generateChallenge} disabled={isGenerating} className="w-full">
                            {isGenerating ? <Loader className="animate-spin" /> : <><RefreshCw className="mr-2 h-4 w-4" /> {t('summary.challenge.update_button')}</>}
                        </Button>
                        
                        <div className="space-y-2">
                            <Label>{t('summary.challenge.link.label')}</Label>
                            <div className="flex items-center space-x-2">
                                <Input value={challengeUrl || (isGenerating ? t('summary.challenge.link.generating') : '')} readOnly />
                                <Button onClick={copyToClipboard} size="icon" disabled={!challengeUrl || isGenerating}>
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
            )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
