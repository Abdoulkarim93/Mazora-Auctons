
import { GoogleGenAI, Type, Part } from "@google/genai";
import { ModerationResult, CategoryType, ProductCondition } from "../types";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using specific model aliases for better task alignment
const TEXT_MODEL = "gemini-3-pro-preview";
const VISION_MODEL = "gemini-3-flash-preview";

const cleanJson = (text: string | undefined): string => {
    if (!text) return '{}';
    let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstOpen = clean.indexOf('{');
    const lastClose = clean.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1) {
        clean = clean.substring(firstOpen, lastClose + 1);
    }
    return clean;
};

export const askMazoraAssistant = async (userQuery: string, history: { role: 'user' | 'model', text: string }[] = []) => {
    if (!process.env.API_KEY) return "I am the Mazora AI Guide. Remember: every bid is binding, and Mazora contacts both parties ONLY after BOTH pay their fees.";

    const systemInstruction = `
        You are the Mazora AI Guide. The platform uses a MANAGED CLEARANCE model.
        POST-AUCTION RULES: 1. Commission is 5% for both. 2. Contact within 60 mins. 3. Every bid is binding.
        LANGUAGE: Match user (TR, EN, FR).
    `;

    try {
        const ai = getAIClient();
        // Correcting use of TEXT_MODEL for reasoning-heavy assistant tasks
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: [
                ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
                { role: 'user', parts: [{ text: userQuery }] }
            ],
            config: { systemInstruction, temperature: 0.2, topP: 0.95 }
        });
        return response.text || "I'm sorry, I couldn't process that query.";
    } catch (e) {
        return "I'm currently updating my protocols.";
    }
};

export const identifyItemFromImage = async (base64Image: string, productNameHint?: string, condition?: ProductCondition): Promise<{
    title: string;
    category: CategoryType;
    description: string;
    estimatedPrice: number;
    currency: string;
    confidence: number;
} | null> => {
    if (!process.env.API_KEY) return null;
    try {
        const ai = getAIClient();
        const prompt = `Analyze this image for the Turkish Mazora Auction market. 
        Product Condition: ${condition || 'USED'}. 
        Generate JSON: title, category, description (technical specs), estimatedPrice (in TL), confidence.`;

        // Explicitly typing parts to resolve Blob shadowing issues
        const parts: Part[] = [
            { text: prompt },
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
        ];

        const response = await ai.models.generateContent({
            model: VISION_MODEL, 
            contents: { parts },
            config: { 
                tools: [{ googleSearch: {} }],
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        category: { type: Type.STRING },
                        description: { type: Type.STRING },
                        estimatedPrice: { type: Type.NUMBER },
                        currency: { type: Type.STRING },
                        confidence: { type: Type.NUMBER }
                    },
                    required: ["title", "category", "description", "estimatedPrice"]
                }
            }
        });
        return JSON.parse(cleanJson(response.text));
    } catch (error) {
        return null;
    }
};

export const moderateAndEnhanceListing = async (title: string, rawDescription: string, category: string, base64Images: string[] = [], condition: ProductCondition = ProductCondition.USED): Promise<ModerationResult & { title?: string, marketPriceEstimate: { min: number, max: number, currency: string } }> => {
  if (!process.env.API_KEY) return { isSafe: true, flags: [], enhancedDescription: rawDescription, marketPriceEstimate: { min: 0, max: 0, currency: 'TRY' } };
  try {
    const ai = getAIClient();
    const textPrompt = `Moderate and value: "${title}". Generate JSON with isSafe, flags, enhancedDescription, marketPriceEstimate {min, max, currency: "TRY"}.`;
    
    // Explicitly typing parts array as Part[] to satisfy GenAI Blob requirements
    const parts: Part[] = [{ text: textPrompt }];
    base64Images.forEach(img => { 
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: img } }); 
    });

    const response = await ai.models.generateContent({
      model: VISION_MODEL,
      contents: { parts },
      config: { 
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                isSafe: { type: Type.BOOLEAN },
                flags: { type: Type.ARRAY, items: { type: Type.STRING } },
                enhancedDescription: { type: Type.STRING },
                title: { type: Type.STRING },
                marketPriceEstimate: { type: Type.OBJECT, properties: { min: { type: Type.NUMBER }, max: { type: Type.NUMBER }, currency: { type: Type.STRING } } }
            },
            required: ["isSafe", "enhancedDescription", "marketPriceEstimate"]
        }
      },
    });
    return JSON.parse(cleanJson(response.text));
  } catch (error) {
    return { isSafe: true, flags: [], enhancedDescription: rawDescription, marketPriceEstimate: { min: 0, max: 0, currency: 'TRY' } };
  }
};

export const generateRequestDescription = async (base64Image: string, keyword: string): Promise<string> => {
    if (!process.env.API_KEY) return `I need a ${keyword}. Please provide details.`;
    try {
        const ai = getAIClient();
        // Explicitly typing parts to satisfy Blob requirement internally
        const parts: Part[] = [{ text: `Generate ONLY the detailed body description for a request titled: "${keyword}". DO NOT include titles, dates, or prices. STRICTLY return the body text in Turkish.` }];
        if (base64Image) parts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Image } });
        
        const response = await ai.models.generateContent({
            model: VISION_MODEL,
            contents: { parts }
        });
        return response.text?.trim() || `I need a ${keyword}.`;
    } catch (error) {
        return `I need a ${keyword}.`;
    }
};

export const verifyHumanFace = async (base64Image: string): Promise<{ isHuman: boolean }> => {
    if (!process.env.API_KEY) return { isHuman: true };
    try {
        const ai = getAIClient();
        
        // Explicitly typing parts to resolve shadowing conflicts
        const parts: Part[] = [
            { text: "Does this image contain a clear human face? Return JSON { 'isHuman': boolean }." },
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
        ];

        const response = await ai.models.generateContent({
            model: VISION_MODEL,
            contents: { parts },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { isHuman: { type: Type.BOOLEAN } },
                    required: ["isHuman"]
                }
            }
        });
        return JSON.parse(cleanJson(response.text));
    } catch (error) {
        return { isHuman: false };
    }
};
