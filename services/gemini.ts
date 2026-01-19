
import { GoogleGenAI, Type } from "@google/genai";
import { Invoice, Project, Transaction } from "../types";

export const AIService = {
  generateInsights: async (
    invoices: Invoice[],
    transactions: Transaction[],
    projects: Project[]
  ) => {
    // ALWAYS initialize GoogleGenAI inside the call or right before making the call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const summary = {
      totalRevenue: invoices.reduce((acc, inv) => acc + (inv.status === 'Paid' ? inv.amount : 0), 0),
      totalEarnings: invoices.reduce((acc, inv) => acc + (inv.status === 'Paid' ? inv.earning : 0), 0),
      unpaidInvoices: invoices.filter(i => i.status === 'Unpaid').length,
      totalUnpaidAmount: invoices.filter(i => i.status === 'Unpaid').reduce((acc, i) => acc + i.amount, 0),
      expenses: transactions
        .filter(t => t.type === 'Expense')
        .reduce((acc, t) => acc + t.amount, 0),
      projectCount: projects.length,
    };

    const prompt = `
      Act as a high-level financial architect and business strategist.
      Analyze the following business snapshot (All values are in Rwandan Francs - RWF):
      - Revenue (Paid): ${summary.totalRevenue.toLocaleString()} RWF
      - Personal Earnings: ${summary.totalEarnings.toLocaleString()} RWF
      - Unpaid Invoices: ${summary.unpaidInvoices} (Total Pending: ${summary.totalUnpaidAmount.toLocaleString()} RWF)
      - Expenses: ${summary.expenses.toLocaleString()} RWF
      - Active Projects: ${summary.projectCount}
      
      Provide 3-5 strategic insights including:
      1. Cash flow warnings or healthy trends.
      2. Profitability analysis.
      3. Renewal reminders for projects (if any were close to expiry).
      4. Tax preparation advice (VAT related - 18% standard).
      
      Respond in JSON format as an array of objects with fields: title, content, type (suggestion|warning|tip).
    `;

    try {
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
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                type: { 
                    type: Type.STRING,
                    description: 'The type of insight: suggestion, warning, or tip'
                },
              },
              required: ["title", "content", "type"],
            },
          },
        },
      });

      // Use .text property directly (not a method)
      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("AI Insight Error:", error);
      return [];
    }
  }
};
