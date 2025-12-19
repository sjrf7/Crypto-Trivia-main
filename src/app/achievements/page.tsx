
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ACHIEVEMENTS } from '@/lib/mock-data';
import { Award, CheckCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useI18n } from '@/hooks/use-i18n';
import { cn } from '@/lib/utils';
import { useUserStats } from '@/hooks/use-user-stats';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFarcasterIdentity } from '@/hooks/use-farcaster-identity';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

function AchievementsContent() {
  const { t } = useI18n();
  const { authenticated, farcasterProfile } = useFarcasterIdentity();
  const { stats } = useUserStats(farcasterProfile?.fid?.toString());

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Award className="h-8 w-8 text-primary drop-shadow-glow-primary" />
          <div>
            <CardTitle className="font-headline text-3xl">{t('achievements.title')}</CardTitle>
            <CardDescription>{t('achievements.description')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!authenticated && (
          <Alert className="mb-6 border-primary bg-primary/10">
            <Info className="h-4 w-4" />
            <AlertTitle className='font-bold text-primary'>{t('achievements.sign_in_prompt.title')}</AlertTitle>
            <AlertDescription>
              <span>{t('achievements.sign_in_prompt.description')}</span>
            </AlertDescription>
          </Alert>
        )}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = authenticated && stats.unlockedAchievements.includes(achievement.id);

            return (
              <motion.div key={achievement.id} variants={itemVariants}>
                <Card
                  className={cn(
                    'relative overflow-hidden transition-all duration-300 flex flex-col h-full items-center text-center p-6',
                    isUnlocked
                      ? 'border-primary shadow-primary/20 hover:shadow-primary/40'
                      : 'opacity-60 bg-secondary'
                  )}
                >
                  {isUnlocked && (
                    <div className="absolute top-2 right-2 rounded-full p-1 bg-green-500 text-white">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                  <div className={cn(
                    'p-4 rounded-full mb-4',
                    isUnlocked ? 'bg-primary/10' : 'bg-muted'
                  )}>
                    <achievement.icon className={cn(
                      'h-12 w-12',
                      isUnlocked ? 'text-primary' : 'text-muted-foreground'
                    )} />
                  </div>
                  <CardTitle className="text-xl font-headline">{t(`achievements.items.${achievement.id}.name`)}</CardTitle>
                  <p className="text-sm text-muted-foreground flex-grow mt-2">
                    {t(`achievements.items.${achievement.id}.description`)}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </CardContent>
    </Card>
  )
}

export default function AchievementsPage() {
  return (
    <div>
      <AchievementsContent />
    </div>
  );
}
