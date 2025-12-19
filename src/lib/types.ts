


export interface TriviaQuestion {
  question: string;
  answer: string;
  options: string[];
  originalIndex?: number;
  // Allow for other properties like the ones we'll add for powerups
  [key: string]: any;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

export interface PlayerStats {
  totalScore: number;
  gamesPlayed: number;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: string;
  topRank: number | null;
  level: number;
  xp: number;
  unlockedAchievements: string[]; // Array of achievement IDs
  // Internal tracking properties, prefixed with _
  _consecutiveCorrectAnswers?: number;
  _aiGamesPlayed?: number;
  _powerupsUsed?: number;
  _challengesWon?: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  stats: PlayerStats;
  achievements: string[]; // Array of achievement IDs
}

export interface LeaderboardEntry {
  rank: number;
  player: Player;
}


export interface Notification {
  id: string;
  type: 'achievement' | 'challenge';
  title: string;
  description: string;
  timestamp: number;
  read: boolean;
  href?: string;
}

declare global {
  interface Window {
    FarcasterSDK?: {
      context?: Promise<{
        user: {
          fid: number;
          username: string;
          displayName: string;
          pfpUrl: string;
        }
      }>;
      actions: {
        ready: () => void;
        addFrame: () => Promise<void>;
      };
    };
  }
}
