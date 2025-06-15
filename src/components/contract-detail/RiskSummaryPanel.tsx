import React from 'react';
import { Risk, RiskAnalysisResult } from '@/hooks/useRiskDetection';
import { AlertCircle, AlertTriangle, AlertOctagon, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface RiskSummaryPanelProps {
  result: RiskAnalysisResult | null;
  onRiskClick?: (risk: Risk) => void;
}

export const RiskSummaryPanel: React.FC<RiskSummaryPanelProps> = ({ result, onRiskClick }) => {
  if (!result) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No risk analysis results available. Run analysis to see risks.
      </div>
    );
  }

  const { risks, risksBySeverity, riskScore, executiveSummary, stats } = result;

  // Get color based on risk score
  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-red-500';
    if (score >= 4) return 'text-yellow-500';
    return 'text-green-500';
  };

  // Get icon based on severity
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'High':
        return <AlertOctagon className="h-4 w-4 text-red-500" />;
      case 'Medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'Low':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Executive Summary */}
      <div className="glass-card rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Risk Summary</h3>
        <div className="flex items-center gap-4 mb-3">
          <div className={`text-3xl font-bold ${getScoreColor(riskScore)}`}>
            {riskScore}/10
          </div>
          <Progress 
            value={riskScore * 10} 
            className="h-2" 
            indicatorClassName={riskScore >= 7 ? 'bg-red-500' : riskScore >= 4 ? 'bg-yellow-500' : 'bg-green-500'} 
          />
        </div>
        <p className="text-sm text-muted-foreground">{executiveSummary}</p>
      </div>

      {/* Risk Statistics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card rounded-lg p-3 text-center">
          <div className="flex justify-center mb-1">
            <AlertOctagon className="h-5 w-5 text-red-500" />
          </div>
          <div className="text-xl font-bold">{stats.highRisks}</div>
          <div className="text-xs text-muted-foreground">High Risk</div>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <div className="flex justify-center mb-1">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="text-xl font-bold">{stats.mediumRisks}</div>
          <div className="text-xs text-muted-foreground">Medium Risk</div>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <div className="flex justify-center mb-1">
            <AlertCircle className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-xl font-bold">{stats.lowRisks}</div>
          <div className="text-xs text-muted-foreground">Low Risk</div>
        </div>
      </div>

      {/* Risk List */}
      <div className="glass-card rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Detected Risks</h3>
        
        {/* High Risks */}
        {risksBySeverity.High.length > 0 && (
          <Accordion type="single" collapsible className="mb-3">
            <AccordionItem value="high-risks">
              <AccordionTrigger className="py-2">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="h-4 w-4 text-red-500" />
                  <span>High Severity Risks ({risksBySeverity.High.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {risksBySeverity.High.map((risk, index) => (
                    <div 
                      key={`high-${index}`}
                      className="glass-card rounded-lg p-2 cursor-pointer hover:bg-white/5"
                      onClick={() => onRiskClick && onRiskClick(risk)}
                    >
                      <div className="flex items-start gap-2">
                        <AlertOctagon className="h-4 w-4 text-red-500 mt-1" />
                        <div>
                          <div className="font-medium text-sm line-clamp-1">{risk.phrase}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{risk.explanation}</div>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20">
                              {risk.risk_type}
                            </Badge>
                            {risk.domain && (
                              <Badge variant="outline" className="text-xs bg-slate-500/10 hover:bg-slate-500/20">
                                {risk.domain}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        
        {/* Medium Risks */}
        {risksBySeverity.Medium.length > 0 && (
          <Accordion type="single" collapsible className="mb-3">
            <AccordionItem value="medium-risks">
              <AccordionTrigger className="py-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>Medium Severity Risks ({risksBySeverity.Medium.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {risksBySeverity.Medium.map((risk, index) => (
                    <div 
                      key={`medium-${index}`}
                      className="glass-card rounded-lg p-2 cursor-pointer hover:bg-white/5"
                      onClick={() => onRiskClick && onRiskClick(risk)}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-1" />
                        <div>
                          <div className="font-medium text-sm line-clamp-1">{risk.phrase}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{risk.explanation}</div>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20">
                              {risk.risk_type}
                            </Badge>
                            {risk.domain && (
                              <Badge variant="outline" className="text-xs bg-slate-500/10 hover:bg-slate-500/20">
                                {risk.domain}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        
        {/* Low Risks */}
        {risksBySeverity.Low.length > 0 && (
          <Accordion type="single" collapsible>
            <AccordionItem value="low-risks">
              <AccordionTrigger className="py-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <span>Low Severity Risks ({risksBySeverity.Low.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {risksBySeverity.Low.map((risk, index) => (
                    <div 
                      key={`low-${index}`}
                      className="glass-card rounded-lg p-2 cursor-pointer hover:bg-white/5"
                      onClick={() => onRiskClick && onRiskClick(risk)}
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-500 mt-1" />
                        <div>
                          <div className="font-medium text-sm line-clamp-1">{risk.phrase}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{risk.explanation}</div>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">
                              {risk.risk_type}
                            </Badge>
                            {risk.domain && (
                              <Badge variant="outline" className="text-xs bg-slate-500/10 hover:bg-slate-500/20">
                                {risk.domain}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        
        {/* No risks message */}
        {stats.totalRisks === 0 && (
          <div className="text-center p-4 text-muted-foreground">
            No risks detected in this document.
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskSummaryPanel; 