import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AnalyticsCharts = ({ analytics }) => {
  // Simple bar chart component
  const BarChart = ({ data, title, height = 200, color = '#3b82f6' }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = 100 / data.length;
    
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="relative" style={{ height: `${height}px` }}>
          {data.map((item, index) => (
            <div key={index} className="absolute bottom-0 flex flex-col items-center" style={{ left: `${index * barWidth}%`, width: `${barWidth * 0.8}%` }}>
              <div 
                className="w-full rounded-t"
                style={{ 
                  height: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: color,
                  minHeight: '4px'
                }}
              />
              <div className="text-xs text-gray-600 mt-1 text-center">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Simple pie chart component
  const PieChart = ({ data, title, size = 200 }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const x1 = 50 + 40 * Math.cos(currentAngle * Math.PI / 180);
              const y1 = 50 + 40 * Math.sin(currentAngle * Math.PI / 180);
              const x2 = 50 + 40 * Math.cos((currentAngle + angle) * Math.PI / 180);
              const y2 = 50 + 40 * Math.sin((currentAngle + angle) * Math.PI / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              const pathData = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              currentAngle += angle;
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm">{item.label}</span>
              <span className="text-sm font-medium">
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Prepare data for charts
  const jobPerformanceData = analytics.jobPerformance.slice(0, 10).map((job, index) => ({
    label: job.jobName.length > 15 ? job.jobName.substring(0, 15) + '...' : job.jobName,
    value: job.profit
  }));

  const profitDistributionData = [
    { label: 'Profitable', value: analytics.performanceTrends.profitableJobs, color: '#10b981' },
    { label: 'Break Even', value: analytics.performanceTrends.breakEvenJobs, color: '#f59e0b' },
    { label: 'Loss Making', value: analytics.performanceTrends.lossMakingJobs, color: '#ef4444' }
  ];

  const costBreakdownData = [
    { label: 'Labor', value: analytics.totalCosts * 0.6, color: '#3b82f6' },
    { label: 'Materials', value: analytics.totalCosts * 0.3, color: '#8b5cf6' },
    { label: 'Other', value: analytics.totalCosts * 0.1, color: '#f59e0b' }
  ];

  const employeeProductivityData = analytics.employeeProductivity.slice(0, 8).map(emp => ({
    label: emp.name.length > 10 ? emp.name.substring(0, 10) + '...' : emp.name,
    value: emp.hourlyRate
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Jobs by Profit</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart 
            data={jobPerformanceData} 
            title=""
            color="#10b981"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job Performance Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChart 
            data={profitDistributionData}
            title=""
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChart 
            data={costBreakdownData}
            title=""
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employee Hourly Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart 
            data={employeeProductivityData}
            title=""
            color="#8b5cf6"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsCharts; 