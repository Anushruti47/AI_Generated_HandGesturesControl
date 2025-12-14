import { GoogleGenAI, Type } from "@google/genai";
import { ParticleConfig, ParticleShape, SystemAnomaly } from "../types";

// Helper to get enum keys for the prompt
const shapes = Object.values(ParticleShape).join(', ');

export const generateAnomaly = async (prompt: string, currentConfig: ParticleConfig): Promise<SystemAnomaly> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // We want a JSON response describing a new particle configuration
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        You are the AI Core of a glitch-art particle simulation. 
        The user requests: "${prompt}".
        
        Available Shapes: ${shapes}.
        Current Config: ${JSON.stringify(currentConfig)}.
        
        Generate a new system configuration (SystemAnomaly).
        The description should be cryptic, cyberpunk, and machine-like.
        Color formats should be Hex or standard CSS names.
        Chaos is 0.0 to 2.0.
        Speed is 0.1 to 5.0.
        Particle Count: 1000 to 20000.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            config: {
              type: Type.OBJECT,
              properties: {
                shape: { type: Type.STRING, enum: Object.values(ParticleShape) },
                colorPrimary: { type: Type.STRING },
                colorSecondary: { type: Type.STRING },
                chaos: { type: Type.NUMBER },
                speed: { type: Type.NUMBER },
                expansion: { type: Type.NUMBER },
                particleCount: { type: Type.NUMBER }
              }
            }
          },
          required: ["name", "description", "config"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as SystemAnomaly;
    }
    throw new Error("Empty response from Core");
  } catch (error) {
    console.error("Gemini Core Error:", error);
    // Fallback glitch
    return {
      name: "ERR_CONNECTION_RESET",
      description: "Neural link severed. Restoring default parameters.",
      config: {
        shape: ParticleShape.SPHERE,
        chaos: 1.5,
        colorPrimary: "#ff0000",
        colorSecondary: "#000000"
      }
    };
  }
};