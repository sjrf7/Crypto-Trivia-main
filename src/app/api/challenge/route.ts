
import { NextRequest, NextResponse } from 'next/server';
import { AITriviaGame } from '@/lib/types/ai';

interface ChallengeData {
  game: AITriviaGame;
  scoreToBeat: number;
  wager: number;
  challenger: string;
  createdAt: number;
}

// In-memory store for challenges.
// In a real production app, you'd use a database like Redis or Firestore.
const challengeStore = new Map<string, ChallengeData>();
const CHALLENGE_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour

function cleanupExpiredChallenges() {
    const now = Date.now();
    for (const [id, challenge] of challengeStore.entries()) {
        if (now - challenge.createdAt > CHALLENGE_EXPIRATION_MS) {
            challengeStore.delete(id);
        }
    }
}

// POST - Create a new challenge and return its ID
export async function POST(req: NextRequest) {
  try {
    cleanupExpiredChallenges(); // Clean up before adding a new one

    const { game, scoreToBeat, wager, challenger } = await req.json();

    if (!game || !game.questions || game.questions.length === 0) {
      return NextResponse.json({ error: 'Invalid game data provided.' }, { status: 400 });
    }
    if (scoreToBeat === undefined || !challenger) {
      return NextResponse.json({ error: 'Score to beat and challenger name are required.' }, { status: 400 });
    }


    // Generate a simple unique ID
    const challengeId = Math.random().toString(36).substring(2, 12);

    challengeStore.set(challengeId, { 
        game, 
        scoreToBeat,
        wager: wager || 0,
        challenger,
        createdAt: Date.now() 
    });

    return NextResponse.json({ challengeId }, { status: 201 });

  } catch (error) {
    console.error('[API/CHALLENGE] POST Error:', error);
    return NextResponse.json({ error: 'Failed to create challenge.' }, { status: 500 });
  }
}


// GET - Retrieve a challenge by its ID
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Challenge ID is required.' }, { status: 400 });
    }

    const challenge = challengeStore.get(id);

    if (!challenge) {
        return NextResponse.json({ error: 'Challenge not found or has expired.' }, { status: 404 });
    }
    
    // We can delete it after it's been fetched once.
    // challengeStore.delete(id);

    return NextResponse.json(challenge, { status: 200 });

  } catch (error) {
    console.error('[API/CHALLENGE] GET Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve challenge.' }, { status: 500 });
  }
}

    