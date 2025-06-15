
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/components/access/AuthProvider';
import { Trash2, Download } from 'lucide-react';

interface SavedSignature {
  id: string;
  userId: string;
  signatureData: string;
  name: string;
  createdAt: string;
}

const ESignatureStorage = () => {
  const { user } = useAuth();
  const [signatures, setSignatures] = useState<SavedSignature[]>([]);
  const [signatureName, setSignatureName] = useState('');
  const [currentSignature, setCurrentSignature] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadSignatures();
    }
  }, [user]);

  const loadSignatures = () => {
    const savedSignatures = localStorage.getItem(`signatures_${user?.id}`);
    if (savedSignatures) {
      setSignatures(JSON.parse(savedSignatures));
    }
  };

  const saveSignature = () => {
    if (!currentSignature || !signatureName.trim() || !user) {
      toast({
        title: "Error",
        description: "Please create a signature and provide a name",
        variant: "destructive"
      });
      return;
    }

    const newSignature: SavedSignature = {
      id: Date.now().toString(),
      userId: user.id,
      signatureData: currentSignature,
      name: signatureName.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedSignatures = [...signatures, newSignature];
    setSignatures(updatedSignatures);
    localStorage.setItem(`signatures_${user.id}`, JSON.stringify(updatedSignatures));
    
    setSignatureName('');
    setCurrentSignature('');
    
    toast({
      title: "Success",
      description: "Signature saved successfully",
    });
  };

  const deleteSignature = (id: string) => {
    const updatedSignatures = signatures.filter(sig => sig.id !== id);
    setSignatures(updatedSignatures);
    localStorage.setItem(`signatures_${user?.id}`, JSON.stringify(updatedSignatures));
    
    toast({
      title: "Success",
      description: "Signature deleted successfully",
    });
  };

  const downloadSignature = (signature: SavedSignature) => {
    const link = document.createElement('a');
    link.download = `${signature.name}_signature.png`;
    link.href = signature.signatureData;
    link.click();
  };

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle>E-Signature Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Signature Canvas Area */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
            <canvas
              id="signatureCanvas"
              width={400}
              height={150}
              className="border border-white/10 rounded mx-auto cursor-crosshair"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
              onMouseDown={(e) => {
                const canvas = e.currentTarget;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.beginPath();
                  ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                  canvas.addEventListener('mousemove', draw);
                  canvas.addEventListener('mouseup', stopDrawing);
                }
              }}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Click and drag to create your signature
            </p>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Signature name"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              className="glass-card border-white/10"
            />
            <Button 
              onClick={() => {
                const canvas = document.getElementById('signatureCanvas') as HTMLCanvasElement;
                setCurrentSignature(canvas.toDataURL());
              }}
              variant="outline"
              className="glass-card border-white/10"
            >
              Capture
            </Button>
            <Button 
              onClick={() => {
                const canvas = document.getElementById('signatureCanvas') as HTMLCanvasElement;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  setCurrentSignature('');
                }
              }}
              variant="outline"
              className="glass-card border-white/10"
            >
              Clear
            </Button>
            <Button onClick={saveSignature}>
              Save Signature
            </Button>
          </div>
        </div>

        {/* Saved Signatures */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Saved Signatures</h3>
          {signatures.length === 0 ? (
            <p className="text-muted-foreground">No signatures saved yet.</p>
          ) : (
            <div className="grid gap-4">
              {signatures.map((signature) => (
                <div key={signature.id} className="glass-card border-white/10 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={signature.signatureData} 
                      alt={signature.name}
                      className="h-12 w-24 object-contain border border-white/10 rounded"
                    />
                    <div>
                      <p className="font-medium">{signature.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(signature.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadSignature(signature)}
                      className="glass-card border-white/10"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSignature(signature.id)}
                      className="glass-card border-white/10 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  function draw(e: MouseEvent) {
    const canvas = e.target as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'currentColor';
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
    }
  }

  function stopDrawing(e: MouseEvent) {
    const canvas = e.target as HTMLCanvasElement;
    canvas.removeEventListener('mousemove', draw);
    canvas.removeEventListener('mouseup', stopDrawing);
  }
};

export default ESignatureStorage;
