import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Ruler, Save, X, PlusCircle, Trash2, Building, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { useJobs } from '@/hooks/useJobs';

const initialBoardEntry = {
  boardType: '',
  thickness: '',
  width: '',
  length: '',
  quantity: '',
};

const initialMaterialEntry = {
  type: '',
  subtype: '',
  length: '',
  threadType: '',
  quantity: '',
  unit: 'pcs'
};

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

const CreateTakeoffForm = ({ jobId, phaseId, onSubmit, onCancel }) => {
  const { jobs } = useJobs();
  const job = jobs.find(j => j.id === jobId) || {};
  const jobType = job.jobType || 'residential';

  const [floorSpace, setFloorSpace] = useState('');
  const [unitType, setUnitType] = useState('');
  const [unitNumbers, setUnitNumbers] = useState('');
  const [boardEntries, setBoardEntries] = useState([{ ...initialBoardEntry, id: Date.now() }]);
  const [materialEntries, setMaterialEntries] = useState([]);
  const [notes, setNotes] = useState('');

  const handleAddBoardEntry = () => {
    setBoardEntries([...boardEntries, { ...initialBoardEntry, id: Date.now() }]);
  };

  const handleRemoveBoardEntry = (id) => {
    if (boardEntries.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one board entry is required.",
        variant: "destructive"
      });
      return;
    }
    setBoardEntries(boardEntries.filter(entry => entry.id !== id));
  };

  const handleBoardEntryChange = (id, field, value) => {
    setBoardEntries(
      boardEntries.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  // Material management for commercial jobs
  const handleAddMaterialEntry = () => {
    setMaterialEntries([...materialEntries, { ...initialMaterialEntry, id: Date.now() }]);
  };

  const handleRemoveMaterialEntry = (id) => {
    setMaterialEntries(materialEntries.filter(entry => entry.id !== id));
  };

  const handleMaterialEntryChange = (id, field, value) => {
    setMaterialEntries(
      materialEntries.map(entry => {
        if (entry.id === id) {
          const updatedEntry = { ...entry, [field]: value };
          
          // Reset dependent fields when type changes
          if (field === 'type') {
            updatedEntry.subtype = '';
            updatedEntry.length = '';
            updatedEntry.threadType = '';
            updatedEntry.unit = getDefaultUnit(value, '');
          }
          
          // Update unit when subtype changes for certain materials
          if (field === 'subtype' && entry.type === 'Joint Compound') {
            updatedEntry.unit = getDefaultUnit(entry.type, value);
          }
          
          return updatedEntry;
        }
        return entry;
      })
    );
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!phaseId) {
       toast({
        title: "Error",
        description: "No takeoff phase selected. Please go back and select or create a phase.",
        variant: "destructive"
      });
      return;
    }

    if (jobType === 'residential' && !floorSpace.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the floor/space name.",
        variant: "destructive"
      });
      return;
    }

    if (jobType === 'commercial') {
      if (!unitType.trim()) {
        toast({
          title: "Missing Information",
          description: "Please enter the unit type name.",
          variant: "destructive"
        });
        return;
      }
      
      if (!unitNumbers.trim()) {
        toast({
          title: "Missing Information",
          description: "Please enter at least one unit number.",
          variant: "destructive"
        });
        return;
      }
    }

    const validBoardEntries = boardEntries.filter(
      entry => entry.boardType && entry.thickness && entry.width && entry.length && entry.quantity
    );

    if (validBoardEntries.length === 0) {
      toast({
        title: "Missing Board Information",
        description: "Please fill in all details for at least one board type.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate materials for commercial jobs
    let validMaterialEntries = [];
    if (jobType === 'commercial' && materialEntries.length > 0) {
      validMaterialEntries = materialEntries.filter(m => {
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

    const entryData = jobType === 'commercial' 
      ? { unitType, unitNumbers } 
      : { floorSpace };
    
    // For commercial jobs, include materials in the entry data
    if (jobType === 'commercial' && validMaterialEntries.length > 0) {
      entryData.materials = validMaterialEntries;
    }
    
    onSubmit(jobId, phaseId, entryData, validBoardEntries, notes);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto"
    >
      <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <Ruler className="h-6 w-6" />
            <CardTitle className="text-2xl font-bold">
              Add Takeoff Entries
              {jobType === 'commercial' && (
                <span className="ml-2 text-sm bg-white/20 px-2 py-1 rounded">Commercial Mode</span>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="p-8 space-y-8">
            {jobType === 'residential' ? (
              <div>
                <Label htmlFor="floorSpace" className="text-lg font-semibold text-gray-700">
                  Floor/Space Name *
                </Label>
                <Input
                  id="floorSpace"
                  value={floorSpace}
                  onChange={(e) => setFloorSpace(e.target.value)}
                  placeholder="e.g., 2nd Floor, Garage, Pool House Addition"
                  className="border-2 focus:border-brandPrimary transition-colors mt-2 text-base p-3"
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
                    value={unitType}
                    onChange={(e) => setUnitType(e.target.value)}
                    placeholder="e.g., Type 1A, Studio, 2-Bedroom Corner"
                    className="border-2 focus:border-brandPrimary transition-colors mt-2 text-base p-3"
                  />
                </div>
                
                <div>
                  <Label htmlFor="unitNumbers" className="text-lg font-semibold text-gray-700">
                    Unit Numbers *
                  </Label>
                  <div className="relative">
                    <Input
                      id="unitNumbers"
                      value={unitNumbers}
                      onChange={(e) => setUnitNumbers(e.target.value)}
                      placeholder="e.g., 501, 502, 503, 504, 505"
                      className="border-2 focus:border-brandPrimary transition-colors mt-2 text-base p-3 pl-10"
                    />
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter comma-separated unit numbers that share this exact layout
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 flex items-center mb-2">
                    <Building className="h-4 w-4 mr-2" />
                    Commercial Takeoff Mode
                  </h4>
                  <p className="text-sm text-blue-700">
                    In commercial mode, you define a unit type once and associate multiple unit numbers with it.
                    The system will automatically calculate materials for all units of this type.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Board Details</h3>
              {boardEntries.map((entry, index) => (
                <motion.div 
                  key={entry.id} 
                  className="p-6 border rounded-lg bg-slate-50 shadow-sm space-y-4 relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {boardEntries.length > 1 && (
                     <Button 
                        type="button"
                        variant="ghost" 
                        size="icon"
                        className="absolute top-2 right-2 text-red-500 hover:bg-red-100"
                        onClick={() => handleRemoveBoardEntry(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-600">Board Type *</Label>
                      <Select
                        value={entry.boardType}
                        onValueChange={(value) => handleBoardEntryChange(entry.id, 'boardType', value)}
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
                        value={entry.thickness}
                        onValueChange={(value) => handleBoardEntryChange(entry.id, 'thickness', value)}
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
                        value={entry.width}
                        onValueChange={(value) => handleBoardEntryChange(entry.id, 'width', value)}
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
                        value={entry.length}
                        onValueChange={(value) => handleBoardEntryChange(entry.id, 'length', value)}
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
                      <Label htmlFor={`quantity-${entry.id}`} className="text-sm font-medium text-gray-600">Quantity *</Label>
                      <Input
                        id={`quantity-${entry.id}`}
                        type="number"
                        min="1"
                        value={entry.quantity}
                        onChange={(e) => handleBoardEntryChange(entry.id, 'quantity', e.target.value)}
                        placeholder="Enter quantity"
                        className="border-gray-300 focus:border-brandPrimary"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddBoardEntry}
                className="w-full border-dashed border-brandPrimary text-brandPrimary hover:bg-brandPrimary/5"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Another Board Type
              </Button>
            </div>

            {/* Unit-level materials section for commercial jobs */}
            {jobType === 'commercial' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Unit-Specific Materials</h3>
                
                {materialEntries.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <Package className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-500 mb-3">Add materials specific to this unit type</p>
                    <Button
                      type="button"
                      onClick={handleAddMaterialEntry}
                      className="bg-brandPrimary hover:bg-brandPrimary-600 text-white"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add First Material
                    </Button>
                  </div>
                ) : (
                  <>
                    {materialEntries.map((material, index) => (
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
                            onClick={() => handleRemoveMaterialEntry(material.id)}
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
                              onValueChange={(value) => handleMaterialEntryChange(material.id, 'type', value)}
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
                              onValueChange={(value) => handleMaterialEntryChange(material.id, 'subtype', value)}
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
                                onValueChange={(value) => handleMaterialEntryChange(material.id, 'length', value)}
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
                                onValueChange={(value) => handleMaterialEntryChange(material.id, 'threadType', value)}
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
                              onChange={(e) => handleMaterialEntryChange(material.id, 'quantity', e.target.value)}
                              placeholder="Enter quantity"
                              className="border-gray-300 focus:border-brandPrimary"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-sm font-medium text-gray-600">Unit</Label>
                            <Select
                              value={material.unit || 'pcs'}
                              onValueChange={(value) => handleMaterialEntryChange(material.id, 'unit', value)}
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
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddMaterialEntry}
                      className="w-full border-dashed border-blue-500 text-blue-500 hover:bg-blue-50"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Another Material
                    </Button>
                  </>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="notes" className="text-lg font-semibold text-gray-700">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes or specifications for this floor/space"
                className="border-2 focus:border-brandPrimary transition-colors mt-2 min-h-[80px]"
              />
            </div>
          </CardContent>
          <CardFooter className="p-8 flex space-x-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-brandPrimary to-brandSecondary hover:from-brandPrimary-600 hover:to-brandSecondary-600 text-white font-semibold py-3 text-base"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Entries for {jobType === 'commercial' ? 'Unit Type' : 'Floor/Space'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-2 hover:bg-gray-50 font-semibold py-3 text-base"
            >
              <X className="h-5 w-5 mr-2" />
              Cancel
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default CreateTakeoffForm;