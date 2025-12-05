import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ExtractedOrderData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    orderId: { type: Type.STRING, description: "O ID numérico do pedido." },
    customerName: { type: Type.STRING, description: "Nome do cliente. Se não encontrado, use 'Não identificado'." },
    paymentStatus: { type: Type.STRING, description: "Status do pagamento (ex: Pago, Pendente)." },
    imageLink: { type: Type.STRING, description: "URL da foto para o bordado." },
    embroideryPosition: { type: Type.STRING, description: "Posição do bordado na peça (ex: Peito, Centro)." },
    petCount: { type: Type.STRING, description: "Quantidade de elementos a bordar." },
    category: { 
      type: Type.STRING, 
      description: "Classifique EXATAMENTE como uma destas: 'Pet Ilustração', 'Elementos', 'Fotografia', 'Iniciais, Datas e Frases', 'Eternize'. Se não encaixar, use 'Outros'." 
    },
    optionalText: { type: Type.STRING, description: "Texto opcional a ser bordado abaixo ou junto da imagem." },
    sku: { type: Type.STRING, description: "Código SKU do produto (ex: XQPQYDUST-marrom)." },
    shippingAddress: { type: Type.STRING, description: "Endereço de envio (apenas Rua/Logradouro e Número)." },
    productSize: { type: Type.STRING, description: "Tamanho da peça (ex: P, M, G, GG)." },
    rawColor: { type: Type.STRING, description: "Cor do produto identificada no título ou opções." },
  },
  required: ["orderId", "imageLink", "category"],
};

export const extractOrderData = async (rawText: string): Promise<ExtractedOrderData> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analise o seguinte texto de pedido de e-commerce e extraia os dados para produção de bordado.
      
      Categorias possíveis (escolha a que melhor se adapta):
      1. 'Pet Ilustração' (Animais, pets)
      2. 'Elementos' (Objetos, símbolos, desenhos abstratos)
      3. 'Fotografia' (Fotos realistas de pessoas)
      4. 'Iniciais, Datas e Frases' (Apenas texto)
      5. 'Eternize' (Memórias, momentos específicos, fotos antigas)
      
      Texto do Pedido:
      """
      ${rawText}
      """
      
      Prioridade máxima para o Link da Imagem e o ID do Pedido.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, 
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as ExtractedOrderData;
  } catch (error) {
    console.error("Error extracting data:", error);
    throw new Error("Falha ao processar o pedido com IA.");
  }
};
