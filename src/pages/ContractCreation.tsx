
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, FileIcon, ArrowLeft } from 'lucide-react';

import BasicInformation from '@/components/contract-creation/BasicInformation';
import DocumentUpload from '@/components/contract-creation/DocumentUpload';

import ReviewPreview from '@/components/contract-creation/ReviewPreview';
import { useContracts } from '@/hooks/useContracts';
import { useToast } from '@/hooks/use-toast';

interface ExtractedData {
  title?: string;
  extractedText?: string;
  originalFileName?: string;
  fileSize?: number;
  processingStatus?: string;
  storageUrl?: string;
}

const ContractCreation = () => {
  const navigate = useNavigate();
  const { createContract } = useContracts();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [creationMethod, setCreationMethod] = useState<'upload' | 'blank'>('upload');

  const [contractData, setContractData] = useState<any>({});
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData>({});

  const steps = [
    { title: 'Method', description: 'Choose creation method' },
    { title: 'Details', description: 'Contract information' },
    { title: 'Review', description: 'Review and create' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDocumentUpload = (file: File | null, data: ExtractedData) => {
    setUploadedDocument(file);
    setExtractedData(data);
    
    // Automatically populate contract data from extracted content
    if (data.title) {
      setContractData((prev: any) => ({
        ...prev,
        title: data.title,
        original_file_name: data.originalFileName,
        original_file_size: data.fileSize,
        extracted_content: data.extractedText,
        processing_status: data.processingStatus
      }));
    }
  };

  const handleCreateContract = async () => {
    try {
      const finalContractData = {
        ...contractData,
        ...(creationMethod === 'upload' ? {
          original_file_name: extractedData.originalFileName,
          original_file_size: extractedData.fileSize,
          extracted_content: extractedData.extractedText,
          processing_status: extractedData.processingStatus || 'completed'
        } : {})
      };

      const result = await createContract(finalContractData);
      
      if (result) {
        toast({
          title: "Success",
          description: "Contract created successfully",
        });
        navigate(`/contracts/${result.id}`);
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      toast({
        title: "Error",
        description: "Failed to create contract",
        variant: "destructive",
      });
    }
  };

  const renderMethodSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card 
        className={`cursor-pointer transition-all hover:shadow-lg ${
          creationMethod === 'upload' ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => setCreationMethod('upload')}
      >
        <CardHeader className="text-center">
          <Upload className="w-12 h-12 mx-auto text-primary mb-4" />
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>
            Upload an existing PDF or Word document
          </CardDescription>
        </CardHeader>
      </Card>

      <Card 
        className={`cursor-pointer transition-all hover:shadow-lg ${
          creationMethod === 'blank' ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => setCreationMethod('blank')}
      >
        <CardHeader className="text-center">
          <FileText className="w-12 h-12 mx-auto text-primary mb-4" />
          <CardTitle>Start Blank</CardTitle>
          <CardDescription>
            Create a contract from scratch
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );

  const renderStepContent = () => {
    if (currentStep === 0) {
      return renderMethodSelection();
    }

    if (currentStep === 1) {
      switch (creationMethod) {
        case 'upload':
          return (
            <DocumentUpload
              onDocumentUpload={handleDocumentUpload}
              uploadedDocument={uploadedDocument}
              extractedData={extractedData}
            />
          );
        case 'blank':
          return (
            <BasicInformation 
              data={contractData}
              onChange={setContractData}
            />
          );
        default:
          return null;
      }
    }

    if (currentStep === 2) {
      return (
        <ReviewPreview 
          contractData={contractData}
          extractedData={extractedData}
        />
      );
    }

    return null;
  };

  const canProceed = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) {
      if (creationMethod === 'upload') return uploadedDocument && Object.keys(extractedData).length > 0;
      if (creationMethod === 'blank') return contractData.title;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/contracts')}
            className="mb-4 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Contracts
          </Button>
          
          <h1 className="text-3xl font-bold text-white mb-2">Create New Contract</h1>
          <p className="text-slate-300">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? 'bg-primary text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="ml-2">
                  <div className="text-sm font-medium text-white">{step.title}</div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      index < currentStep ? 'bg-primary' : 'bg-slate-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="glass-card mb-8">
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="glass-card border-white/10"
          >
            Back
          </Button>
          
          <div className="space-x-4">
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-primary hover:bg-primary/90"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleCreateContract}
                disabled={!canProceed()}
                className="bg-primary hover:bg-primary/90"
              >
                Create Contract
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractCreation;
