import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X, Package, PlusCircle, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const MATERIAL_OPTIONS = [
  { category: 'Corner Bead', items: ['Square Bead', 'Bullnose', 'Splay', 'Arch', 'Tearaway'] },
  { category: 'Joint Compound', items: ['All Purpose Joint Compound', 'Lite Weight Joint Compound', 'Easy Sand 90', 'Easy Sand 45', 'Easy Sand 20', 'Easy Sand 5'] },
  { category: 'Adhesives', items: ['TiteBond Foam', 'Spray Adhesive'] },
  { category: 'Fasteners', items: ['Drywall Screws 1"', 'Drywall Screws 1-1/4"', 'Drywall Screws 1-5/8"', 'Drywall Screws 2"', 'Drywall Screws 2-1/2"', 'Drywall Screws 3"'] },
  { category: 'Tape', items: ['500\' Paper Tape', '300\' Mesh Tape', 'No Coat 325'] }
];

const PhaseMaterialsModal = ({ isOpen, onClose, phase, onSave }) => {
  const [materials, setMaterials] = useState([]);
  const [materialTypeFilter, setMaterialTypeFilter] = useState('all');
  const materialsContainerRef = useRef(null);

  // Initialize materials when modal opens or phase changes
  useEffect(() => {
    if (phase && isOpen) {
      setMaterials(phase.materials ? phase.materials.map(material => ({
        ...material,
        type: material.type || '',
        subtype: material.subtype || '',
        length: material.length || '',
        threadType: material.threadType || '',
        quantity: material.quantity || '',
        unit: material.unit || 'pcs'
      })) : []);
    }
  }, [phase, isOpen]);

  const addMaterial = () => {
    const newMaterialId = `material-${Date.now()}-${Math.random()}`;
    setMaterials(prev => [...prev, {
      id: newMaterialId,
      type: '',
      subtype: '',
      length: '',
      threadType: '',
      quantity: '',
      unit: 'pcs'
    }]);
    
    // Auto-scroll to the newly added material after a short delay
    setTimeout(() => {
      if (materialsContainerRef.current) {
        const newMaterialElement = materialsContainerRef.current.querySelector(`[data-material-id="${newMaterialId}"]`);
        if (newMaterialElement) {
          newMaterialElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }
    }, 100);
  };

  const removeMaterial = (materialId) => {
    setMaterials(prev => prev.filter(m => m.id !== materialId));
  };

  const updateMaterial = (materialId, field, value) => {
    setMaterials(prev => prev.map(material =>
      material.id === materialId ? { ...material, [field]: value } : material
    ));
  };

  const handleSave = () => {
    const validMaterials = materials.filter(m => {
      if (m.type === 'Corner Bead') {
        return m.type && m.subtype && m.length && m.quantity;
      }
      if (m.type === 'Fasteners') {
        return m.type && m.subtype && m.threadType && m.quantity;
      }
      return m.type && m.subtype && m.quantity;
    });
    onSave(phase.id, validMaterials);
    toast({
      title: "Phase Materials Updated! 📦",
      description: `Materials for ${phase.name} have been saved successfully.`
    });
    onClose();
  };

  const getSubtypeOptions = (type) => {
    const category = MATERIAL_OPTIONS.find(cat => cat.category === type);
    return category ? category.items : [];
  };

  const getUnitOptions = (type) => {
    if (type === 'Corner Bead') return ['pcs'];
    if (type === 'Joint Compound') return ['Bucket', 'Box', 'Bags'];
    if (type === 'Adhesives') return ['Tube', 'Can', 'Gallon'];
    if (type === 'Fasteners') return ['Box', 'lbs', 'pcs'];
    if (type === 'Tape') return ['Roll'];
    return ['pcs'];
  };

  const getDefaultUnit = (type, subtype) => {
    if (type === 'Corner Bead') return 'pcs';
    if (type === 'Joint Compound') {
      // Easy Sand products default to Bags
      if (subtype && subtype.includes('Easy Sand')) {
        return 'Bags';
      }
      // All Purpose and Lite Weight default to Box
      if (subtype === 'All Purpose Joint Compound' || subtype === 'Lite Weight Joint Compound') {
        return 'Box';
      }
      return 'Bucket'; // fallback
    }
    if (type === 'Adhesives') return 'Tube';
    if (type === 'Fasteners') return 'Box';
    if (type === 'Tape') return 'Roll';
    return 'pcs';
  };

  const getLengthOptions = (type, subtype) => {
    if (type === 'Corner Bead') {
      if (subtype === 'Tearaway') {
        return ['10\''];
      }
      return ['12\'', '10\'', '9\'', '8\''];
    }
    return [];
  };

  const getThreadTypeOptions = (type) => {
    if (type === 'Fasteners') {
      return ['Coarse Thread', 'Fine Thread'];
    }
    return [];
  };

  const shouldShowLength = (type) => {
    return type === 'Corner Bead';
  };

  const shouldShowThreadType = (type) => {
    return type === 'Fasteners';
  };

  // Filter materials by type
  const filteredMaterials = materialTypeFilter === 'all' 
    ? materials 
    : materials.filter(m => m.type === materialTypeFilter);

  // Get unique material types from current materials
  const uniqueMaterialTypes = [
    'all', 
    ...MATERIAL_OPTIONS.map(option => option.category),
    ...new Set(materials.map(m => m.type).filter(Boolean).filter(type => 
      !MATERIAL_OPTIONS.some(option => option.category === type)
    ))
  ];

  if (!isOpen || !phase) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-6xl h-[90vh] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="pb-4 border-b bg-gradient-to-r from-brandPrimary to-brandSecondary text-white rounded-t-lg -m-6 mb-6 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="h-6 w-6" />
              <DialogTitle className="text-xl md:text-2xl font-bold">Phase Materials - {phase.name}</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-5 w-5"/>
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-700">Materials for this Phase</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={materialTypeFilter} onValueChange={setMaterialTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Material Types</SelectItem>
                  {uniqueMaterialTypes.filter(t => t !== 'all').map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                onClick={addMaterial}
                className="border-dashed border-brandPrimary text-brandPrimary hover:bg-brandPrimary/5"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </div>
          </div>

          {materials.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 mb-4">No materials added yet. Click "Add Material" to get started.</p>
              <Button
                type="button"
                onClick={addMaterial}
                className="bg-brandPrimary hover:bg-brandPrimary-600 text-white"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add First Material
              </Button>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No materials match the selected filter.</p>
              <Button
                type="button"
                onClick={() => setMaterialTypeFilter('all')}
                className="mt-2"
                variant="outline"
              >
                Show All Materials
              </Button>
            </div>
          ) : (
            <div ref={materialsContainerRef} className="space-y-4">
              {filteredMaterials.map((material, index) => (
                <motion.div 
                  key={material.id} 
                  data-material-id={material.id}
                  className="p-4 border rounded-lg bg-slate-50 shadow-sm space-y-4 relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Material #{index + 1}</span>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:bg-red-100"
                      onClick={() => removeMaterial(material.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 ${
                    shouldShowLength(material.type) && shouldShowThreadType(material.type) 
                      ? 'xl:grid-cols-6' 
                      : shouldShowLength(material.type) || shouldShowThreadType(material.type)
                      ? 'xl:grid-cols-5' 
                      : 'xl:grid-cols-4'
                  }`}>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-600">Material Type *</Label>
                      <Select
                        value={material.type || ''}
                        onValueChange={(value) => {
                          updateMaterial(material.id, 'type', value);
                          updateMaterial(material.id, 'subtype', ''); // Reset subtype when type changes
                          updateMaterial(material.id, 'length', ''); // Reset length when type changes
                          updateMaterial(material.id, 'threadType', ''); // Reset thread type when type changes
                          const defaultUnit = getDefaultUnit(value, '');
                          updateMaterial(material.id, 'unit', defaultUnit);
                        }}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-brandPrimary">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {MATERIAL_OPTIONS.map(category => (
                            <SelectItem key={category.category} value={category.category}>
                              {category.category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-600">Specific Item *</Label>
                      <Select
                        value={material.subtype || ''}
                        onValueChange={(value) => {
                          updateMaterial(material.id, 'subtype', value);
                          // Reset length when subtype changes for corner bead
                          if (material.type === 'Corner Bead') {
                            updateMaterial(material.id, 'length', '');
                          }
                          // Update unit based on specific subtype for Joint Compound
                          if (material.type === 'Joint Compound') {
                            const defaultUnit = getDefaultUnit(material.type, value);
                            updateMaterial(material.id, 'unit', defaultUnit);
                          }
                        }}
                        disabled={!material.type}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-brandPrimary">
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {getSubtypeOptions(material.type).map(item => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {shouldShowLength(material.type) && (
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-600">Length *</Label>
                        <Select
                          value={material.length || ''}
                          onValueChange={(value) => updateMaterial(material.id, 'length', value)}
                          disabled={!material.subtype}
                        >
                          <SelectTrigger className="border-gray-300 focus:border-brandPrimary">
                            <SelectValue placeholder="Select length" />
                          </SelectTrigger>
                          <SelectContent>
                            {getLengthOptions(material.type, material.subtype).map(length => (
                              <SelectItem key={length} value={length}>
                                {length}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {shouldShowThreadType(material.type) && (
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-600">Thread Type *</Label>
                        <Select
                          value={material.threadType || ''}
                          onValueChange={(value) => updateMaterial(material.id, 'threadType', value)}
                          disabled={!material.subtype}
                        >
                          <SelectTrigger className="border-gray-300 focus:border-brandPrimary">
                            <SelectValue placeholder="Select thread" />
                          </SelectTrigger>
                          <SelectContent>
                            {getThreadTypeOptions(material.type).map(threadType => (
                              <SelectItem key={threadType} value={threadType}>
                                {threadType}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-600">Quantity *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={material.quantity}
                        onChange={(e) => updateMaterial(material.id, 'quantity', e.target.value)}
                        placeholder="Enter quantity"
                        className="border-gray-300 focus:border-brandPrimary"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-600">Unit</Label>
                      <Select
                        value={material.unit || 'pcs'}
                        onValueChange={(value) => updateMaterial(material.id, 'unit', value)}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-brandPrimary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getUnitOptions(material.type).map(unit => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter className="pt-6 border-t bg-gray-50 rounded-b-lg -m-6 mt-6 p-6 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} className="hover:bg-gray-100 w-full sm:w-auto">
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white hover:opacity-90 w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" /> Save Materials
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhaseMaterialsModal;