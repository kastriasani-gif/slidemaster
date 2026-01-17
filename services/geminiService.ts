import { GoogleGenAI } from "@google/genai";
import { DesignSystem, Slide } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Bereinigt einen JSON-String von potenziellen Markdown-Codeblöcken.
 */
const cleanJsonString = (str: string): string => {
  return str.replace(/```json\n?|```/g, "").trim();
};

/**
 * Sicherer JSON-Parse mit Fehlerbehandlung.
 */
const safeJsonParse = <T>(text: string, fallback: T): T => {
  try {
    return JSON.parse(cleanJsonString(text)) as T;
  } catch (error) {
    console.error("JSON Parse Error:", error, "Raw text:", text);
    return fallback;
  }
};

export const analyzeSlideDesign = async (base64Data: string, mimeType: string): Promise<DesignSystem> => {
  const prompt = `
    Analysiere diese Präsentationsdatei und extrahiere das Design-System (Farben, Schriften, Logo-Platzierung).
    Gib NUR ein JSON-Objekt zurück.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "";
    return safeJsonParse(text, {} as DesignSystem);
  } catch (error) {
    console.error("Analyse fehlgeschlagen:", error);
    throw new Error("Design-Analyse fehlgeschlagen.");
  }
};

export const generatePresentationContent = async (topic: string, designSystem: DesignSystem): Promise<Slide[]> => {
  // Remove heavy base64 data from the context to avoid token limit issues and confusion
  const cleanDesign = {
    colors: designSystem.colors,
    fonts: designSystem.fonts,
    vibe: designSystem.vibe,
    name: designSystem.name
  };

  const prompt = `
    Create a detailed professional presentation structure about: "${topic}".
    
    You must return a JSON object containing a "slides" array.
    
    Design Context: ${JSON.stringify(cleanDesign)}

    JSON Structure Requirement:
    {
      "slides": [
        {
          "id": "slide-1",
          "type": "title", 
          "title": "Main Title",
          "subtitle": "Subtitle",
          "content": [],
          "imageKeyword": "topic specific keyword"
        },
        {
          "id": "slide-2",
          "type": "content" | "section" | "splitLeft" | "splitRight" | "quote" | "bigNumber",
          "title": "Slide Title",
          "content": ["Point 1", "Point 2", "Point 3"],
          "imageKeyword": "relevant keyword",
          "highlight": "100% or Quote Text"
        }
      ]
    }

    Rules:
    1. First slide must be type 'title'.
    2. Include at least 6 slides.
    3. Include at least one 'section' slide.
    4. Ensure content is substantial.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "";
    
    // Parse loosely first
    const parsed = safeJsonParse<any>(text, null);

    if (!parsed) return [];

    let slides: Slide[] = [];

    if (Array.isArray(parsed)) {
       slides = parsed;
    } else if (parsed.slides && Array.isArray(parsed.slides)) {
       slides = parsed.slides;
    }

    // Ensure IDs exist
    return slides.map((s, i) => ({
        ...s,
        id: s.id || `slide-${i}-${Date.now()}`,
        // Fallback for missing content array
        content: Array.isArray(s.content) ? s.content : (s.content ? [s.content] : [])
    })) as Slide[];

  } catch (error) {
    console.error("Generierung fehlgeschlagen:", error);
    throw new Error("Inhalt konnte nicht generiert werden.");
  }
};