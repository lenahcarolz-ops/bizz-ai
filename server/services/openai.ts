import OpenAI from "openai";
import { BusinessProfile } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface AIRecommendation {
  toolName: string;
  category: string;
  useCase: string;
  automationLevel: string;
  description: string;
  link?: string;
  features: string[];
}

interface AIStackResponse {
  title: string;
  description: string;
  overallAnalysis: string;
  implementationTips: string[];
  estimatedSavings: string;
  recommendations: AIRecommendation[];
}

export async function generateAIStack(profile: BusinessProfile): Promise<AIStackResponse> {
  try {
    const prompt = `
Você é um especialista em automação de negócios com IA. Analise o perfil abaixo e gere uma Stack de IA personalizada:

PERFIL DO NEGÓCIO:
- Tipo: ${profile.businessType}
- Tamanho da equipe: ${profile.teamSize}
- Objetivo principal: ${profile.objective}
- Ferramentas atuais: ${profile.currentTools?.join(', ') || 'Nenhuma'}
- Outras ferramentas: ${profile.otherTools || 'Não especificado'}
- Conhecimento em IA: ${profile.aiKnowledge}

INSTRUÇÕES:
1. Crie um título personalizado para a Stack
2. Escreva uma descrição executiva (2-3 frases)
3. Faça uma análise geral das necessidades do negócio
4. Recomende 4-6 ferramentas de IA específicas com:
   - Nome da ferramenta
   - Categoria (ex: "Automação de Marketing", "Atendimento ao Cliente")
   - Caso de uso específico para este negócio
   - Nível de automação: "Alto", "Médio" ou "Baixo"
   - Descrição detalhada do benefício
   - 2-3 recursos/funcionalidades principais
   - Link oficial (quando possível)
5. Dê 3-5 dicas de implementação práticas
6. Estime a economia de tempo/dinheiro mensal

Responda APENAS em JSON no seguinte formato:
{
  "title": "Nome da Stack",
  "description": "Descrição executiva",
  "overallAnalysis": "Análise detalhada das necessidades",
  "implementationTips": ["Dica 1", "Dica 2", "Dica 3"],
  "estimatedSavings": "Estimativa de economia",
  "recommendations": [
    {
      "toolName": "Nome da Ferramenta",
      "category": "Categoria",
      "useCase": "Caso de uso específico",
      "automationLevel": "Alto|Médio|Baixo",
      "description": "Descrição detalhada",
      "link": "https://exemplo.com",
      "features": ["Recurso 1", "Recurso 2", "Recurso 3"]
    }
  ]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um consultor especialista em automação de negócios com IA. Responda sempre em português brasileiro e forneça recomendações práticas e específicas."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate and ensure all required fields are present
    if (!result.title || !result.recommendations || !Array.isArray(result.recommendations)) {
      throw new Error('Invalid AI response format');
    }

    return result as AIStackResponse;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error("Failed to generate AI stack: " + (error as Error).message);
  }
}
