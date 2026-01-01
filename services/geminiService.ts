
import { GoogleGenAI, Type } from "@google/genai";
import { Grade, Subject, Question } from "../types";
import { CM2_RAW_DATA } from "../data/cm2_data";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateQuizQuestions(grade: Grade, subject: Subject): Promise<Question[]> {
  const localSource = grade === Grade.CM2 ? (CM2_RAW_DATA as any)[subject] : null;

  let prompt = "";
  if (localSource && localSource.length > 0) {
    // Provide a broader context to allow generation of 10 questions
    const shuffled = [...localSource].sort(() => 0.5 - Math.random());
    const selected = shuffled; // Use all available data to ensure variety for 10 questions
    
    prompt = `Tu es un expert pédagogique spécialisé uniquement en ${subject} pour le niveau ${grade}. 
    
    IMPORTANT : Tu dois générer exactement 10 questions.
    STRICT : Tu ne dois générer des questions QUE sur la matière : ${subject}. 
    Interdiction absolue d'inclure des questions d'autres matières (ex: pas d'Histoire si on demande SVT).

    Voici les données de référence pour ce quiz :
    ${JSON.stringify(selected)}

    CONSIGNE :
    Génère un quiz de 10 questions variées. 
    Mélange obligatoirement ces 3 formats pour dynamiser le jeu :
    1. QCM : Question avec 4 options (1 seule correcte).
    2. QROC : Question à réponse courte. Fournis 'acceptedAnswers' avec les variantes (ex: avec ou sans majuscules).
    3. MATCHING : Exercice "Relier" avec exactement 4 paires (left/right).

    LIGNES DIRECTRICES POUR ${subject} :
    ${subject === Subject.HISTORY ? "- Focus exclusif sur l'histoire du Burkina Faso (colonisation, indépendance) et des grands empires." : ""}
    ${subject === Subject.GEOGRAPHY ? "- Focus exclusif sur la géographie physique et humaine du Burkina Faso (relief, climat, frontières)." : ""}
    ${subject === Subject.SVT ? "- Focus exclusif sur les sciences de la vie : anatomie (os, dents), hygiène, digestion et respiration." : ""}
    ${subject === Subject.MATH ? "- Focus exclusif sur les mathématiques : périmètres, surfaces, conversions et calcul commercial." : ""}

    FORMAT DE SORTIE (JSON strict) :
    Un tableau de 10 objets :
    {
      "id": string unique,
      "type": "QCM" | "QROC" | "MATCHING",
      "text": string (la question ou consigne),
      "options": string[] (pour QCM),
      "correctAnswer": string (pour QCM),
      "acceptedAnswers": string[] (pour QROC),
      "pairs": { "left": string, "right": string }[] (pour MATCHING),
      "explanation": string (explication pédagogique riche et spécifique à ${subject})
    }

    Ambiance : Style "Questions pour un champion", énergique et éducatif.`;
  } else {
    prompt = `Génère un quiz de 10 questions variées (QCM, QROC, MATCHING) pour un élève de ${grade} en ${subject}. 
    RESTE STRICTEMENT dans le domaine de ${subject}.
    Format JSON strict d'un tableau de 10 objets.`;
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
