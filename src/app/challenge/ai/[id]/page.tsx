
'use client';

import { useEffect, useState } from 'react';
import { GameClient } from '@/components/game/GameClient';
import { AITriviaGame } from '@/lib/types/ai';
import { notFound, useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface AIChallengeData {
    game: AITriviaGame;
    scoreToBeat: number;
    wager: number;
    challenger: string;
}

export default function AIChallengePage() {
    const params = useParams();
    const id = params.id as string;

    const [challengeData, setChallengeData] = useState<AIChallengeData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("No challenge ID provided.");
            setIsLoading(false);
            return;
        }

        const fetchChallenge = async () => {
            try {
                const response = await fetch(`/api/challenge?id=${id}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch challenge.');
                }
                const data = await response.json();
                setChallengeData(data);
            } catch (e: any) {
                console.error("Error fetching challenge:", e);
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChallenge();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4 mx-auto" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
             <div className="flex justify-center items-center h-full">
                <Alert variant="destructive" className="max-w-lg">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                       {error}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
    
    if (!challengeData) {
        // This can happen if the fetch completes but returns no data.
        // The error state should ideally catch this, but as a fallback:
        notFound();
    }

    return <GameClient 
        challengeQuestions={challengeData.game.questions} 
        scoreToBeat={challengeData.scoreToBeat} 
        wager={challengeData.wager}
        challenger={challengeData.challenger}
        isAiGame={true}
        aiGameTopic={challengeData.game.topic}
        challengeId={id}
    />;
}

    