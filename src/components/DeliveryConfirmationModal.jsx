import React, { useState } from 'react';
import { 
  CheckCircle, 
  X, 
  Camera, 
  Save,
  Package,
  MapPin,
  Calendar,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import supplierService from '@/services/supplierService';

const DeliveryConfirmationModal = ({ 
  isOpen, 
  onClose, 
  takeoffRequest,
  onDeliveryConfirmed 
}) => {
  const [deliveryData, setDeliveryData] = useState({
    notes: '',
    photos: [],
    confirmedBy: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !takeoffRequest) return null;

  const handleConfirmDelivery = async () => {
    if (!deliveryData.confirmedBy.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your name to confirm delivery.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = supplierService.confirmDelivery(takeoffRequest.id, deliveryData);
      
      if (result) {
        toast({
          title: "Delivery Confirmed! ✅",
          description: `Delivery for ${takeoffRequest.jobName} has been confirmed.`
        });
        
        setDeliveryData({ notes: '', photos: [], confirmedBy: '' });
        if (onDeliveryConfirmed) {
          onDeliveryConfirmed(result);
        }
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    // In a real app, you'd upload these to a server
    // For now, we'll just store the file names
    const photoNames = files.map(file => file.name);
    setDeliveryData(prev => ({
      ...prev,
      photos: [...prev.photos, ...photoNames]
    }));
  };

  const formatMaterialList = (materials) => {
    if (!materials || materials.length === 0) return 'No materials specified';
    
    return materials.map(material => {
      const quantity = material.quantity || 0;
      const unit = material.unit || 'ea';
      return `${material.name}: ${quantity} ${unit}`;
    }).join(', ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-green-800">Confirm Delivery</CardTitle>
                <p className="text-green-600 text-sm">Confirm that materials have been delivered to the job site</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Job Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Job Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Job Name</p>
                  <p className="font-medium">{takeoffRequest.jobName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Delivery Address</p>
                  <p className="font-medium">{takeoffRequest.deliveryAddress}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Needed By</p>
                  <p className="font-medium">
                    {takeoffRequest.neededBy 
                      ? new Date(takeoffRequest.neededBy).toLocaleDateString()
                      : 'Not specified'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Materials</p>
                  <p className="font-medium text-sm max-w-xs truncate">
                    {formatMaterialList(takeoffRequest.materials)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Confirmation Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirmed-by">Your Name *</Label>
              <Input
                id="confirmed-by"
                value={deliveryData.confirmedBy}
                onChange={(e) => setDeliveryData({...deliveryData, confirmedBy: e.target.value})}
                placeholder="Enter your name to confirm delivery"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery-notes">Delivery Notes</Label>
              <Textarea
                id="delivery-notes"
                value={deliveryData.notes}
                onChange={(e) => setDeliveryData({...deliveryData, notes: e.target.value})}
                placeholder="Any special notes about the delivery, condition of materials, etc."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery-photos">Delivery Photos (Optional)</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('photo-upload').click()}
                  disabled={isSubmitting}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Add Photos
                </Button>
                <input
                  id="photo-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <span className="text-sm text-gray-500">
                  {deliveryData.photos.length} photo(s) selected
                </span>
              </div>
              {deliveryData.photos.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-2">Selected Photos:</p>
                  <div className="flex flex-wrap gap-2">
                    {deliveryData.photos.map((photo, index) => (
                      <div key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {photo}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelivery} 
              disabled={isSubmitting || !deliveryData.confirmedBy.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Delivery
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryConfirmationModal;
