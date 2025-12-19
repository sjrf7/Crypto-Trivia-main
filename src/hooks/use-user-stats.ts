
'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlayerStats } from '@/lib/types';
import { ACHIEVEMENTS } from '@/lib/mock-data';
import { useToast } from './use-toast';
import { useI18n } from './use-i18n';
import { useNotifications } from './use-notifications';

const XP_PER_LEVEL = 1000;

const getInitialStats = (): PlayerStats => ({
  totalScore: 0,
  gamesPlayed: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  accuracy: '0%',
  topRank: null,
  level: 1,
  xp: 0,
  unlockedAchievements: [],
  // Internal tracking, not for display
  _consecutiveCorrectAnswers: 0,
  _aiGamesPlayed: 0,
  _powerupsUsed: 0,
  _challengesWon: 0,
});

export function useUserStats(fid: string | undefined) {
  const [stats, setStats] = useState<PlayerStats>(getInitialStats());
  const storageKey = `user_stats_${fid}`;
  const { toast } = useToast();
  const { t } = useI18n();
  const { addNotification } = useNotifications();


  useEffect(() => {
    if (!fid) {
      setStats(getInitialStats());
      return;
    }

    try {
      const item = window.localStorage.getItem(storageKey);
      if (item) {
        const parsedStats = JSON.parse(item);
        if (typeof parsedStats.totalScore === 'number') {
           setStats({ ...getInitialStats(), ...parsedStats });
        } else {
           setStats(getInitialStats());
        }
      } else {
        setStats(getInitialStats());
      }
    } catch (error) {
      console.error("Failed to read user stats from localStorage", error);
      setStats(getInitialStats());
    }
  }, [fid, storageKey]);

  const addGameResult = useCallback((gameResult: {
    score: number;
    questionsAnswered: number;
    correctAnswers: number;
    isAiGame: boolean;
    consecutiveCorrect: number; // Max consecutive answers in that game
    powerupsUsed: number;
    wonChallenge: boolean;
  }) => {
    if (!fid) return;

    setStats(prevStats => {
      const newGamesPlayed = prevStats.gamesPlayed + 1;
      const newTotalScore = prevStats.totalScore + gameResult.score;
      const newQuestionsAnswered = prevStats.questionsAnswered + gameResult.questionsAnswered;
      const newCorrectAnswers = prevStats.correctAnswers + gameResult.correctAnswers;
      const newAccuracy = newQuestionsAnswered > 0
        ? ((newCorrectAnswers / newQuestionsAnswered) * 100).toFixed(2) + '%'
        : '0%';
      
      const newConsecutive = Math.max(prevStats._consecutiveCorrectAnswers || 0, gameResult.consecutiveCorrect);
      const newAiGamesPlayed = (prevStats._aiGamesPlayed || 0) + (gameResult.isAiGame ? 1 : 0);
      const newPowerupsUsed = (prevStats._powerupsUsed || 0) + gameResult.powerupsUsed;
      const newChallengesWon = (prevStats._challengesWon || 0) + (gameResult.wonChallenge ? 1 : 0);

      // XP and Level Calculation
      let newXp = prevStats.xp + gameResult.score;
      let newLevel = prevStats.level;
      let leveledUp = false;
      while (newXp >= XP_PER_LEVEL) {
        newXp -= XP_PER_LEVEL;
        newLevel += 1;
        leveledUp = true;
      }
      if(leveledUp) {
         setTimeout(() => {
            const title = t('notifications.level_up.title');
            const description = t('notifications.level_up.description', { level: newLevel });
            toast({ title, description });
            addNotification({ type: 'achievement', title, description });
        }, 500); // Delay to allow summary screen to render first
      }


      // Check for new achievements
      const newlyUnlocked = new Set(prevStats.unlockedAchievements);

      const checkAndAdd = (id: string, condition: boolean) => {
        if (condition && !prevStats.unlockedAchievements.includes(id)) {
            newlyUnlocked.add(id);
        }
      }
      
      checkAndAdd('first-game', newGamesPlayed >= 1);
      checkAndAdd('novice-quizzer', newCorrectAnswers >= 50);
      checkAndAdd('crypto-enthusiast', newTotalScore >= 5000);
      checkAndAdd('quiz-marathon', newGamesPlayed >= 25);
      checkAndAdd('ai-pioneer', newAiGamesPlayed >= 1);
      checkAndAdd('power-up-user', newPowerupsUsed >= 1);
      checkAndAdd('duelist', newChallengesWon >= 1);
      checkAndAdd('hot-streak', newConsecutive >= 10);
      checkAndAdd('quiz-legend', newLevel >= 20);

      // Check game-specific ones
      if(gameResult.questionsAnswered > 0) {
        const gameAccuracy = (gameResult.correctAnswers / gameResult.questionsAnswered);
        checkAndAdd('brainiac', gameAccuracy >= 0.9);
        checkAndAdd('near-perfect', gameAccuracy >= 0.95);
      }
      
      // Notify about newly unlocked achievements
      if (newlyUnlocked.size > prevStats.unlockedAchievements.length) {
        const newAchievementIds = [...newlyUnlocked].filter(id => !prevStats.unlockedAchievements.includes(id));
        newAchievementIds.forEach(id => {
            const achievement = ACHIEVEMENTS.find(a => a.id === id);
            if (achievement) {
                 const title = t('achievement_unlocked.title');
                 const description = t('achievement_unlocked.description', { achievement: t(`achievements.items.${id}.name`) });
                 toast({ title, description });
                 addNotification({ type: 'achievement', title, description });
            }
        });
      }

      const newStats: PlayerStats = {
        ...prevStats,
        gamesPlayed: newGamesPlayed,
        totalScore: newTotalScore,
        questionsAnswered: newQuestionsAnswered,
        correctAnswers: newCorrectAnswers,
        accuracy: newAccuracy,
        level: newLevel,
        xp: newXp,
        unlockedAchievements: Array.from(newlyUnlocked),
        _consecutiveCorrectAnswers: newConsecutive,
        _aiGamesPlayed: newAiGamesPlayed,
        _powerupsUsed: newPowerupsUsed,
        _challengesWon: newChallengesWon,
      };

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(newStats));
      } catch (error) {
        console.error("Failed to save user stats to localStorage", error);
      }

      return newStats;
    });
  }, [fid, storageKey, toast, t, addNotification]);
  
  const updateRank = useCallback((rank: number) => {
    if (!fid) return;
    setStats(prevStats => {
      const newTopRank = prevStats.topRank === null ? rank : Math.min(prevStats.topRank, rank);
       if (newTopRank !== prevStats.topRank) {
          const newStats = { ...prevStats, topRank: newTopRank };
           try {
                window.localStorage.setItem(storageKey, JSON.stringify(newStats));
            } catch (error) {
                console.error("Failed to save user stats to localStorage", error);
            }
          return newStats;
       }
       return prevStats;
    });
  }, [fid, storageKey]);


  const checkTopPlayerAchievement = useCallback(() => {
    if (!fid) return;
    setStats(prevStats => {
        if(prevStats.topRank === 1 && !prevStats.unlockedAchievements.includes('top-player')) {
            const title = t('achievement_unlocked.title');
            const description = t('achievement_unlocked.description', { achievement: t(`achievements.items.top-player.name`) });
            const newStats = {
                ...prevStats,
                unlockedAchievements: [...prevStats.unlockedAchievements, 'top-player']
            }
            toast({ title, description });
            addNotification({ type: 'achievement', title, description });
            try {
                window.localStorage.setItem(storageKey, JSON.stringify(newStats));
            } catch (error) {
                console.error("Failed to save user stats to localStorage", error);
            }
            return newStats;
        }
        return prevStats;
    })
  }, [fid, storageKey, t, toast, addNotification]);


  return { stats, addGameResult, updateRank, checkTopPlayerAchievement };
}
