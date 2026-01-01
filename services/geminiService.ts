
import { GoogleGenAI, Type } from "@google/genai";
import { Grade, Subject, Question } from "../types";
import { CM2_RAW_DATA } from "../data/cm2_data";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateQuizQuestions(grade: Grade, subject: Subject): Promise<Question[]> {
  const localSource = grade === Grade.CM2 ? (CM2_RAW_DATA as any)[subject] : null;

  let prompt = "";
  if (localSource && localSource.length > 0) {
    const shuffled = [...localSource].sort(() => 0.5 - Math.random());
    const selected = shuffled; // Utiliser tout pour assurer 10 questions variées
    
    prompt = `Tu es un expert pédagogique spécialisé uniquement en ${subject} pour le niveau ${grade}. 
    
    CONSIGNES CRITIQUES :
    1. GÉNÈRE EXACTEMENT 10 QUESTIONS.
    2. RESTE STRICTEMENT DANS LA MATIÈRE : ${subject}.
    3. POUR LES RÉPONSES COURTES (QROC) : Dans 'acceptedAnswers', liste la réponse AVEC et SANS les articles (le, la, les, l', un, une, des). 
       Exemple : si la réponse est "Les tendons", mets ["Les tendons", "tendons"].
    4. MIXITÉ DES FORMATS : Mélange QCM (4 choix), QROC (saisie clavier), et MATCHING (lier 4 éléments).

    DONNÉES SOURCE POUR LE BURKINA FASO :
    ${JSON.stringify(selected)}

    DÉTAILS PAR MATIÈRE :
    ${subject === Subject.HISTORY ? "- Dates clés, colonisation, indépendance et empires." : ""}
    ${subject === Subject.GEOGRAPHY ? "- Réforme administrative 2025 (17 régions), fleuves, relief et frontières." : ""}
    ${subject === Subject.SVT ? "- Anatomie (os, dents, sang), hygiène, maladies et vaccins." : ""}
    ${subject === Subject.MATH ? "- Périmètres, Aires, conversions et calcul commercial." : ""}

    FORMAT JSON : Un tableau de 10 objets {id, type, text, options, correctAnswer, acceptedAnswers, pairs, explanation}.`;
  } else {
    prompt = `Génère un quiz de 10 questions pour ${grade} en ${subject}. 
    Reste dans le domaine de ${subject}. Format JSON strict.`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["QCM", "QROC", "MATCHING"] },
            text: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            acceptedAnswers: { type: Type.ARRAY, items: { type: Type.STRING } },
            pairs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  left: { type: Type.STRING },
                  right: { type: Type.STRING }
                }
              }
            },
            explanation: { type: Type.STRING }
          },
          required: ["id", "type", "text", "explanation"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    return [];
  }
}
