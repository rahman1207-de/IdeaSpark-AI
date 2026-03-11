/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Lightbulb, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  Zap, 
  ArrowRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types for the AI response
interface SWOTItem {
  title: string;
  description: string;
}

interface AnalysisResult {
  swot: {
    strengths: SWOTItem[];
    weaknesses: SWOTItem[];
    opportunities: SWOTItem[];
    threats: SWOTItem[];
  };
  riskAssessment: {
    level: 'Low' | 'Medium' | 'High' | 'Critical';
    summary: string;
    keyRisks: string[];
  };
  suggestions: string[];
  marketPotential: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function App() {
  const [idea, setIdea] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeIdea = async () => {
    if (!idea.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this business idea: "${idea}"`,
        config: {
          systemInstruction: "You are an expert business consultant and venture capitalist. Provide a detailed, objective evaluation of the business idea provided. Be critical but constructive.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              swot: {
                type: Type.OBJECT,
                properties: {
                  strengths: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING }
                      },
                      required: ["title", "description"]
                    }
                  },
                  weaknesses: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING }
                      },
                      required: ["title", "description"]
                    }
                  },
                  opportunities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING }
                      },
                      required: ["title", "description"]
                    }
                  },
                  threats: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING }
                      },
                      required: ["title", "description"]
                    }
                  }
                },
                required: ["strengths", "weaknesses", "opportunities", "threats"]
              },
              riskAssessment: {
                type: Type.OBJECT,
                properties: {
                  level: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
                  summary: { type: Type.STRING },
                  keyRisks: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["level", "summary", "keyRisks"]
              },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              marketPotential: { type: Type.STRING }
            },
            required: ["swot", "riskAssessment", "suggestions", "marketPotential"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setResult(data);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Failed to analyze the idea. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'Critical': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Lightbulb className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">IdeaSpark AI</span>
          </div>
          <div className="text-xs font-medium text-slate-400 uppercase tracking-widest">
            Business Intelligence v1.0
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Input Section */}
        <section className="mb-12">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">
              Evaluate Your Next Big Move
            </h1>
            <p className="text-slate-500 text-lg">
              Enter your business proposal below. Our AI will perform a comprehensive SWOT analysis and risk assessment.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-3xl mx-auto">
            <textarea
              id="business-idea-input"
              className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-slate-700 placeholder:text-slate-400"
              placeholder="Describe your business idea in detail... (e.g., A subscription-based platform for local farmers to sell directly to urban consumers...)"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
            />
            <div className="mt-4 flex justify-end">
              <button
                id="analyze-button"
                onClick={analyzeIdea}
                disabled={isAnalyzing || !idea.trim()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-200"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Generate Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl mx-auto mb-8 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-3"
            >
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Summary Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    Risk Level
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getRiskColor(result.riskAssessment.level)}`}>
                    {result.riskAssessment.level}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2">
                  <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4" />
                    Market Potential
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed">
                    {result.marketPotential}
                  </p>
                </div>
              </div>

              {/* SWOT Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
                    <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Strengths
                    </h3>
                    <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Internal</span>
                  </div>
                  <div className="p-6 space-y-4">
                    {result.swot.strengths.map((item, idx) => (
                      <div key={idx} className="group">
                        <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-emerald-600 transition-colors">{item.title}</h4>
                        <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weaknesses */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-rose-50 px-6 py-4 border-b border-rose-100 flex items-center justify-between">
                    <h3 className="font-bold text-rose-800 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Weaknesses
                    </h3>
                    <span className="text-[10px] font-black text-rose-300 uppercase tracking-widest">Internal</span>
                  </div>
                  <div className="p-6 space-y-4">
                    {result.swot.weaknesses.map((item, idx) => (
                      <div key={idx} className="group">
                        <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-rose-600 transition-colors">{item.title}</h4>
                        <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Opportunities */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center justify-between">
                    <h3 className="font-bold text-indigo-800 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Opportunities
                    </h3>
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">External</span>
                  </div>
                  <div className="p-6 space-y-4">
                    {result.swot.opportunities.map((item, idx) => (
                      <div key={idx} className="group">
                        <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                        <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Threats */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center justify-between">
                    <h3 className="font-bold text-amber-800 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Threats
                    </h3>
                    <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest">External</span>
                  </div>
                  <div className="p-6 space-y-4">
                    {result.swot.threats.map((item, idx) => (
                      <div key={idx} className="group">
                        <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-amber-600 transition-colors">{item.title}</h4>
                        <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Risk Assessment & Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Info className="w-6 h-6 text-indigo-400" />
                    Risk Deep Dive
                  </h3>
                  <p className="text-slate-400 mb-6 leading-relaxed italic">
                    "{result.riskAssessment.summary}"
                  </p>
                  <div className="space-y-3">
                    {result.riskAssessment.keyRisks.map((risk, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                        <span className="text-slate-300">{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
                    <Zap className="w-6 h-6 text-indigo-600" />
                    Strategic Suggestions
                  </h3>
                  <div className="space-y-4">
                    {result.suggestions.map((suggestion, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {idx + 1}
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed pt-1">
                          {suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-20 border-t border-slate-200 py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center">
              <Lightbulb className="text-slate-500 w-4 h-4" />
            </div>
            <span className="font-bold text-slate-400 tracking-tight">IdeaSpark AI</span>
          </div>
          <p className="text-slate-400 text-xs">
            Powered by Gemini 3.1 Pro. For informational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
