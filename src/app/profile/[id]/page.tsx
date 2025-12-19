
'use client';

import { PLAYERS } from '@/lib/mock-data';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { notFound, useParams } from 'next/navigation';
import { Player } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card as UICard, CardContent as UICardContent } from '@/components/ui/card';
import { useI18n } from '@/hooks/use-i18n';
import { useUserStats } from '@/hooks/use-user-stats';
import { useFarcasterIdentity } from '@/hooks/use-farcaster-identity';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

function ProfilePageContent() {
  const [player, setPlayer] = useState<Player | null>(null);
  
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const { authenticated, farcasterProfile, loading } = useFarcasterIdentity();
  const { t } = useI18n();
  const { stats: userStats } = useUserStats(farcasterProfile?.fid?.toString());

  useEffect(() => {
    if (loading) {
        return;
    }

    if (id === 'me') {
      if (authenticated && farcasterProfile) {
        setPlayer({
          id: farcasterProfile.username || `fid-${farcasterProfile.fid}`,
          name: farcasterProfile.display_name || farcasterProfile.username || `User ${farcasterProfile.fid}`,
          avatar: farcasterProfile.pfp_url || `https://placehold.co/128x128.png`,
          stats: userStats,
          achievements: userStats.unlockedAchievements,
        });
      } else {
        setPlayer(null);
      }
    } else {
      const foundPlayer = PLAYERS.find((p) => p.id.toLowerCase() === id.toLowerCase());
      setPlayer(foundPlayer || null);
    }
  }, [id, farcasterProfile, authenticated, loading, userStats]);


  if (loading) {
    return (
       <Card>
            <CardHeader>
                <Skeleton className="w-32 h-32 rounded-full mx-auto mb-4" />
                <Skeleton className="h-10 w-48 mx-auto" />
                <Skeleton className="h-5 w-32 mx-auto" />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center justify-center bg-secondary p-4 rounded-lg text-center">
                            <Skeleton className="h-8 w-8 mb-2 rounded-full" />
                            <Skeleton className="h-4 w-20 mb-1" />
                            <Skeleton className="h-6 w-10" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
  }

  if (id === 'me' && !authenticated) {
    return (
      <UICard className="w-full max-w-md mx-auto text-center">
        <UICardContent className="pt-6">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-headline mb-4">{t('profile.sign_in.title')}</h2>
            <p className="text-muted-foreground mb-6">{t('profile.sign_in.description')}</p>
        </UICardContent>
      </UICard>
    )
  }

  if (!player && id !== 'me') {
    notFound();
  }
  
  if (player) {
    return (
      <div className="container mx-auto space-y-8">
        <ProfileCard player={player} />
      </div>
    );
  }
  
  return null;
}

export default function ProfilePage() {
  return <ProfilePageContent />;
}

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={className}>{children}</div>;
const CardHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={className}>{children}</div>;
const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={className}>{children}</div>;
