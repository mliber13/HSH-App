import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EstimateTab from './EstimateTab';
import CommercialEstimateTab from './CommercialEstimateTab';
import ResidentialConstructionEstimateTab from './ResidentialConstructionEstimateTab';
import FieldRevisedTab from './FieldRevisedTab';
import ActualTab from './ActualTab';
import OverviewTab from './OverviewTab';

const JobFinancials = ({ job, onUpdateJob, disableAutoSyncTemporarily, forceRecalculateLaborCosts, employees }) => {
  const [activeTab, setActiveTab] = useState('estimate');

  // Auto-switch to estimate tab if on field-revised tab for residential construction jobs
  useEffect(() => {
    if (job?.jobType === 'residential-construction' && activeTab === 'field-revised') {
      setActiveTab('estimate');
    }
  }, [job?.jobType, activeTab]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full ${job?.jobType === 'residential-construction' ? 'grid-cols-3' : 'grid-cols-4'}`}>
          <TabsTrigger value="estimate">Estimate</TabsTrigger>
          {job?.jobType !== 'residential-construction' && (
            <TabsTrigger value="field-revised">Field Revised</TabsTrigger>
          )}
          <TabsTrigger value="actual">Actual</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="estimate" className="space-y-6">
          {job?.jobType === 'commercial' ? (
            <CommercialEstimateTab job={job} onUpdateJob={onUpdateJob} />
          ) : job?.jobType === 'residential-construction' ? (
            <ResidentialConstructionEstimateTab job={job} onUpdateJob={onUpdateJob} employees={employees} />
          ) : (
            <EstimateTab job={job} onUpdateJob={onUpdateJob} />
          )}
        </TabsContent>

        {job?.jobType !== 'residential-construction' && (
          <TabsContent value="field-revised" className="space-y-6">
            <FieldRevisedTab job={job} onUpdateJob={onUpdateJob} />
          </TabsContent>
        )}

        <TabsContent value="actual" className="space-y-6">
          <ActualTab job={job} onUpdateJob={onUpdateJob} disableAutoSyncTemporarily={disableAutoSyncTemporarily} forceRecalculateLaborCosts={forceRecalculateLaborCosts} />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab job={job} onUpdateJob={onUpdateJob} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default JobFinancials;
