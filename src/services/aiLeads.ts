import { supabase } from './supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface LeadScoreResult {
  score: number;
  category: 'High' | 'Medium' | 'Low';
  reason: string;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export const aiLeadsService = {
  /**
   * Calculates a lead score using Google Gemini AI with a local heuristic fallback.
   */
  async calculateLeadScore(leadId: string): Promise<LeadScoreResult> {
    try {
      // 1. Fetch deep lead data
      const { data: lead, error } = await supabase
        .from('leads')
        .select(`
          status,
          value,
          created_at,
          activities (type, note),
          follow_ups (due_date, status)
        `)
        .eq('id', leadId)
        .single();

      if (error) throw error;

      // 2. Try Gemini AI if API Key exists
      if (genAI) {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          
          const prompt = `
            You are a CRM Sales Expert and Psychologist. Analyze this lead and provide a priority score (0-100) and a 1-sentence reason.
            
            LEAD DATA:
            - Status: ${lead.status}
            - Value: ${lead.value}
            - Activity History: ${JSON.stringify(lead.activities)}
            - Pending Follow-ups: ${JSON.stringify(lead.follow_ups?.filter((f: any) => f.status === 'Pending'))}
            
            ANALYSIS GUIDELINES:
            1. Look at 'activities' especially 'whatsapp' or 'message' types. 
            2. Analyze the sentiment and intent in the 'note' field. 
            3. If the user mentions "pricing", "budget", "demo", or "ready to start", increase the score.
            4. If the sentiment is positive and shows urgency, set a High score (80+).
            5. If the lead is unresponsive or negative, set a Low score (<40).
            
            Return ONLY a valid JSON object in this format:
            {"score": number, "reason": "string"}
          `;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          
          // Parse JSON from response
          const aiJson = JSON.parse(text.replace(/```json|```/g, ""));
          
          return {
            score: aiJson.score,
            category: this.getCategory(aiJson.score),
            reason: aiJson.reason
          };
        } catch (aiErr) {
          console.warn("Gemini AI failed, falling back to heuristic:", aiErr);
        }
      }

      // 3. Local Heuristic Fallback (If AI fails or no key)
      return this.calculateHeuristicScore(lead);

    } catch (err) {
      console.error('Scoring Error:', err);
      return { score: 20, category: 'Low', reason: 'Basic system evaluation' };
    }
  },

  calculateHeuristicScore(lead: any): LeadScoreResult {
    let score = 0;
    let reasons: string[] = [];

    const statusWeights: Record<string, number> = {
      'New': 20, 'Contacted': 45, 'Interested': 75, 'Converted': 100, 'Lost': 0
    };
    
    score += statusWeights[lead.status] || 0;
    
    const activityBonus = Math.min((lead.activities?.length || 0) * 5, 20);
    score += activityBonus;
    
    const hasPending = lead.follow_ups?.some((f: any) => f.status === 'Pending');
    if (hasPending) {
      score += 10;
      reasons.push("Has active follow-up");
    }

    score = Math.min(score, 100);
    
    return {
      score,
      category: this.getCategory(score),
      reason: reasons[0] || `Lead status is ${lead.status}`
    };
  },

  getCategory(score: number): 'High' | 'Medium' | 'Low' {
    if (score >= 80) return 'High';
    if (score >= 50) return 'Medium';
    return 'Low';
  }
};
