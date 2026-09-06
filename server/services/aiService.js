import { GoogleGenAI } from '@google/genai';
import { analyzeFinance } from './financeAnalyzer.js';

const hasGeminiKey = () => {
  const key = process.env.GEMINI_API_KEY;

  return key && key.trim() !== '';
};

export const generateAIInsights = async ({ transactions, budget }) => {
  const analysis = analyzeFinance({
    transactions,
    budget
  });

  if (!hasGeminiKey()) {
    return {
      provider: 'heuristic',
      insights: [
        ...analysis.insights,
        ...analysis.recommendations
      ].slice(0, 8)
    };
  }

  try {
    const client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const prompt = [
      'You are a personal finance analysis assistant.',
      'Generate exactly 5 to 8 concise and useful financial insights based ONLY on the provided data.',
      '',
      'Rules:',
      ' Return exactly 6 to 8 insights.',
      ' Return ONLY a JSON array of strings.',
      ' Each insight must be a single concise sentence.',
      ' Do not use currency symbols such as $, ₹, €, £, or any other currency symbol.',
      ' Use plain numbers for monetary values.',
      ' Do not invent or assume any financial data that is not provided.',
      ' Cover different aspects of the data instead of repeating similar insights.',
      ' Include insights about spending, income, savings, budget, categories, trends, or unusual patterns when the data supports them.',
      ' If there is no income, clearly mention that instead of assuming an income amount.',
      ' If there is insufficient data for a particular insight, skip that topic and use another supported insight.',
      '',
      'Financial data:',
      JSON.stringify({
        totalIncome: analysis.totalIncome,
        totalExpense: analysis.totalExpense,
        savings: analysis.savings,
        budgetRemaining: analysis.budgetRemaining,
        categoryBreakdown: analysis.categoryBreakdown,
        monthlyTrend: analysis.monthlyTrend
      })
    ].join('\n');

    const response = await client.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        temperature: 0.4
      }
    });

    const text = response.text || '[]';

    const insights = JSON.parse(text);

    return {
      provider: 'gemini',
      insights:
        Array.isArray(insights) && insights.length
          ? insights
          : analysis.insights
    };
  } catch (error) {
    console.log(error);

    return {
      provider: 'heuristic',
      insights: [
        ...analysis.insights,
        ...analysis.recommendations
      ].slice(0, 8)
    };
  }
};

export const predictExpense = async ({
  transactions,
  budget
}) => {
  const analysis = analyzeFinance({
    transactions,
    budget
  });

  return {
    predictedExpense: analysis.predictedExpense,
    confidence: analysis.confidence,
    budgetRisk:
      analysis.monthlyBudget > 0
        ? analysis.predictedExpense > analysis.monthlyBudget
        : false,
    recommendations: analysis.recommendations
  };
};