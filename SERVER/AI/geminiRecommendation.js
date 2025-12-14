const { GoogleGenAI, Type } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function geminiRecommend(cart, wishlist, allProducts) {
  const cartNames = cart.map(i => i.name).join(", ");
  const wishlistNames = wishlist.map(i => i.name).join(", ");

  const inventory = allProducts.map(p => ({
    id: p.product_id,
    name: p.name,
    category: p.category,
    price: p.price,
  }));

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      productIds: {
        type: Type.ARRAY,
        items: { type: Type.NUMBER },
      },
      reason: {
        type: Type.STRING,
      },
    },
    required: ["productIds", "reason"],
  };

  const prompt = `
You are an expert e-commerce AI recommendation engine.

User behavior:
Cart items: ${cartNames || "Empty"}
Wishlist items: ${wishlistNames || "Empty"}

Available products:
${JSON.stringify(inventory)}

Rules:
- Recommend exactly 12 products.
- Do NOT recommend items already in cart or wishlist.
- If cart & wishlist are empty, recommend popular items.
- Return ONLY valid JSON.
`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.7,
      },
    });

    return JSON.parse(result.text);
  } catch (err) {
    console.error("Gemini AI failed:", err);
    return {
      productIds: allProducts.slice(0, 3).map(p => p.product_id),
      reason: "Top picks specially selected for you",
    };
  }
}

module.exports = { geminiRecommend };
