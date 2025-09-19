import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EstimateTab from './EstimateTab';
import CommercialEstimateTab from './CommercialEstimateTab';
import FieldRevisedTab from './FieldRevisedTab';
import ActualTab from './ActualTab';
import OverviewTab from './OverviewTab';

const JobFinancials = ({ job, onUpdateJob, disableAutoSyncTemporarily, forceRecalculateLaborCosts }) => {
  const [activeTab, setActiveTab] = useState('estimate');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="estimate">Estimate</TabsTrigger>
          <TabsTrigger value="field-revised">Field Revised</TabsTrigger>
          <TabsTrigger value="actual">Actual</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="estimate" className="space-y-6">
          {job?.jobType === 'commercial' ? (
            <CommercialEstimateTab job={job} onUpdateJob={onUpdateJob} />
          ) : (
            <EstimateTab job={job} onUpdateJob={onUpdateJob} />
          )}
        </TabsContent>

        <TabsContent value="field-revised" className="space-y-6">
          <FieldRevisedTab job={job} onUpdateJob={onUpdateJob} />
        </TabsContent>

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
