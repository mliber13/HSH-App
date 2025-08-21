import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  FileText, 
  PenTool, 
  CheckCircle, 
  X,
  Download,
  Eye
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const DocumentSignature = ({ document, employee, onSign, onClose }) => {
  const [signature, setSignature] = useState('');
  const [signatureDate, setSignatureDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSigning, setIsSigning] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureData(null);
    }
  };

  const handleSign = async () => {
    if (!signature.trim() && !signatureData) {
      toast({
        title: "Signature Required",
        description: "Please provide either a typed signature or draw your signature.",
        variant: "destructive"
      });
      return;
    }

    setIsSigning(true);

    try {
      const signatureInfo = {
        documentId: document.id,
        documentName: document.name,
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        signature: signature || 'Digital Signature',
        signatureImage: signatureData,
        signatureDate: signatureDate,
        signedAt: new Date().toISOString()
      };

      await onSign(signatureInfo);
      
      toast({
        title: "Document Signed",
        description: `${document.name} has been successfully signed.`,
      });
    } catch (error) {
      toast({
        title: "Signing Failed",
        description: "There was an error signing the document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <PenTool className="h-5 w-5 mr-2 text-blue-600" />
            Sign Document - {document.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 mr-2" />
                Document Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Document Name</Label>
                <p className="font-semibold">{document.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <p className="text-gray-600">{document.description}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Employee</Label>
                <p className="font-semibold">{employee.firstName} {employee.lastName}</p>
              </div>
            </CardContent>
          </Card>

          {/* Signature Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Digital Signature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Typed Signature */}
              <div>
                <Label htmlFor="signature" className="text-sm font-medium text-gray-700">
                  Type Your Signature
                </Label>
                <Input
                  id="signature"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Type your full name as signature"
                  className="mt-1"
                />
              </div>

              {/* Drawn Signature */}
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Draw Your Signature (Optional)
                </Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={150}
                    className="border border-gray-200 rounded cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                  <div className="flex space-x-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSignature}
                    >
                      Clear
                    </Button>
                    {signatureData && (
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Signature captured</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Signature Date */}
              <div>
                <Label htmlFor="signatureDate" className="text-sm font-medium text-gray-700">
                  Date of Signature
                </Label>
                <Input
                  id="signatureDate"
                  type="date"
                  value={signatureDate}
                  onChange={(e) => setSignatureDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Legal Notice */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Legal Notice</p>
                  <p className="mt-1">
                    By signing this document, you acknowledge that you have read, understood, and agree to the terms and conditions outlined in this document. 
                    This electronic signature has the same legal effect as a handwritten signature.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSign}
            disabled={isSigning || (!signature.trim() && !signatureData)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isSigning ? 'Signing...' : 'Sign Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentSignature;
