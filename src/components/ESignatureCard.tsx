
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pen, Upload, Type, Save, Trash2 } from 'lucide-react';

const ESignatureCard = () => {
  const [signatureType, setSignatureType] = useState<'draw' | 'upload' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedSignature(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSignature = () => {
    console.log('Signature saved');
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pen className="w-5 h-5" />
          E-Signature
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="draw" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="draw">Draw</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="type">Type</TabsTrigger>
          </TabsList>
          
          <TabsContent value="draw" className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <canvas
                ref={canvasRef}
                width={300}
                height={120}
                className="border rounded w-full h-32 cursor-crosshair bg-white"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearCanvas}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button onClick={saveSignature}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-4">
            <div>
              <Label htmlFor="signature-upload">Upload Signature Image</Label>
              <Input
                id="signature-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="mt-2"
              />
            </div>
            {uploadedSignature && (
              <div className="border rounded-lg p-4">
                <img src={uploadedSignature} alt="Signature" className="max-h-32" />
              </div>
            )}
            <Button onClick={saveSignature} disabled={!uploadedSignature}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </TabsContent>
          
          <TabsContent value="type" className="space-y-4">
            <div>
              <Label htmlFor="typed-signature">Type Your Name</Label>
              <Input
                id="typed-signature"
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                placeholder="Enter your full name"
                className="mt-2 text-2xl font-script"
                style={{ fontFamily: 'cursive' }}
              />
            </div>
            <Button onClick={saveSignature} disabled={!typedSignature}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ESignatureCard;
