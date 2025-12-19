
'use client';

import { LEADERBOARD_DATA } from '@/lib/mock-data';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';

function LeaderboardContent() {
  const { t } = useI18n();
  const leaderboardData = LEADERBOARD_DATA;

  return (
    <div>
       <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Trophy className="h-8 w-8 text-primary drop-shadow-glow-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">{t('leaderboard.title')}</CardTitle>
              <CardDescription>{t('leaderboard.description')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <LeaderboardTable data={leaderboardData} />
        </CardContent>
      </Card>
    </div>
  );
}


export default function LeaderboardPage() {
  return (
      <LeaderboardContent />
  )
}
