import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, X, Trash2, PlusCircle, Building, Package } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Material options for unit-level materials
const MATERIAL_OPTIONS = [
  { category: 'Corner Bead', items: ['Square Bead', 'Bullnose', 'Splay', 'Arch', 'Tearaway'] },
  { category: 'Joint Compound', items: ['All Purpose Joint Compound', 'Lite Weight Joint Compound', 'Easy Sand 90', 'Easy Sand 45', 'Easy Sand 20', 'Easy Sand 5'] },
  { category: 'Adhesives', items: ['TiteBond Foam', 'Spray Adhesive'] },
  { category: 'Fasteners', items: ['Drywall Screws 1"', 'Drywall Screws 1-1/4"', 'Drywall Screws 1-5/8"', 'Drywall Screws 2"', 'Drywall Screws 2-1/2"', 'Drywall Screws 3"'] },
  { category: 'Tape', items: ['500\' Paper Tape', '300\' Mesh Tape', 'No Coat 325'] },
  // Commercial material categories
  { category: 'Metal Studs', items: ['25 Gauge - 1-5/8"', '25 Gauge - 2-1/2"', '25 Gauge - 3-5/8"', '25 Gauge - 4"', '25 Gauge - 6"', '20 Gauge - 1-5/8"', '20 Gauge - 2-1/2"', '20 Gauge - 3-5/8"', '20 Gauge - 4"', '20 Gauge - 6"', '18 Gauge - 3-5/8"', '18 Gauge - 6"'] },
  { category: 'Metal Track', items: ['25 Gauge - 1-5/8"', '25 Gauge - 2-1/2"', '25 Gauge - 3-5/8"', '25 Gauge - 4"', '25 Gauge - 6"', '20 Gauge - 1-5/8"', '20 Gauge - 2-1/2"', '20 Gauge - 3-5/8"', '20 Gauge - 4"', '20 Gauge - 6"', '18 Gauge - 3-5/8"', '18 Gauge - 6"'] },
  { category: 'Acoustic Ceiling', items: ['2\'x2\' Tiles', '2\'x4\' Tiles', 'Main Runners', 'Cross Tees 4\'', 'Cross Tees 2\'', 'Wall Angle', 'Hanger Wire'] },
  { category: 'Suspended Drywall Grid', items: ['Main Runners', 'Cross Tees 4\'', 'Cross Tees 2\'', 'Wall Angle', 'Hanger Wire', 'Transition Molding'] },
  { category: 'FRP (Fiber Reinforced Panels)', items: ['4\'x8\' Panels', '4\'x10\' Panels', 'Divider Bars', 'Inside Corner', 'Outside Corner', 'FRP Adhesive'] },
  { category: 'Insulation', items: ['R-13 Batts', 'R-19 Batts', 'R-21 Batts', 'R-30 Batts', 'R-38 Batts', 'Sound Attenuation Batts', 'Rigid Insulation 1"', 'Rigid Insulation 2"'] },
  { category: 'Hat Channel', items: ['7/8" Hat Channel', '1-1/2" Hat Channel', 'Z-Furring Channel'] },
  { category: 'RC Channel', items: ['RC-1 Channel'] }
];

const EditTakeoffEntryModal = ({ isOpen, onClose, floorSpaceEntry, onSave, onDelete, jobType = 'residential' }) => {
  const [formData, setFormData] = useState({
    floorSpace: '',
    unitType: '',
    unitNumbers: '',
    notes: '',
    boards: [],
    materials: [] // Unit-level materials for commercial jobs
  });

  // Initialize form data when modal opens or floorSpaceEntry changes
  useEffect(() => {
    if (floorSpaceEntry) {
      setFormData({
        floorSpace: floorSpaceEntry.floorSpace || '',
        unitType: floorSpaceEntry.unitType || '',
        unitNumbers: floorSpaceEntry.unitNumbers || '',
        notes: floorSpaceEntry.notes || '',
        boards: floorSpaceEntry.boards?.map(board => ({ 
          ...board,
          boardType: board.boardType || '',
          thickness: board.thickness || '',
          width: board.width || '',
          length: board.length || '',
          quantity: board.quantity || ''
        })) || [],
        materials: floorSpaceEntry.materials?.map(material => ({
          ...material,
          id: material.id || `material-${Date.now()}-${Math.random()}`,
          type: material.type || '',
          subtype: material.subtype || '',
          length: material.length || '',
          threadType: material.threadType || '',
          quantity: material.quantity || '',
          unit: material.unit || 'pcs'
        })) || []
      });
    }
  }, [floorSpaceEntry]);

  const handleSave = () => {
    if (jobType === 'residential' && !formData.floorSpace.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a floor/space name.",
        variant: "destructive"
      });
      return;
    }

    if (jobType === 'commercial') {
      if (!formData.unitType.trim()) {
        toast({
          title: "Missing Information",
          description: "Please enter a unit type name.",
          variant: "destructive"
        });
        return;
      }
      
      if (!formData.unitNumbers.trim()) {
        toast({
          title: "Missing Information",
          description: "Please enter at least one unit number.",
          variant: "destructive"
        });
        return;
      }
    }

    const validBoards = formData.boards.filter(
      board => board.boardType && board.thickness && board.width && board.length && board.quantity
    );

    if (validBoards.length === 0) {
      toast({
        title: "Missing Board Information",
        description: "Please fill in all details for at least one board type.",
        variant: "destructive"
      });
      return;
    }

    // Validate materials for commercial jobs
    let validMaterials = [];
    if (jobType === 'commercial' && formData.materials.length > 0) {
      validMaterials = formData.materials.filter(m => {
        if (m.type === 'Corner Bead') {
          return m.type && m.subtype && m.length && m.quantity;
        }
        if (m.type === 'Fasteners') {
          return m.type && m.subtype && m.threadType && m.quantity;
        }
        if (m.type === 'Metal Studs' || m.type === 'Metal Track') {
          return m.type && m.subtype && m.length && m.threadType && m.quantity;
        }
        if (m.type === 'Hat Channel' || m.type === 'RC Channel') {
          return m.type && m.subtype && m.length && m.quantity;
        }
        if ((m.type === 'Suspended Drywall Grid' || m.type === 'Acoustic Ceiling') && 
            (m.subtype && (m.subtype.includes('Main') || m.subtype.includes('Runner') || 
                          m.subtype.includes('Cross') || m.subtype.includes('Wall')))) {
          return m.type && m.subtype && m.length && m.quantity;
        }
        return m.type && m.subtype && m.quantity;
      });
    }

    onSave({
      ...floorSpaceEntry,
      floorSpace: formData.floorSpace,
      unitType: formData.unitType,
      unitNumbers: formData.unitNumbers,
      notes: formData.notes,
      boards: validBoards,
      materials: jobType === 'commercial' ? validMaterials : undefined
    });
    onClose();
  };

  const addBoard = () => {
    setFormData(prev => ({
      ...prev,
      boards: [...prev.boards, {
        id: `board-${Date.now()}-${Math.random()}`,
        boardType: '',
        thickness: '',
        width: '',
        length: '',
        quantity: ''
      }]
    }));
  };

  const removeBoard = (boardId) => {
    if (formData.boards.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one board entry is required.",
        variant: "destructive"
      });
      return;
    }
    setFormData(prev => ({
      ...prev,
      boards: prev.boards.filter(board => board.id !== boardId)
    }));
  };

  const updateBoard = (boardId, field, value) => {
    setFormData(prev => ({
      ...prev,
      boards: prev.boards.map(board =>
        board.id === boardId ? { ...board, [field]: value } : board
      )
    }));
  };

  // Material management for commercial jobs
  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, {
        id: `material-${Date.now()}-${Math.random()}`,
        type: '',
        subtype: '',
        length: '',
        threadType: '',
        quantity: '',
        unit: 'pcs'
      }]
    }));
  };

  const removeMaterial = (materialId) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter(m => m.id !== materialId)
    }));
  };

  const updateMaterial = (materialId, field, value) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map(material =>
        material.id === materialId ? { ...material, [field]: value } : material
      )
    }));
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
    if (type === 'Metal Studs' || type === 'Metal Track') return ['pcs', 'bundle', 'linear ft'];
    if (type === 'Acoustic Ceiling') {
      if (type.includes('Tiles')) return ['box', 'pcs'];
      if (type.includes('Wire')) return ['roll', 'box'];
      return ['pcs', 'box', 'carton'];
    }
    if (type === 'Suspended Drywall Grid') {
      if (type.includes('Wire')) return ['roll', 'box'];
      return ['pcs', 'box', 'carton'];
    }
    if (type === 'FRP (Fiber Reinforced Panels)') {
      if (type.includes('Panels')) return ['pcs', 'pallet'];
      if (type.includes('Adhesive')) return ['bucket', 'tube'];
      return ['pcs', 'box'];
    }
    if (type === 'Insulation') {
      if (type.includes('Batts')) return ['bag', 'pallet', 'sqft'];
      if (type.includes('Rigid')) return ['sheet', 'bundle', 'sqft'];
      return ['bag', 'pcs'];
    }
    if (type === 'Hat Channel' || type === 'RC Channel') return ['pcs', 'bundle', 'linear ft'];
    return ['pcs'];
  };

  const getDefaultUnit = (type, subtype) => {
    if (type === 'Corner Bead') return 'pcs';
    if (type === 'Joint Compound') {
      if (subtype && subtype.includes('Easy Sand')) return 'Bags';
      if (subtype === 'All Purpose Joint Compound' || subtype === 'Lite Weight Joint Compound') return 'Box';
      return 'Bucket';
    }
    if (type === 'Adhesives') return 'Tube';
    if (type === 'Fasteners') return 'Box';
    if (type === 'Tape') return 'Roll';
    if (type === 'Metal Studs' || type === 'Metal Track') return 'pcs';
    if (type === 'Acoustic Ceiling') {
      if (subtype && subtype.includes('Tiles')) return 'box';
      if (subtype && subtype.includes('Wire')) return 'roll';
      return 'pcs';
    }
    if (type === 'Suspended Drywall Grid') {
      if (subtype && subtype.includes('Wire')) return 'roll';
      return 'pcs';
    }
    if (type === 'FRP (Fiber Reinforced Panels)') {
      if (subtype && subtype.includes('Panels')) return 'pcs';
      if (subtype && subtype.includes('Adhesive')) return 'bucket';
      return 'pcs';
    }
    if (type === 'Insulation') {
      if (subtype && subtype.includes('Batts')) return 'bag';
      if (subtype && subtype.includes('Rigid')) return 'sheet';
      return 'bag';
    }
    if (type === 'Hat Channel' || type === 'RC Channel') return 'pcs';
    return 'pcs';
  };

  const getLengthOptions = (type, subtype) => {
    if (type === 'Corner Bead') {
      if (subtype === 'Tearaway') return ['10\''];
      return ['12\'', '10\'', '9\'', '8\''];
    }
    if (type === 'Metal Studs' || type === 'Metal Track') {
      return ['8\'', '9\'', '10\'', '12\'', '14\'', '16\'', '20\'', '24\''];
    }
    if (type === 'Hat Channel' || type === 'RC Channel') {
      return ['8\'', '10\'', '12\''];
    }
    if (type === 'Suspended Drywall Grid' || type === 'Acoustic Ceiling') {
      if (subtype && (subtype.includes('Main') || subtype.includes('Runner'))) {
        return ['12\'', '14\''];
      }
      if (subtype && subtype.includes('Cross Tees')) {
        return ['2\'', '4\''];
      }
      if (subtype && subtype.includes('Wall Angle')) {
        return ['10\'', '12\''];
      }
    }
    return [];
  };

  const getThreadTypeOptions = (type) => {
    if (type === 'Fasteners') {
      return ['Coarse Thread', 'Fine Thread'];
    }
    if (type === 'Metal Studs' || type === 'Metal Track') {
      return ['Standard', 'EQ (Equivalent Gauge)', 'Structural'];
    }
    return [];
  };

  const shouldShowLength = (type) => {
    return type === 'Corner Bead' || 
           type === 'Metal Studs' || 
           type === 'Metal Track' || 
           type === 'Hat Channel' || 
           type === 'RC Channel' ||
           (type === 'Suspended Drywall Grid' && !type.includes('Wire')) ||
           (type === 'Acoustic Ceiling' && !type.includes('Tiles') && !type.includes('Wire'));
  };

  const shouldShowThreadType = (type) => {
    return type === 'Fasteners' || type === 'Metal Studs' || type === 'Metal Track';
  };

  if (!isOpen || !floorSpaceEntry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="h-full flex flex-col"
        >
        <DialogHeader className="pb-4 border-b bg-gradient-to-r from-brandPrimary to-brandSecondary text-white rounded-t-lg -m-6 mb-6 p-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Edit Takeoff Entry
              {jobType === 'commercial' && (
                <span className="ml-2 text-sm bg-white/20 px-2 py-1 rounded">Commercial Mode</span>
              )}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-5 w-5"/>
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto space-y-6">
          {jobType === 'residential' ? (
            <div>
              <Label htmlFor="floorSpace" className="text-lg font-semibold text-gray-700">
                Floor/Space Name *
              </Label>
              <Input
                id="floorSpace"
                value={formData.floorSpace}
                onChange={(e) => setFormData(prev => ({ ...prev, floorSpace: e.target.value }))}
                placeholder="e.g., 2nd Floor, Garage, Pool House Addition"
                className="border-2 focus:border-brandPrimary transition-colors mt-2"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="unitType" className="text-lg font-semibold text-gray-700">
                  Unit Type Name *
                </Label>
                <Input
                  id="unitType"
                  value={formData.unitType}
                  onChange={(e) => setFormData(prev => ({ ...prev, unitType: e.target.value }))}
                  placeholder="e.g., Type 1A, Studio, 2-Bedroom Corner"
                  className="border-2 focus:border-brandPrimary transition-colors mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="unitNumbers" className="text-lg font-semibold text-gray-700">
                  Unit Numbers *
                </Label>
                <div className="relative">
                  <Input
                    id="unitNumbers"
                    value={formData.unitNumbers}
                    onChange={(e) => setFormData(prev => ({ ...prev, unitNumbers: e.target.value }))}
                    placeholder="e.g., 501, 502, 503, 504, 505"
                    className="border-2 focus:border-brandPrimary transition-colors mt-2 pl-10"
                  />
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Enter comma-separated unit numbers that share this exact layout
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">Board Details</h3>
              <Button
                type="button"
                variant="outline"
                onClick={addBoard}
                className="border-dashed border-brandPrimary text-brandPrimary hover:bg-brandPrimary/5"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Board Type
              </Button>
            </div>
            
            {formData.boards.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 mb-4">No board entries yet</p>
                <Button
                  type="button"
                  onClick={addBoard}
                  className="bg-brandPrimary hover:bg-brandPrimary-600 text-white"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add First Board Entry
                </Button>
              </div>
            ) : (
              formData.boards.map((board, index) => (
                <motion.div 
                  key={board.id} 
                  className="p-4 border rounded-lg bg-slate-50 shadow-sm space-y-4 relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {formData.boards.length > 1 && (
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon"
                      className="absolute top-2 right-2 text-red-500 hover:bg-red-100"
                      onClick={() => removeBoard(board.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-8">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-600">Board Type *</Label>
                      <Select
                        value={board.boardType || ''}
                        onValueChange={(value) => updateBoard(board.id, 'boardType', value)}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-brandPrimary">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Moisture-Resistant">Moisture-Resistant</SelectItem>
                          <SelectItem value="Cement">Cement</SelectItem>
                          <SelectItem value="Fire-Resistant">Fire-Resistant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-600">Thickness *</Label>
                      <Select
                        value={board.thickness || ''}
                        onValueChange={(value) => updateBoard(board.id, 'thickness', value)}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-brandPrimary">
                          <SelectValue placeholder="Select thickness" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1/4">1/4"</SelectItem>
                          <SelectItem value="3/8">3/8"</SelectItem>
                          <SelectItem value="1/2">1/2"</SelectItem>
                          <SelectItem value="5/8">5/8"</SelectItem>
                          <SelectItem value="3/4">3/4"</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-600">Width *</Label>
                      <Select
                        value={board.width || ''}
                        onValueChange={(value) => updateBoard(board.id, 'width', value)}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-brandPrimary">
                          <SelectValue placeholder="Select width" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="48">48"</SelectItem>
                          <SelectItem value="54">54"</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-600">Length *</Label>
                      <Select
                        value={board.length || ''}
                        onValueChange={(value) => updateBoard(board.id, 'length', value)}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-brandPrimary">
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="8">8'</SelectItem>
                          <SelectItem value="9">9'</SelectItem>
                          <SelectItem value="10">10'</SelectItem>
                          <SelectItem value="12">12'</SelectItem>
                          <SelectItem value="14">14'</SelectItem>
                          <SelectItem value="16">16'</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-sm font-medium text-gray-600">Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={board.quantity}
                        onChange={(e) => updateBoard(board.id, 'quantity', e.target.value)}
                        placeholder="Enter quantity"
                        className="border-gray-300 focus:border-brandPrimary"
                      />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Unit-level materials section for commercial jobs */}
          {jobType === 'commercial' && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">Unit-Specific Materials</h3>
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
              
              {formData.materials.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <Package className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500 mb-3">No unit-specific materials added yet</p>
                  <Button
                    type="button"
                    onClick={addMaterial}
                    className="bg-brandPrimary hover:bg-brandPrimary-600 text-white"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add First Material
                  </Button>
                </div>
              ) : (
                formData.materials.map((material, index) => (
                  <motion.div 
                    key={material.id} 
                    className="p-4 border rounded-lg bg-blue-50 shadow-sm space-y-4 relative"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-700">Unit Material #{index + 1}</span>
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
                    
                    <div className={`grid grid-cols-1 gap-4 ${
                      shouldShowLength(material.type) && shouldShowThreadType(material.type) 
                        ? 'md:grid-cols-6' 
                        : shouldShowLength(material.type) || shouldShowThreadType(material.type)
                        ? 'md:grid-cols-5' 
                        : 'md:grid-cols-4'
                    }`}>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-600">Material Type *</Label>
                        <Select
                          value={material.type || ''}
                          onValueChange={(value) => {
                            updateMaterial(material.id, 'type', value);
                            updateMaterial(material.id, 'subtype', '');
                            updateMaterial(material.id, 'length', '');
                            updateMaterial(material.id, 'threadType', '');
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
                            if (material.type === 'Corner Bead') {
                              updateMaterial(material.id, 'length', '');
                            }
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
                          <Label className="text-sm font-medium text-gray-600">
                            {material.type === 'Metal Studs' || material.type === 'Metal Track' 
                              ? 'Structural Grade *' 
                              : 'Thread Type *'}
                          </Label>
                          <Select
                            value={material.threadType || ''}
                            onValueChange={(value) => updateMaterial(material.id, 'threadType', value)}
                            disabled={!material.subtype}
                          >
                            <SelectTrigger className="border-gray-300 focus:border-brandPrimary">
                              <SelectValue placeholder={material.type === 'Metal Studs' || material.type === 'Metal Track' 
                                ? 'Select grade' 
                                : 'Select thread'} />
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
                ))
              )}
            </div>
          )}

          <div>
            <Label htmlFor="notes" className="text-lg font-semibold text-gray-700">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or specifications for this floor/space"
              className="border-2 focus:border-brandPrimary transition-colors mt-2 min-h-[80px]"
            />
          </div>
        </div>
        
        <DialogFooter className="pt-6 border-t bg-gray-50 rounded-b-lg -m-6 mt-6 p-6">
          <Button variant="outline" onClick={onClose} className="hover:bg-gray-100">
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => {
              onDelete(floorSpaceEntry.id);
              onClose();
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete Entry
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white hover:opacity-90">
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTakeoffEntryModal;