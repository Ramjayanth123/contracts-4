import React from 'react';
import { Risk } from '@/hooks/useRiskDetection';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

interface RiskHighlighterProps {
  documentText: string;
  risks: Risk[];
}

export const RiskHighlighter: React.FC<RiskHighlighterProps> = ({ documentText, risks }) => {
  if (!documentText || !risks || risks.length === 0) {
    return <div className="whitespace-pre-wrap">{documentText}</div>;
  }

  // Simple highlighting approach for MVP
  // In a production app, we would use a more sophisticated approach with proper text indexing
  const highlightRisks = () => {
    let result = documentText;
    
    // Sort risks by phrase length (longest first) to avoid nested highlighting issues
    const sortedRisks = [...risks].sort((a, b) => b.phrase.length - a.phrase.length);
    
    for (const risk of sortedRisks) {
      const { phrase, severity, explanation, suggestion } = risk;
      
      // Skip if phrase is not found in the text
      if (!result.includes(phrase)) continue;
      
      // Create a unique ID for this risk
      const riskId = `risk-${Math.random().toString(36).substring(2, 9)}`;
      
      // Get the appropriate icon and color based on severity
      const severityClass = 
        severity === 'High' ? 'bg-red-500/20 border-red-500' : 
        severity === 'Medium' ? 'bg-yellow-500/20 border-yellow-500' : 
        'bg-blue-500/20 border-blue-500';
      
      // Replace the phrase with a highlighted version
      const highlightedPhrase = `<span id="${riskId}" class="relative rounded px-1 py-0.5 border ${severityClass} group cursor-help">
        ${phrase}
        <span class="risk-tooltip hidden group-hover:block absolute z-50 bottom-full left-0 w-64 p-2 mb-2 bg-slate-900 rounded-md shadow-lg text-sm">
          <div class="font-semibold flex items-center gap-1 mb-1">
            ${severity === 'High' ? '<span class="text-red-400">High Risk</span>' : 
              severity === 'Medium' ? '<span class="text-yellow-400">Medium Risk</span>' : 
              '<span class="text-blue-400">Low Risk</span>'}
          </div>
          <div class="text-gray-300 mb-1">${explanation}</div>
          ${suggestion ? `<div class="text-green-400 text-xs mt-1">Suggestion: ${suggestion}</div>` : ''}
        </span>
      </span>`;
      
      // Replace the phrase with the highlighted version
      result = result.replace(new RegExp(escapeRegExp(phrase), 'g'), highlightedPhrase);
    }
    
    return <div 
      className="whitespace-pre-wrap" 
      dangerouslySetInnerHTML={{ __html: result }} 
    />;
  };
  
  return highlightRisks();
};

// Helper function to escape special characters in regex
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default RiskHighlighter; 