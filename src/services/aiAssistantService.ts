import { GoogleGenerativeAI } from "@google/generative-ai";
import { leadsService } from "./leads";
import { followUpService } from "./followUps";
import { transactionService } from "./transactions";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export const aiAssistantService = {
  async getCRMContext() {
    try {
      const [metrics, followUps, transactions] = await Promise.all([
        leadsService.getDashboardMetrics(),
        followUpService.getFollowUps(),
        transactionService.getTransactions()
      ]);

      const pendingFollowUps = followUps.filter(f => f.status === 'Pending').slice(0, 5);
      const recentTransactions = transactions.slice(0, 5);

      return JSON.stringify({
        metrics,
        pendingFollowUps: pendingFollowUps.map(f => ({
          note: f.note,
          due: f.due_date,
          lead: f.leads?.contacts?.name || 'Unknown'
        })),
        recentTransactions: recentTransactions.map(t => ({
          type: t.type,
          amount: t.amount,
          entity: t.type === 'income' ? t.from_entity : t.to_entity,
          date: t.date
        }))
      });
    } catch (err) {
      console.error("Failed to fetch CRM context for AI:", err);
      return "{}";
    }
  },

  async sendMessage(prompt: string): Promise<string> {
    if (!genAI) {
      throw new Error("AI assistant is temporarily unavailable. Please try again.");
    }

    try {
      // Use gemini-1.5-flash as requested
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const crmContext = await this.getCRMContext();

      const systemPrompt = `
        You are the Nowworks AI Business Assistant, embedded inside a SaaS CRM.
        Your goal is to help the user understand their business data, prioritize tasks, and draft emails or notes.
        Keep your responses concise, professional, and easy to read. Use bullet points when listing items.
        Do not suggest destructive actions (like deleting data). Only suggest actions the user can take manually in the CRM.
        
        CURRENT CRM DATA CONTEXT:
        ${crmContext}
        
        USER QUERY:
        ${prompt}
      `;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text) {
        throw new Error("Empty response from AI");
      }
      
      return text;
    } catch (err: any) {
      console.error("AI Assistant Error:", err);
      // Specific error message as requested by the user
      throw new Error("AI assistant is temporarily unavailable. Please try again.");
    }
  }
};
