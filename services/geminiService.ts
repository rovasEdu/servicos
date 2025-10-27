
import { GoogleGenAI, Type } from "@google/genai";
import { ProviderForOcr } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export type OcrEngine = 'gemini' | 'google-lens' | 'gemini-nano';

const providerSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Nome completo do prestador de serviço." },
        specialties: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Lista de especialidades ou serviços principais que a pessoa oferece. Um prestador pode ter mais de uma."
        },
        contacts: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, description: "Tipo de contato (WhatsApp, Celular, Fixo, etc.)." },
                    value: { type: Type.STRING, description: "O número de telefone." }
                },
                required: ["type", "value"]
            },
            description: "Lista de números de telefone."
        },
        emails: {
            type: Type.ARRAY,
            items: {
                 type: Type.OBJECT,
                properties: {
                    tag: { type: Type.STRING, description: "Rótulo do email (ex: Pessoal, Trabalho)." },
                    value: { type: Type.STRING, description: "O endereço de e-mail." }
                },
                required: ["tag", "value"]
            },
            description: "Lista de endereços de e-mail."
        },
        address: { type: Type.STRING, description: "Endereço físico, se disponível." },
        googleMapsUrl: { type: Type.STRING, description: "Link para o Google Maps, se disponível." },
        website: { type: Type.STRING, description: "Website, se disponível." },
        socialMedia: {
            type: Type.OBJECT,
            properties: {
                instagram: { type: Type.STRING },
                tiktok: { type: Type.STRING },
                facebook: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                x: { type: Type.STRING }
            },
            description: "Nomes de usuário ou links para redes sociais."
        },
        customTags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Lista de sub-especialidades, habilidades específicas ou outras tags relevantes (ex: 'faz reparos', 'trabalha com gesso acartonado')."
        }
    }
};

const getPromptForEngine = (engine: OcrEngine, availableSpecialties: string[]): string => {
    const baseInstruction = `
        Para cada prestador, é ESSENCIAL capturar ao menos o NOME e a ESPECIALIDADE principal. O TELEFONE também é muito importante, se estiver disponível. Os outros campos são desejáveis, mas não essenciais.
        
        A lista de especialidades disponíveis no sistema é: [${availableSpecialties.join(', ')}].
        
        Sua tarefa de inferência de especialidade é:
        1. Leia o texto e identifique palavras-chave sobre as habilidades da pessoa (ex: "Aço Inox", "Alumínio", "Ferro", "pintura decorativa", "instalação de porcelanato").
        2. Compare essas palavras-chave com a lista de especialidades disponíveis.
        3. Se as palavras-chave indicarem claramente uma ou mais especialidades da lista (ex: "Aço Inox" se relaciona com "Metalúrgico"), adicione essa(s) especialidade(s) ao campo 'specialties'.
        4. Adicione as palavras-chave específicas que você encontrou (ex: "Aço Inox", "Alumínio", "Ferro") ao campo 'customTags'.
        
        Um prestador pode ter uma ou mais especialidades principais.
        Retorne uma lista de objetos JSON, mesmo que encontre apenas um.
        Se não encontrar informações de um prestador válido (com nome e especialidade), retorne uma lista vazia.
    `;

    switch (engine) {
        case 'google-lens':
            return `Você é uma IA de análise de imagem especialista, similar ao Google Lens. Seu objetivo principal é extrair meticulosamente informações de contato estruturadas da imagem fornecida. Seja abrangente. A imagem pode ser um cartão de visita, panfleto, anúncio ou um documento. ${baseInstruction}`;
        case 'gemini':
        case 'gemini-nano': // Gemini Nano for structured data will use this prompt with a lightweight model.
        default:
            return `Extraia as informações de contato do(s) prestador(es) de serviço desta imagem. A imagem é provavelmente um cartão de visita, panfleto ou anúncio. ${baseInstruction}`;
    }
};


export async function extractProviderInfo(base64Image: string, mimeType: string, engine: OcrEngine, availableSpecialties: string[]): Promise<ProviderForOcr[]> {
    try {
        const prompt = getPromptForEngine(engine, availableSpecialties);
        // Use gemini-2.5-flash for both 'gemini' and 'gemini-nano' for structured extraction
        // as it's the lightest model suitable for these tasks.
        const model = engine === 'google-lens' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeType,
                        }
                    },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: providerSchema
                },
            },
        });

        const jsonText = response.text.trim();
        const providers = JSON.parse(jsonText) as ProviderForOcr[];
        
        if (!Array.isArray(providers)) {
            console.error("Gemini did not return an array:", providers);
            return [];
        }

        // Basic validation
        return providers.filter(p => p && typeof p.name === 'string' && Array.isArray(p.specialties) && p.specialties.length > 0);
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to extract information from image.");
    }
}

export async function extractRawText(base64Image: string, mimeType: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                     {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeType,
                        }
                    },
                    { text: "Extraia todo o texto visível na imagem. Preserve as quebras de linha originais. Responda apenas com o texto extraído." }
                ]
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for raw text extraction:", error);
        throw new Error("Failed to extract raw text from image.");
    }
}

export async function suggestIconsForSpecialty(specialtyName: string, availableIcons: string[]): Promise<string[]> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        text: `
                        Dada a especialidade de prestador de serviço "${specialtyName}", sugira os 3 nomes de ícones mais apropriados da biblioteca Lucide React.
                        Responda APENAS com um array JSON contendo 3 strings com os nomes exatos dos ícones.
                        Exemplo de resposta: ["Hammer", "Wrench", "Drill"]
                        
                        Aqui está a lista de ícones disponíveis para escolher:
                        ${availableIcons.join(', ')}
                        `
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
            },
        });

        const jsonText = response.text.trim();
        const iconNames = JSON.parse(jsonText) as string[];
        
        if (Array.isArray(iconNames) && iconNames.length > 0) {
            return iconNames.slice(0, 3); // Ensure only 3 are returned
        }
        return ["Construction", "Wrench", "User"]; // Fallback
    } catch (error) {
        console.error("Error calling Gemini API for icon suggestion:", error);
        // Return fallback icons
        return ["Construction", "Wrench", "User"];
    }
}
