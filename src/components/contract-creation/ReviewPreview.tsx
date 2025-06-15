
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Calendar, Users, AlertCircle } from 'lucide-react';

interface ReviewPreviewProps {
  contractData: any;
  extractedData?: any;
}

const ReviewPreview: React.FC<ReviewPreviewProps> = ({ contractData, extractedData }) => {
  // Handle the case where contractData might not have the expected structure
  const basicInfo = contractData.basicInfo || contractData || {};
  const dynamicFields = contractData.dynamicFields || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review & Preview</h2>
        <p className="text-muted-foreground">
          Review your contract details before generating the final document
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contract Summary */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Contract Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">


            <div>
              <span className="text-sm font-medium">Title</span>
              <p className="text-sm text-muted-foreground mt-1">
                {basicInfo.title || 'Not specified'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">First Party</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {basicInfo.party1 || 'Not specified'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium">Second Party</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {basicInfo.party2 || 'Not specified'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">Priority</span>
                <Badge 
                  variant={
                    basicInfo.priority === 'urgent' ? 'destructive' :
                    basicInfo.priority === 'high' ? 'default' :
                    'secondary'
                  }
                  className="mt-1"
                >
                  {basicInfo.priority || 'Not specified'}
                </Badge>
              </div>
              <div>
                <span className="text-sm font-medium">Effective Date</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {basicInfo.effectiveDate ? 
                    new Date(basicInfo.effectiveDate).toLocaleDateString() : 
                    'Not specified'
                  }
                </p>
              </div>
            </div>

            {basicInfo.description && (
              <div>
                <span className="text-sm font-medium">Description</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {basicInfo.description}
                </p>
              </div>
            )}

            {extractedData && extractedData.originalFileName && (
              <div>
                <span className="text-sm font-medium">Uploaded Document</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {extractedData.originalFileName}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contract Fields */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Contract Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(dynamicFields).length > 0 ? (
              Object.entries(dynamicFields).map(([key, value]) => (
                <div key={key}>
                  <span className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {value as string || 'Not specified'}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>No additional details provided</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Document Preview */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Document Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-6 min-h-[300px] border-2 border-dashed border-muted">
            <div className="space-y-4 text-sm">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold">
                  {basicInfo.title || 'CONTRACT TITLE'}
                </h3>
                <p className="text-muted-foreground">
                  Between {basicInfo.party1 || '[FIRST PARTY]'} and {basicInfo.party2 || '[SECOND PARTY]'}
                </p>
              </div>
              
              <div className="space-y-2">
                <p><strong>Effective Date:</strong> {basicInfo.effectiveDate || '[DATE]'}</p>
                <p><strong>Contract Type:</strong> {basicInfo.type || '[TYPE]'}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Terms and Conditions:</h4>
                <p className="text-muted-foreground">
                  {basicInfo.description || extractedData?.extractedText?.substring(0, 200) + '...' || '[Contract terms and conditions will be generated based on your inputs...]'}
                </p>
              </div>

              {Object.keys(dynamicFields).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Additional Details:</h4>
                  {Object.entries(dynamicFields).map(([key, value]) => (
                    <p key={key} className="text-muted-foreground">
                      <strong>{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> {value as string}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            This is a preview. The final document will include proper legal formatting and additional clauses.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewPreview;
