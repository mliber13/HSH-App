import React from 'react';
import { motion } from 'framer-motion';
import { Hammer, Plus, Trash2, Edit3, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ScopesSection = ({ job, onSelectScope, onAddDefaultScopes, onOpenCreateScopeModal, onDeleteScope, hasDefaultScopes }) => {
  const scopes = job.scopes || [];

  const getScopeStatusColor = (status) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on_hold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScopeStatusText = (status) => {
    switch (status) {
      case 'not_started': return 'Not Started';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'on_hold': return 'On Hold';
      default: return 'Not Started';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="border-2 border-brandSecondary/20 bg-gradient-to-br from-brandSecondary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-brandSecondary">
              <Hammer className="h-5 w-5 mr-2" />
              Scopes of Work
              {scopes.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-brandSecondary/10 text-brandSecondary">
                  {scopes.length} scope{scopes.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {!hasDefaultScopes() && (
                <Button
                  onClick={onAddDefaultScopes}
                  className="bg-gradient-to-r from-brandPrimary to-brandSecondary hover:from-brandPrimary-600 hover:to-brandSecondary-600 text-white font-semibold"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Defaults
                </Button>
              )}
              <Button
                onClick={onOpenCreateScopeModal}
                variant="outline"
                className="border-brandPrimary text-brandPrimary hover:bg-brandPrimary/5"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Scope
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {scopes.length === 0 ? (
            <div className="text-center py-8">
              <Hammer className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">No scopes defined yet</p>
              <p className="text-gray-500 text-sm mt-1">Add default scopes or create custom ones to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scopes.map((scope, index) => (
                <motion.div
                  key={scope.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="border border-gray-200 hover:border-brandSecondary/30 transition-all duration-300 hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-gray-900 group-hover:text-brandSecondary transition-colors">
                              {scope.name}
                            </h3>
                            <Badge className={getScopeStatusColor(scope.status)}>
                              {getScopeStatusText(scope.status)}
                            </Badge>
                          </div>
                          {scope.description && (
                            <p className="text-gray-600 text-sm mt-1">{scope.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            {scope.estimatedHours && (
                              <span>Est. Hours: {scope.estimatedHours}</span>
                            )}
                            {scope.estimatedCost && (
                              <span>Est. Cost: ${scope.estimatedCost.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            onClick={() => onSelectScope(scope)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => onSelectScope(scope)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:bg-gray-50"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => onDeleteScope(job.id, scope.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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

export default ScopesSection;
