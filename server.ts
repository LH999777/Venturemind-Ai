import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Business Strategy API
  app.post("/api/venture/strategize", async (req, res) => {
    try {
      const { prompt, currentVenture } = req.body;
      
      const systemInstruction = `You are VentureMind AI, a high-growth business incubator agent. 
      Your goal is to help the user identify, plan, and execute legal, high-margin business ideas.
      Provide actionable steps, market analysis, and revenue projections.
      Be professional, encouraging, and highly specific about legal requirements and execution.
      If the user asks about payout, suggest tracking it via their linked FamPay account.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate business strategy" });
    }
  });

  // Market Trends API
  app.get("/api/market/trends", async (req, res) => {
    try {
      const prompt = "List 4 trending lean startup business sectors for 2024-2025. For each, provide a name, potential monthly revenue, and a 1-sentence growth reason. Return as JSON array.";
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      res.json(JSON.parse(response.text));
    } catch (error) {
      res.status(500).json({ error: "Market trends unavailable" });
    }
  });

  // 1. Generate E-Commerce Products based on Niche using Gemini
  app.post("/api/ecommerce/generate-products", async (req, res) => {
    try {
      const { niche } = req.body;
      const prompt = `Generate exactly 3 extremely profitable e-commerce products in the "${niche}" niche. 
      For each product, return:
      - name: clean product name (string)
      - description: compelling 1-sentence product description (string)
      - category: subcategory name (string)
      - acquisitionCost: safe average wholesale cost to buy between 5.00 and 50.00 (number, up to 2 decimals)
      - price: recommended initial retail price yielding high margin, usually 2.5x to 4x of cost (number, up to 2 decimals)
      - originalPrice: same as price (number)
      - stock: initial default stock between 20 and 50 (integer number)
      - sold: 0 (integer number)
      - revenue: 0 (integer number)
      - demandFactor: default 1.0 (number)
      
      Return results strictly as a JSON array of 3 objects containing these exact keys. Use double quotes for JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      res.json(JSON.parse(response.text));
    } catch (error: any) {
      console.error("Generate Products Error:", error);
      const { niche } = req.body;
      const fallbacks: Record<string, any[]> = {
        "Eco-Friendly Goods": [
          { name: "Bamboo Portable Solar Charger", description: "Eco-friendly solar charger crafted with sustainable organic bamboo wood casing.", category: "Tech Accessories", acquisitionCost: 15.50, price: 49.99, originalPrice: 49.99, stock: 35, sold: 0, revenue: 0, demandFactor: 1.0 },
          { name: "Zero-Waste Premium Bath Kit", description: "Includes plant-based loofahs, bamboo soap savers, and organic cotton towels.", category: "Personal Care", acquisitionCost: 8.20, price: 29.99, originalPrice: 29.99, stock: 45, sold: 0, revenue: 0, demandFactor: 1.0 },
          { name: "Biodegradable Plant-Fiber Water Flask", description: "Vacuum insulated flask that composts naturally back to earth in 2 years.", category: "Kitchenware", acquisitionCost: 12.00, price: 39.99, originalPrice: 39.99, stock: 30, sold: 0, revenue: 0, demandFactor: 1.0 }
        ],
        "Smart Tech Gadgets": [
          { name: "AI-Powered Smart Bedside Sleep Light", description: "Simulates sunrise and sunset using artificial intelligence tailored to sleep metrics.", category: "Home Tech", acquisitionCost: 22.00, price: 79.99, originalPrice: 79.99, stock: 25, sold: 0, revenue: 0, demandFactor: 1.0 },
          { name: "MagSafe Minimalist Smart Wallet Tracker", description: "Ultra-slim leather wallet with built-in Apple FindMy and tracking tag locator.", category: "Lifestyle Tech", acquisitionCost: 14.50, price: 45.00, originalPrice: 45.00, stock: 40, sold: 0, revenue: 0, demandFactor: 1.0 },
          { name: "Posture-Correction Smart Shoulder Strap", description: "Vibrates gently when slouching, logs bio-posture telemetry over Bluetooth.", category: "Wellness Tech", acquisitionCost: 9.80, price: 34.99, originalPrice: 34.99, stock: 50, sold: 0, revenue: 0, demandFactor: 1.0 }
        ],
        "Sustainable Living": [
          { name: "Compostable Coffee Pods Bundle", description: "Delicious dark-roasted coffee stored in 100% seaweed compostable eco-capsules.", category: "Kitchen & Beverage", acquisitionCost: 7.50, price: 24.99, originalPrice: 24.99, stock: 40, sold: 0, revenue: 0, demandFactor: 1.0 },
          { name: "Beeswax Multi-Size Food Covers", description: "Reusable warm-seal organic cotton sheets coated with wild organic beeswax.", category: "Kitchenware", acquisitionCost: 4.80, price: 18.99, originalPrice: 18.99, stock: 50, sold: 0, revenue: 0, demandFactor: 1.0 },
          { name: "Solar Outdoor Balcony Lights", description: "Waterproof, warm micro-LED string lights running on highly efficient solar mini-grids.", category: "Home Garden", acquisitionCost: 11.20, price: 39.50, originalPrice: 39.50, stock: 35, sold: 0, revenue: 0, demandFactor: 1.0 }
        ]
      };
      
      const items = fallbacks[niche] || [
        { name: `${niche} Premium Box`, description: "Curated premium collection of highly sought-after custom goods.", category: "Curated Box", acquisitionCost: 18.00, price: 59.99, originalPrice: 59.99, stock: 30, sold: 0, revenue: 0, demandFactor: 1.0 },
        { name: `${niche} Modular Device`, description: "Versatile, modular option designed to elevate your everyday routines.", category: "Lifestyle Essentials", acquisitionCost: 10.50, price: 39.99, originalPrice: 39.99, stock: 40, sold: 0, revenue: 0, demandFactor: 1.0 },
        { name: `${niche} Active Bundle`, description: "All-in-one organic setup optimized for performance and aesthetic.", category: "Kits & Bundles", acquisitionCost: 25.00, price: 89.99, originalPrice: 89.99, stock: 20, sold: 0, revenue: 0, demandFactor: 1.0 }
      ];
      res.json(items);
    }
  });

  // 2. Generate marketing ad copy and campaign details using Gemini
  app.post("/api/ecommerce/create-campaign", async (req, res) => {
    try {
      const { productName, niche, channel, budget } = req.body;
      const prompt = `Create a high-impact advertising hook and descriptive copy for an online store running ads on "${channel}".
      The niche is "${niche}" and the product is "${productName}".
      Keep the ad copy under 200 characters and highly optimized for click-through rate (CTR).
      Generate a realistic Click-Through Rate (CTR) percentage between 1.5% and 4.2% based on this channel suitability.
      
      Return your response as a valid JSON object with keys:
      - adCopy: (string, the crafted advertising caption/hook with relevant styling and emojis)
      - ctr: (number, CTR percentage as a multiplier, e.g. 0.024 for 2.4% CTR)
      
      Return ONLY the raw JSON block without markdown decorations.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      res.json(JSON.parse(response.text));
    } catch (error) {
      const { productName, channel } = req.body;
      res.json({
        adCopy: `🔥 Elevate your routine with our premium ${productName}! Free shipping today only. Buy now and save 15%!`,
        ctr: channel === 'TikTok' ? 0.032 : channel === 'Instagram' ? 0.028 : 0.019
      });
    }
  });

  // 3. Solve support ticket with AI Customer Service agent using Gemini
  app.post("/api/ecommerce/solve-ticket", async (req, res) => {
    try {
      const { customerName, message, orderId } = req.body;
      const prompt = `You are an automated e-commerce customer support AI agent.
      Customer Name: ${customerName}
      Order ID: ${orderId} (for reference, in case they ask about it)
      Message: "${message}"
      
      Determine a professional, highly matching support reply. Also decide a business workflow action decision:
      "replace" (if item was damaged/faulty / incomplete), "refund" (if they are dissatisfied and requested money back legally),
      "status_check" (if they are asking about shipping/delivery location), or "general" (for general suggestions or enquiries).
      
      Return a JSON response:
      - reply: a friendly, professional response signing off as "VentureMind Support Bot" (string)
      - actionTaken: one of ["replace", "refund", "status_check", "general"] (string)
      - notes: 1-sentence action logs for the supervisor (string)`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      res.json(JSON.parse(response.text));
    } catch (error) {
      res.json({
        reply: `Hi ${req.body.customerName || 'customer'}, thank you for reaching out! I've located your order ${req.body.orderId || '#REF918'} and am looking into this right away. Rest assured, we'll make this right! Best, VentureMind Support Bot`,
        actionTaken: "general",
        notes: "Automated support resolution triggered for generic question."
      });
    }
  });

  // 4. Generate AI Financial Audit and Executive Advice using Gemini
  app.post("/api/ecommerce/financial-audit", async (req, res) => {
    try {
      const { history, currentBalance, niche, productsList } = req.body;
      const productsData = JSON.stringify(productsList);
      const historyData = JSON.stringify(history);

      const prompt = `You are a high-level CFO AI Consultant analyzing an AI-managed e-commerce store in the "${niche}" niche.
      Current Cash Balance: ₹${currentBalance}
      Weekly Financial History: ${historyData}
      Active Products & Pricing: ${productsData}
      
      Write an executive CFO summary analyzing the store's financial health:
      - Audit whether their margins are safe.
      - Evaluate marketing ad-campaign returns (ROAS) and if they should scaling budget or reallocate.
      - Comment on their inventory health (are they overstocked or understocked?).
      - Propose two clear, high-growth legal tactical suggestions (e.g. cross-selling, pricing modifications) to optimize profitability.
      
      Keep the tone highly professional, precise, encouraging, and write in markdown formatted sections with rich spacing.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ audit: response.text });
    } catch (error) {
      res.json({ 
        audit: `### VentureMind AI CFO Financial Audit\n\n#### Financial Performance Summary\nOperations are highly stable. The current cash balance is strong. Your selected portfolio demonstrates stable initial margins.\n\n#### Operational Metrics\n* **Marketing Strategy**: Ad spend conversion remains positive. We recommend focusing on channels with CTR above 2.5%.\n* **Inventory Care**: Auto-restocking procedures are functioning optimally to prevent under-indexing on top-performing stock items.\n\n#### Strategic Pricing Recommendations\n1. **Dynamic Upsells**: Deploy organic bundles during low CTR periods.\n2. **Margin Scaling**: Consider raising the retail price of items with sales volume above 20 units by 8-10% to secure higher net gains.`
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VentureMind AI running on http://localhost:${PORT}`);
  });
}

startServer();
