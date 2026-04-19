import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeEthicalDNA(results: any) {
  try {
    const historySummary = results.history.map((d: any, i: number) => {
      const chosen = d.chosenScenario;
      return `Round ${i + 1}: Chosen ${chosen.isPassengers ? 'Passengers' : 'Pedestrians'} (${chosen.legality}). Saved: ${chosen.entities.map((e: any) => e.label).join(', ')}`;
    }).join('\n');

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze these ethical test results and the decision history.
        
        Results Overview:
        - Humans Saved: ${results.savedHumans}/${results.totalHumans}
        - Legal Adherence: ${Math.round((results.savedLegal / results.totalDecisions) * 100)}%
        - Young Saved: ${results.savedYoung} vs Old Saved: ${results.savedOld}
        
        Decision History:
        ${historySummary}

        Identify:
        1. A "Pivot Point": The round where the user made the most difficult/indicative choice.
        2. Archetype and traits.

        Return ONLY a JSON object with:
        {
          "archetype": "Short Title",
          "description": "2-3 sentence analysis",
          "quote": "Philosophical quote",
          "traits": ["Trait 1", "Trait 2", "Trait 3"],
          "criticalDecisionRound": 5,
          "criticalDecisionAnalysis": "Explanation of why round 5 was pivotal."
        }
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            archetype: { type: Type.STRING },
            description: { type: Type.STRING },
            quote: { type: Type.STRING },
            traits: { type: Type.ARRAY, items: { type: Type.STRING } },
            criticalDecisionRound: { type: Type.NUMBER },
            criticalDecisionAnalysis: { type: Type.STRING }
          },
          required: ["archetype", "description", "quote", "traits", "criticalDecisionRound", "criticalDecisionAnalysis"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
}
