
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { AITriviaGameSchema } from '@/lib/types/ai';

const MODEL_NAME = "gemini-flash-latest";
const API_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key is missing.' }, { status: 500 });
  }

  try {
    const { topic, numQuestions, difficulty, language } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required.' }, { status: 400 });
    }
    if (!numQuestions) {
      return NextResponse.json({ error: 'Number of questions is required.' }, { status: 400 });
    }
    if (!difficulty) {
      return NextResponse.json({ error: 'Difficulty is required.' }, { status: 400 });
    }
    if (!language) {
      return NextResponse.json({ error: 'Language is required.' }, { status: 400 });
    }


    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
    });

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const prompt = `
      You are an expert in creating fun and engaging trivia games. Your task is to generate a trivia game based on the topic of: ${topic}.

      The game should have a clear topic and a set of questions. Each question must have exactly 4 options, and one of them must be the correct answer.

      The difficulty of the questions should be: ${difficulty}.
      
      The entire game, including all questions, answers, and options, must be in the following language: ${language}.

      It is absolutely crucial that you generate EXACTLY ${numQuestions} questions. Do not generate more or fewer than ${numQuestions}. This is a strict requirement.

      Your response MUST be a valid JSON object that conforms to the following schema:
      {
        "type": "object",
        "properties": {
          "topic": { "type": "string" },
          "questions": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "question": { "type": "string" },
                "answer": { "type": "string" },
                "options": {
                  "type": "array",
                  "items": { "type": "string" },
                  "minItems": 4,
                  "maxItems": 4
                }
              },
              "required": ["question", "answer", "options"]
            }
          }
        },
        "required": ["topic", "questions"]
      }
    `;

    const result = await model.generateContent(prompt);

    const response = result.response;
    // Extract text, remove markdown, and clean up potential JSON errors
    let text = response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '');
    // Clean trailing commas which can cause JSON.parse to fail
    text = text.replace(/,\s*([}\]])/g, '$1');

    const gameData = JSON.parse(text);

    // Validate the parsed data against the schema
    const validationResult = AITriviaGameSchema.safeParse(gameData);

    if (!validationResult.success) {
      console.error("AI response validation error:", validationResult.error);
      return NextResponse.json({ error: 'The AI returned data in an invalid format.', details: validationResult.error.flatten() }, { status: 500 });
    }

    return NextResponse.json(validationResult.data, { status: 200 });

  } catch (error: any) {
    console.error('Error generating trivia:', error);
    // Extract a more specific error message if available from the AI response
    const errorMessage = error?.response?.candidates?.[0]?.finishReason || error.message || 'An unexpected error occurred.';
    if (error?.response?.candidates?.[0]?.finishReason === 'SAFETY') {
      return NextResponse.json({ error: 'The generated content was blocked due to safety settings. Please try a different topic.' }, { status: 400 });
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
