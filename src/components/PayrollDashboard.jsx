import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Calculator, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PayrollReports from '@/components/PayrollReports';

const PayrollDashboard = ({ employees }) => {
  console.log('PayrollDashboard rendering with employees:', employees);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-0 bg-gradient-to-r from-brandPrimary to-brandSecondary text-white shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <DollarSign className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">Payroll Management</CardTitle>
                  <p className="text-white/80 mt-1">Employee & Contractor Payroll Processing</p>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <Calculator className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-white/70 text-sm">Total Labor</p>
                <p className="font-semibold text-2xl">{employees.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-white/70 text-sm">Payroll Reports</p>
                <p className="font-semibold text-2xl">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Payroll Reports</h2>
        </div>
        <PayrollReports employees={employees} />
      </div>
    </div>
  );
};

export default PayrollDashboard;