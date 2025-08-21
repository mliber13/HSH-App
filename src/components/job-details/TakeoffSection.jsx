import React from 'react';
import { motion } from 'framer-motion';
import { Ruler, Plus, Trash2, Edit3, Package, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const TakeoffSection = ({ job, takeoffPhases, onCreateTakeoffPhase, onAddTakeoffEntry, onDeleteTakeoffPhase, onUpdateTakeoffEntry, onDeleteTakeoffEntry, setEditingEntry, setEditingPhaseMaterials, jobType }) => {
  console.log('TakeoffSection rendering with phases:', takeoffPhases?.length);
  const getPhaseTotalSqft = (phase) => {
    if (!phase.floorSpaceEntries || phase.floorSpaceEntries.length === 0) return 0;
    return phase.floorSpaceEntries.reduce((total, entry) => total + (entry.sqft || 0), 0);
  };

  const getPhaseTotalCost = (phase) => {
    const totalSqft = getPhaseTotalSqft(phase);
    const ratePerSqft = phase.ratePerSqft || 0;
    return totalSqft * ratePerSqft;
  };

  const getJobTypeLabel = (type) => {
    return type === 'residential' ? 'Residential' : 'Commercial';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-green-700">
              <Ruler className="h-5 w-5 mr-2" />
              Takeoff Phases
              {takeoffPhases.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                  {takeoffPhases.length} phase{takeoffPhases.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
            <Button
              onClick={onCreateTakeoffPhase}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Phase
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {takeoffPhases.length === 0 ? (
            <div className="text-center py-8">
              <Ruler className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">No takeoff phases yet</p>
              <p className="text-gray-500 text-sm mt-1">Create takeoff phases to start measuring and estimating</p>
            </div>
          ) : (
            <div className="space-y-4">
              {takeoffPhases.map((phase, index) => (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="border border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                              {phase.name}
                            </h3>
                            <Badge className="bg-green-100 text-green-700">
                              {getJobTypeLabel(jobType)}
                            </Badge>
                          </div>
                          {phase.description && (
                            <p className="text-gray-600 text-sm mt-1">{phase.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calculator className="h-4 w-4 mr-1" />
                              Rate: ${phase.ratePerSqft?.toFixed(2) || '0.00'}/sqft
                            </span>
                            <span className="flex items-center">
                              <Package className="h-4 w-4 mr-1" />
                              Sqft: {getPhaseTotalSqft(phase).toFixed(2)}
                            </span>
                            <span className="flex items-center font-medium text-green-700">
                              Total: ${getPhaseTotalCost(phase).toFixed(2)}
                            </span>
                          </div>
                          {phase.floorSpaceEntries && phase.floorSpaceEntries.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              {phase.floorSpaceEntries.length} measurement{phase.floorSpaceEntries.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            onClick={() => onAddTakeoffEntry(phase.id)}
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:bg-green-50"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => setEditingPhaseMaterials(phase)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => onDeleteTakeoffPhase(job.id, phase.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Floor Space Entries */}
                      {phase.floorSpaceEntries && phase.floorSpaceEntries.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {phase.floorSpaceEntries.map((entry, entryIndex) => (
                            <div
                              key={entry.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg group/entry"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-700">
                                  {entry.roomName || `Entry ${entryIndex + 1}`}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {entry.length} × {entry.width} = {entry.sqft?.toFixed(2)} sqft
                                </span>
                                <span className="text-sm font-medium text-green-700">
                                  ${((entry.sqft || 0) * (phase.ratePerSqft || 0)).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 opacity-0 group-hover/entry:opacity-100 transition-opacity">
                                <Button
                                  onClick={() => setEditingEntry({ phaseId: phase.id, floorSpaceEntry: entry })}
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:bg-gray-100 h-6 w-6 p-0"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <Button
                                  onClick={() => onDeleteTakeoffEntry(phase.id, entry.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-100 h-6 w-6 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TakeoffSection;
