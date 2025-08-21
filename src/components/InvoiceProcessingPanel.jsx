import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock } from 'lucide-react';

const InvoiceProcessingPanel = ({ jobs, onJobSelect }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-blue-800">Invoice Processing & Validation</CardTitle>
                <p className="text-blue-600 text-sm">Upload PDF invoices for automated processing and takeoff validation</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Coming Soon Message */}
      <Card className="border-2 border-gray-200 bg-gray-50">
        <CardContent className="p-12">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-gray-100 rounded-full">
                <Clock className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-800">Coming Soon</h2>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                We're working on an advanced invoice processing feature that will automatically extract data from your PDF invoices and match them to your takeoff items.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-lg mx-auto">
              <h3 className="font-semibold text-gray-800 mb-3">Planned Features:</h3>
              <ul className="text-left space-y-2 text-gray-600">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Automatic PDF data extraction</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Invoice-to-takeoff matching</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Cost variance analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Automated job financials integration</span>
                </li>
              </ul>
            </div>

            <p className="text-sm text-gray-500">
              This feature will be available in a future update. Stay tuned!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceProcessingPanel; 