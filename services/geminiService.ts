import { GoogleGenAI, Type } from "@google/genai";
import type { FillInTheBlankExercise, QuizQuestion, RevisionCard, EnhancedVocabularyItem, TenseDetail } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

export const generateTenseDetails = async (tense: string): Promise<TenseDetail> => {
    const prompt = `Generate a detailed explanation for the '${tense}' tense for an ESL learner. Provide a brief description of its usage. Then, provide the sentence structures (formula) and a clear example for positive, negative, and interrogative sentences.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    tenseName: { type: Type.STRING },
                    description: { type: Type.STRING, description: "A brief description of when to use this tense." },
                    structures: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, description: "e.g., Positive, Negative, Interrogative" },
                                formula: { type: Type.STRING, description: "The grammatical formula, e.g., Subject + verb(s/es) + object." },
                                example: { type: Type.STRING, description: "An example sentence." },
                            },
                            required: ["type", "formula", "example"],
                        }
                    },
                },
                required: ["tenseName", "description", "structures"],
            },
        },
    });

    return JSON.parse(response.text.trim());
};

export const generateFillInTheBlanks = async (tense: string): Promise<FillInTheBlankExercise[]> => {
    const prompt = `Generate 10 unique fill-in-the-blank sentences for practicing the '${tense}' tense. For each sentence, provide the sentence with '___' as a placeholder, the correct verb form that fits in the blank, the base verb, and a concise explanation of the grammatical rule for why that verb form is correct in this context (e.g., 'For third-person singular subjects in Present Simple, we add -s to the verb.'). The target audience is an Urdu speaker learning English. Ensure sentences are practical for daily conversation.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        sentence: { type: Type.STRING, description: "The sentence with a '___' placeholder." },
                        correctAnswer: { type: Type.STRING, description: "The correct word for the blank." },
                        baseVerb: { type: Type.STRING, description: "The base form of the verb used." },
                        explanation: { type: Type.STRING, description: "A concise grammatical explanation for the correct answer." }
                    },
                    required: ["sentence", "correctAnswer", "baseVerb", "explanation"],
                },
            },
        },
    });

    const jsonResponse = JSON.parse(response.text.trim());
    return jsonResponse.map((item: any, index: number) => ({ ...item, id: `${tense}-${index}` }));
};


export const generateQuiz = async (tense: string): Promise<QuizQuestion[]> => {
    const prompt = `Generate a 10-question multiple-choice quiz about the '${tense}' tense. Each question should test a specific rule or usage of this tense. Provide 4 options for each question, one of which is correct. The target audience is an intermediate English learner whose native language is Urdu.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswer: { type: Type.STRING },
                    },
                    required: ["question", "options", "correctAnswer"],
                },
            },
        },
    });

    const jsonResponse = JSON.parse(response.text.trim());
    
    const validQuestions = jsonResponse.filter((item: any): item is Omit<QuizQuestion, 'id'> =>
        item &&
        typeof item.question === 'string' &&
        Array.isArray(item.options) &&
        item.options.every((opt: any) => typeof opt === 'string') &&
        typeof item.correctAnswer === 'string'
    );

    return validQuestions.map((item, index: number) => ({ ...item, id: `quiz-${tense}-${index}` }));
};

export const generateEnhancedVocabulary = async (): Promise<EnhancedVocabularyItem[]> => {
    const prompt = `Generate a list of 8 interesting English vocabulary words for an ESL learner. Source these words from popular recent movies or famous English-speaking YouTubers. For each word, provide: the word itself, the source (e.g., 'From the movie Inception' or 'Often used by YouTuber MKBHD'), a simple example sentence, and its Urdu translation in Roman script. Also, determine if the word is a verb. If it IS a verb, provide its V1, V2, and V3 forms. If not, these fields should be null.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        source: { type: Type.STRING },
                        example: { type: Type.STRING },
                        urduTranslation: { type: Type.STRING },
                        isVerb: { type: Type.BOOLEAN },
                        v1: { type: Type.STRING, description: "Base form (nullable)" },
                        v2: { type: Type.STRING, description: "Past simple form (nullable)" },
                        v3: { type: Type.STRING, description: "Past participle form (nullable)" },
                    },
                    required: ["word", "source", "example", "urduTranslation", "isVerb"],
                },
            },
        },
    });
    return JSON.parse(response.text.trim());
};

export const searchVocabularyWord = async (word: string): Promise<EnhancedVocabularyItem> => {
    const prompt = `Generate a detailed vocabulary entry for the English word "${word}". Provide a simple example sentence, its Urdu translation in Roman script, and a common context or source (e.g., 'Commonly used in scientific contexts'). Also, determine if the word is a verb. If it IS a verb, provide its V1, V2, and V3 forms. If not, these fields should be null. Ensure the 'word' field in the response is exactly "${word}". The target audience is an ESL learner.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    word: { type: Type.STRING },
                    source: { type: Type.STRING },
                    example: { type: Type.STRING },
                    urduTranslation: { type: Type.STRING },
                    isVerb: { type: Type.BOOLEAN },
                    v1: { type: Type.STRING, description: "Base form (nullable)" },
                    v2: { type: Type.STRING, description: "Past simple form (nullable)" },
                    v3: { type: Type.STRING, description: "Past participle form (nullable)" },
                },
                required: ["word", "source", "example", "urduTranslation", "isVerb"],
            },
        },
    });
    return JSON.parse(response.text.trim());
};


export const generateRevisionCards = async (): Promise<RevisionCard[]> => {
    const prompt = `Generate 3 concise daily revision cards for an English learner. Each card should cover a different, useful grammar tip or a common mistake to avoid. Each card should have a clear title and brief, easy-to-understand content.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        content: { type: Type.STRING },
                    },
                    required: ["title", "content"],
                },
            },
        },
    });
    return JSON.parse(response.text.trim());
};