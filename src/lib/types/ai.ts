
import { z } from 'zod';

export const AITriviaQuestionSchema = z.object({
  question: z.string().describe('The trivia question text.'),
  answer: z.string().describe('The correct answer to the question.'),
  options: z.array(z.string()).length(4).describe('An array of 4 possible answers, one of which must be the correct answer.'),
});

export const AITriviaGameSchema = z.object({
  topic: z.string().describe('The overall topic of the trivia game.'),
  questions: z.array(AITriviaQuestionSchema).min(5).max(50).describe('An array of 5 to 50 trivia questions.'),
});

export type AITriviaGame = z.infer<typeof AITriviaGameSchema>;
