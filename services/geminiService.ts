import { GoogleGenAI, Schema, Type } from "@google/genai";
import { DesignSystem, Slide } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean JSON string if Markdown code blocks are present
const cleanJsonString = (str: string) => {
  return str.replace(/```json\n|\n```/g, "").replace(/```/g, "").trim();
};

export const analyzeSlideDesign = async (base64Data: string, mimeType: string): Promise<DesignSystem> => {
  const prompt = `
    You are an expert Brand Designer and Design Systems Engineer.
    Analyze this presentation file (slide or document) and reverse engineer its Master Template.
    
    Extract the following with high precision:
    1. Color Palette: Identify exact hex codes.
    2. Typography: Classify fonts.
    3. Logo Logic: Detect where the logo is placed (e.g. top-right) and its style.
    4. Master Slides: Differentiate between:
       - "Title Slide" (cover).
       - "Section Slide" (divider/transition slide for new topics).
       - "Default Slide" (standard content).
       - If a Section slide isn't explicitly visible, infer a style that contrasts with the Default slide (e.g., using the primary color as background).
       - For backgrounds: Provide valid CSS strings. If it's a solid color, return the hex. If it's a gradient, return a valid 'linear-gradient(...)' string.
    5. Vibe: A short aesthetic description.

    Return ONLY a JSON object. Do not include markdown formatting.
  `;

  // Schema for structured output
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "A creative name for this theme" },
      colors: {
        type: Type.OBJECT,
        properties: {
          background: { type: Type.STRING, description: "Hex code for slide background" },
          text: { type: Type.STRING, description: "Hex code for body text" },
          primary: { type: Type.STRING, description: "Hex code for primary headings" },
          secondary: { type: Type.STRING, description: "Hex code for secondary text or subheaders" },
          accent: { type: Type.STRING, description: "Hex code for UI accents, buttons, or highlights" },
        },
        required: ["background", "text", "primary", "secondary", "accent"],
      },
      fonts: {
        type: Type.OBJECT,
        properties: {
          heading: { type: Type.STRING, description: "CSS font-family stack for headings" },
          body: { type: Type.STRING, description: "CSS font-family stack for body text" },
        },
        required: ["heading", "body"],
      },
      logo: {
        type: Type.OBJECT,
        properties: {
          placement: { type: Type.STRING, enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'none'] },
          style: { type: Type.STRING, enum: ['dark', 'light', 'color'] }
        },
        required: ["placement", "style"]
      },
      masters: {
        type: Type.OBJECT,
        properties: {
          title: {
             type: Type.OBJECT,
             properties: {
               background: { type: Type.STRING, description: "CSS background property (hex or gradient)" },
               textColor: { type: Type.STRING },
               accentColor: { type: Type.STRING }
             },
             required: ["background", "textColor", "accentColor"]
          },
          section: {
             type: Type.OBJECT,
             properties: {
               background: { type: Type.STRING, description: "CSS background property (hex or gradient)" },
               textColor: { type: Type.STRING },
               accentColor: { type: Type.STRING }
             },
             required: ["background", "textColor", "accentColor"]
          },
          default: {
             type: Type.OBJECT,
             properties: {
               background: { type: Type.STRING, description: "CSS background property (hex or gradient)" },
               textColor: { type: Type.STRING },
               accentColor: { type: Type.STRING }
             },
             required: ["background", "textColor", "accentColor"]
          }
        },
        required: ["title", "section", "default"]
      },
      vibe: { type: Type.STRING, description: "Short description of the design aesthetic" },
    },
    required: ["name", "colors", "fonts", "logo", "masters", "vibe"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(cleanJsonString(text)) as DesignSystem;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Failed to analyze design system.");
  }
};

export const generatePresentationContent = async (
  topic: string, 
  designSystem: DesignSystem
): Promise<Slide[]> => {
  const prompt = `
    You are a Presentation Strategist. 
    Create a compelling 5-8 slide presentation about: "${topic}".
    
    The design system being used is: ${JSON.stringify(designSystem)}.
    Ensure the tone of the copy matches the '${designSystem.vibe}' vibe of the design system.

    Structure the deck logically. Use 'section' slides to separate major ideas.

    Slide Types available: 
    - 'title': Main cover slide.
    - 'section': A transition slide introducing a new major topic/section.
    - 'content': Standard bullet points.
    - 'splitLeft': Image on left, text on right.
    - 'splitRight': Image on right, text on left.
    - 'quote': A powerful quote or statement.
    - 'bigNumber': A slide focusing on a key statistic.

    For 'imageKeyword', provide a specific, high-quality search term for Unsplash that matches the content and the design vibe.
    
    Return ONLY a JSON object containing a 'slides' array.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      slides: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['title', 'section', 'content', 'splitLeft', 'splitRight', 'quote', 'bigNumber'] },
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            content: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            highlight: { type: Type.STRING },
            imageKeyword: { type: Type.STRING },
          },
          required: ["id", "type", "title"],
        },
      },
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(cleanJsonString(text));
    return data.slides as Slide[];
  } catch (error) {
    console.error("Generation failed:", error);
    throw new Error("Failed to generate presentation content.");
  }
};
