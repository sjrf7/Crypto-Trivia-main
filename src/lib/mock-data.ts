
import type { Player, LeaderboardEntry, TriviaQuestion, Achievement } from './types';
import { Award, BookOpen, BrainCircuit, Bot, Medal, Rocket, Sparkles, Star, TrendingUp, Trophy, Dumbbell, Zap } from 'lucide-react';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-game',
    name: 'First Game',
    description: 'Played your first game of trivia.',
    icon: Sparkles,
  },
  {
    id: 'novice-quizzer',
    name: 'Novice Quizzer',
    description: 'Answered 50 questions correctly.',
    icon: BookOpen,
  },
  {
    id: 'crypto-enthusiast',
    name: 'Crypto Enthusiast',
    description: 'Scored over 5,000 total points.',
    icon: TrendingUp,
  },
  {
    id: 'brainiac',
    name: 'Brainiac',
    description: 'Achieve 90% accuracy in a game.',
    icon: BrainCircuit,
  },
  {
    id: 'top-player',
    name: 'Top Player',
    description: 'Reached the #1 spot on the leaderboard.',
    icon: Award,
  },
  {
    id: 'hot-streak',
    name: 'Hot Streak',
    description: 'Answered 10 questions correctly in a row.',
    icon: Rocket,
  },
    {
    id: 'quiz-marathon',
    name: 'Quiz Marathon',
    description: 'Played 25 games.',
    icon: Dumbbell,
  },
  {
    id: 'duelist',
    name: 'Duelist',
    description: 'Won your first challenge against a friend.',
    icon: Trophy,
  },
    {
    id: 'ai-pioneer',
    name: 'AI Pioneer',
    description: 'Generated your first AI trivia game.',
    icon: Bot,
  },
    {
    id: 'power-up-user',
    name: 'Power Up!',
    description: 'Used a power-up for the first time.',
    icon: Zap,
  },
  {
    id: 'near-perfect',
    name: 'Near Perfect',
    description: 'Achieved 95% accuracy in a game.',
    icon: Star,
  },
  {
    id: 'quiz-legend',
    name: 'Quiz Legend',
    description: 'Reached level 20.',
    icon: Medal,
  },
];


export const PLAYERS: Player[] = [
  {
    id: 'vitalik',
    name: 'VitalikButerin',
    avatar: 'https://placehold.co/128x128/E8E8E8/4D4D4D?text=VB',
    stats: {
      totalScore: 9850,
      gamesPlayed: 15,
      questionsAnswered: 150,
      correctAnswers: 138,
      accuracy: '92.00%',
      topRank: 1,
      level: 12,
      xp: 450,
    },
    achievements: ['first-game', 'novice-quizzer', 'crypto-enthusiast', 'brainiac', 'top-player']
  },
  {
    id: 'satoshi',
    name: 'SatoshiNakamoto',
    avatar: 'https://placehold.co/128x128/E8E8E8/4D4D4D?text=SN',
    stats: {
      totalScore: 9500,
      gamesPlayed: 12,
      questionsAnswered: 120,
      correctAnswers: 114,
      accuracy: '95.00%',
      topRank: 2,
      level: 11,
      xp: 800,
    },
    achievements: ['first-game', 'novice-quizzer', 'crypto-enthusiast', 'brainiac']
  },
  {
    id: 'cz',
    name: 'CZ_Binance',
    avatar: 'https://placehold.co/128x128/E8E8E8/4D4D4D?text=CZ',
    stats: {
      totalScore: 8700,
      gamesPlayed: 20,
      questionsAnswered: 200,
      correctAnswers: 174,
      accuracy: '87.00%',
      topRank: 3,
      level: 10,
      xp: 200,
    },
    achievements: ['first-game', 'novice-quizzer', 'crypto-enthusiast']
  },
  {
    id: 'dwr',
    name: 'dwr.eth',
    avatar: 'https://placehold.co/128x128/E8E8E8/4D4D4D?text=DW',
    stats: {
      totalScore: 8200,
      gamesPlayed: 18,
      questionsAnswered: 180,
      correctAnswers: 160,
      accuracy: '88.89%',
      topRank: 4,
      level: 9,
      xp: 950,
    },
    achievements: ['first-game', 'novice-quizzer']
  },
  {
    id: 'cobie',
    name: 'Cobie',
    avatar: 'https://placehold.co/128x128/E8E8E8/4D4D4D?text=CO',
    stats: {
      totalScore: 7800,
      gamesPlayed: 25,
      questionsAnswered: 250,
      correctAnswers: 195,
      accuracy: '78.00%',
      topRank: 5,
      level: 9,
      xp: 100,
    },
    achievements: ['first-game']
  },
  {
    id: 'brian',
    name: 'brian_armstrong',
    avatar: 'https://placehold.co/128x128/E8E8E8/4D4D4D?text=BA',
    stats: {
      totalScore: 7500,
      gamesPlayed: 19,
      questionsAnswered: 190,
      correctAnswers: 165,
      accuracy: '86.84%',
      topRank: 6,
      level: 8,
      xp: 750,
    },
    achievements: ['first-game', 'novice-quizzer']
  },
  {
    id: 'gavin',
    name: 'GavinWood',
    avatar: 'https://placehold.co/128x128/E8E8E8/4D4D4D?text=GW',
    stats: {
      totalScore: 7200,
      gamesPlayed: 16,
      questionsAnswered: 160,
      correctAnswers: 140,
      accuracy: '87.50%',
      topRank: 7,
      level: 8,
      xp: 200,
    },
    achievements: ['first-game', 'novice-quizzer']
  },
  {
    id: 'anatoly',
    name: 'aeyakovenko',
    avatar: 'https://placehold.co/128x128/E8E8E8/4D4D4D?text=AE',
    stats: {
      totalScore: 6900,
      gamesPlayed: 22,
      questionsAnswered: 220,
      correctAnswers: 180,
      accuracy: '81.82%',
      topRank: 8,
      level: 7,
      xp: 900,
    },
    achievements: ['first-game', 'novice-quizzer']
  },
  {
    id: 'raoul',
    name: 'RaoulGMI',
    avatar: 'https://placehold.co/128x128/E8E8E8/4D4D4D?text=RG',
    stats: {
      totalScore: 6500,
      gamesPlayed: 30,
      questionsAnswered: 300,
      correctAnswers: 225,
      accuracy: '75.00%',
      topRank: 9,
      level: 7,
      xp: 150,
    },
    achievements: ['first-game']
  },
  {
    id: 'saylor',
    name: 'saylor',
    avatar: 'https://placehold.co/128x128/E8E8E8/4D4D4D?text=SA',
    stats: {
      totalScore: 6100,
      gamesPlayed: 10,
      questionsAnswered: 100,
      correctAnswers: 85,
      accuracy: '85.00%',
      topRank: 10,
      level: 5,
      xp: 500,
    },
    achievements: ['first-game']
  },
];

export const LEADERBOARD_DATA: LeaderboardEntry[] = PLAYERS.map(
  (player, index) => ({
    rank: index + 1,
    player,
  })
).sort((a, b) => b.player.stats.totalScore - a.player.stats.totalScore)
 .map((entry, index) => ({ ...entry, rank: index + 1 }));

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [];
