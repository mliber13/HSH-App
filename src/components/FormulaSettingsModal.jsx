import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, X, Calculator, Settings, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const FormulaSettingsModal = ({ isOpen, onClose }) => {
  const [formulas, setFormulas] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Load formulas from localStorage on component mount
  useEffect(() => {
    if (isOpen) {
      const savedFormulas = JSON.parse(localStorage.getItem('hsh_drywall_formula_settings') || '{}');
      setFormulas(savedFormulas);
    }
  }, [isOpen]);

  const handleSave = () => {
    setIsLoading(true);
    try {
      localStorage.setItem('hsh_drywall_formula_settings', JSON.stringify(formulas));
      toast({
        title: "Formula Settings Saved! ✅",
        description: "Your formula settings have been saved successfully."
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error Saving Settings",
        description: "There was an error saving your formula settings.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormula = (category, field, value) => {
    setFormulas(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const resetToDefaults = () => {
    setFormulas({
      jointCompound: {
        allPurposeBaseRate: 4800,
        allPurposeLevel4Multiplier: 5,
        allPurposeLevel5Multiplier: 5,
        allPurposeStompMultiplier: 11,
        allPurposeSplatterMultiplier: 9,
        allPurposeDefaultMultiplier: 11,
        liteWeightMultiplier: 8,
        easySand90Rate: 5000
      },
      fasteners: {
        screwRate: 5760
      },
      adhesives: {
        titeBondRate: 5760
      },
      tape: {
        paperTapeRate: 1400,
        meshTapeLargeJobRate: 15000,
        meshTapeSmallJobRate: 1000,
        meshTapeSmallJobThreshold: 6000
      },
      cornerBead: {
        easySand90PerStick: 10,
        liteWeightPerStick: 15
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-6xl h-[90vh] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="pb-4 border-b bg-gradient-to-r from-brandPrimary to-brandSecondary text-white rounded-t-lg -m-6 mb-6 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="h-6 w-6" />
              <DialogTitle className="text-xl md:text-2xl font-bold">
                Formula Settings
              </DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-5 w-5"/>
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Adjust the calculation parameters for automatic accessory calculations. 
              These settings affect how materials are calculated based on square footage.
            </p>
            <Button
              variant="outline"
              onClick={resetToDefaults}
              className="border-orange-500 text-orange-500 hover:bg-orange-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>

          <Tabs defaultValue="joint-compound" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="joint-compound">Joint Compound</TabsTrigger>
              <TabsTrigger value="fasteners">Fasteners</TabsTrigger>
              <TabsTrigger value="adhesives">Adhesives</TabsTrigger>
              <TabsTrigger value="tape">Tape</TabsTrigger>
              <TabsTrigger value="corner-bead">Corner Bead</TabsTrigger>
            </TabsList>

            <TabsContent value="joint-compound" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Joint Compound Calculations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Base Rate (sqft per unit)</Label>
                      <Input
                        type="number"
                        value={formulas.jointCompound?.allPurposeBaseRate || 4800}
                        onChange={(e) => updateFormula('jointCompound', 'allPurposeBaseRate', e.target.value)}
                        placeholder="4800"
                      />
                      <p className="text-xs text-gray-500">Base square footage per unit for calculations</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Lite Weight Multiplier</Label>
                      <Input
                        type="number"
                        value={formulas.jointCompound?.liteWeightMultiplier || 8}
                        onChange={(e) => updateFormula('jointCompound', 'liteWeightMultiplier', e.target.value)}
                        placeholder="8"
                      />
                      <p className="text-xs text-gray-500">Multiplier for Lite Weight Joint Compound</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">All Purpose Joint Compound Multipliers</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Level 4/5 Finish</Label>
                        <Input
                          type="number"
                          value={formulas.jointCompound?.allPurposeLevel4Multiplier || 5}
                          onChange={(e) => {
                            updateFormula('jointCompound', 'allPurposeLevel4Multiplier', e.target.value);
                            updateFormula('jointCompound', 'allPurposeLevel5Multiplier', e.target.value);
                          }}
                          placeholder="5"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Stomp Knockdown</Label>
                        <Input
                          type="number"
                          value={formulas.jointCompound?.allPurposeStompMultiplier || 11}
                          onChange={(e) => updateFormula('jointCompound', 'allPurposeStompMultiplier', e.target.value)}
                          placeholder="11"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Splatter Knockdown</Label>
                        <Input
                          type="number"
                          value={formulas.jointCompound?.allPurposeSplatterMultiplier || 9}
                          onChange={(e) => updateFormula('jointCompound', 'allPurposeSplatterMultiplier', e.target.value)}
                          placeholder="9"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Default</Label>
                        <Input
                          type="number"
                          value={formulas.jointCompound?.allPurposeDefaultMultiplier || 11}
                          onChange={(e) => updateFormula('jointCompound', 'allPurposeDefaultMultiplier', e.target.value)}
                          placeholder="11"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <Label>Easy Sand 90 Rate (sqft per bag)</Label>
                      <Input
                        type="number"
                        value={formulas.jointCompound?.easySand90Rate || 5000}
                        onChange={(e) => updateFormula('jointCompound', 'easySand90Rate', e.target.value)}
                        placeholder="5000"
                      />
                      <p className="text-xs text-gray-500">Square footage per bag of Easy Sand 90</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fasteners" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fastener Calculations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Drywall Screws Rate (sqft per box)</Label>
                    <Input
                      type="number"
                      value={formulas.fasteners?.screwRate || 5760}
                      onChange={(e) => updateFormula('fasteners', 'screwRate', e.target.value)}
                      placeholder="5760"
                    />
                    <p className="text-xs text-gray-500">Square footage per box of drywall screws</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="adhesives" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Adhesive Calculations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>TiteBond Foam Rate (sqft per tube)</Label>
                    <Input
                      type="number"
                      value={formulas.adhesives?.titeBondRate || 5760}
                      onChange={(e) => updateFormula('adhesives', 'titeBondRate', e.target.value)}
                      placeholder="5760"
                    />
                    <p className="text-xs text-gray-500">Square footage per tube of TiteBond Foam</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tape" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tape Calculations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Paper Tape Rate (sqft per roll)</Label>
                    <Input
                      type="number"
                      value={formulas.tape?.paperTapeRate || 1400}
                      onChange={(e) => updateFormula('tape', 'paperTapeRate', e.target.value)}
                      placeholder="1400"
                    />
                    <p className="text-xs text-gray-500">Square footage per roll of paper tape</p>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Mesh Tape Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Large Job Rate (sqft per roll)</Label>
                        <Input
                          type="number"
                          value={formulas.tape?.meshTapeLargeJobRate || 15000}
                          onChange={(e) => updateFormula('tape', 'meshTapeLargeJobRate', e.target.value)}
                          placeholder="15000"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Small Job Rate (sqft per roll)</Label>
                        <Input
                          type="number"
                          value={formulas.tape?.meshTapeSmallJobRate || 1000}
                          onChange={(e) => updateFormula('tape', 'meshTapeSmallJobRate', e.target.value)}
                          placeholder="1000"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Small Job Threshold (sqft)</Label>
                        <Input
                          type="number"
                          value={formulas.tape?.meshTapeSmallJobThreshold || 6000}
                          onChange={(e) => updateFormula('tape', 'meshTapeSmallJobThreshold', e.target.value)}
                          placeholder="6000"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Jobs below the threshold use the small job rate, above use the large job rate
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="corner-bead" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Corner Bead Dependent Materials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Easy Sand 90 per Corner Bead Stick</Label>
                      <Input
                        type="number"
                        value={formulas.cornerBead?.easySand90PerStick || 10}
                        onChange={(e) => updateFormula('cornerBead', 'easySand90PerStick', e.target.value)}
                        placeholder="10"
                      />
                      <p className="text-xs text-gray-500">Additional bags of Easy Sand 90 per corner bead stick</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Lite Weight per Corner Bead Stick</Label>
                      <Input
                        type="number"
                        value={formulas.cornerBead?.liteWeightPerStick || 15}
                        onChange={(e) => updateFormula('cornerBead', 'liteWeightPerStick', e.target.value)}
                        placeholder="15"
                      />
                      <p className="text-xs text-gray-500">Additional boxes of Lite Weight per corner bead stick</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="pt-6 border-t bg-gray-50 rounded-b-lg -m-6 mt-6 p-6 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} className="hover:bg-gray-100 w-full sm:w-auto">
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="bg-brandPrimary hover:bg-brandPrimary-600 text-white w-full sm:w-auto"
            >
              <Save className="h-4 w-4 mr-2" /> Save Settings
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormulaSettingsModal;
