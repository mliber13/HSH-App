# Commercial Financials System Demo

## Overview
The new commercial financials system has been completely redesigned to work like an estimating spreadsheet with detailed line items for commercial projects. This system is separate from the residential financials and provides a much more comprehensive breakdown.

## Key Features

### 1. **Detailed Line Item Breakdown**
The commercial estimate tab includes all the specific line items you mentioned:

#### Equipment
- Equipment Costs

#### Labor Costs (Worksheet Format)
- **ACT Labor** - Qty, Unit, Waste %, Adjusted Qty, Unit Cost, Total Cost
- **Drywall Labor** - Qty, Unit, Waste %, Adjusted Qty, Unit Cost, Total Cost
- **Channel Labor** - Qty, Unit, Waste %, Adjusted Qty, Unit Cost, Total Cost
- **Suspended Drywall Grid Labor** - Qty, Unit, Waste %, Adjusted Qty, Unit Cost, Total Cost
- **Metal Framing Labor** - Qty, Unit, Waste %, Adjusted Qty, Unit Cost, Total Cost
- **Insulation Labor** - Qty, Unit, Waste %, Adjusted Qty, Unit Cost, Total Cost
- **FRP Labor** - Qty, Unit, Waste %, Adjusted Qty, Unit Cost, Total Cost
- **Door Install Labor** - Qty, Unit, Waste %, Adjusted Qty, Unit Cost, Total Cost

#### Material Costs
- ACT Material
- Drywall Material
- Channel Material
- Suspended Drywall Grid Material
- Metal Framing Material
- Insulation Material
- FRP Material

### 2. **Professional Worksheet Interface**
- **Labor Worksheet Table**: Professional spreadsheet-like layout with columns for:
  - **Labor Type**: Description of the labor category
  - **Qty**: Quantity input field
  - **Unit**: Dropdown for unit type (sqft, linear ft, each, hours)
  - **Waste %**: Waste percentage input (defaults to 5%)
  - **Adjusted Qty**: Automatically calculated quantity with waste included
  - **Unit Cost**: Pay rate per unit (e.g., $0.85/sqft for ACT)
  - **Total Cost**: Automatically calculated total for each labor type
- Real-time calculations as you input values
- Professional appearance with proper grouping and totals
- Hover effects and clean table styling

### 3. **Advanced Calculations**
- **Waste Calculations**: Automatic adjustment of quantities based on waste percentage
- **Unit Cost Management**: Configurable pay rates for each labor type
- **Overhead Percentage**: Configurable overhead rate (default 15%)
- **Profit Percentage**: Configurable profit margin (default 20%)
- **Sales Tax**: Applied only to materials (not labor)
- **Automatic Totals**: All calculations update in real-time

### 4. **Flexible Pricing**
- Manual override capability for final total
- Automatic profit calculation based on actual vs. calculated totals
- Professional quote generation with full breakdown
- Pay rate storage for future use and consistency

## How It Works

### 1. **Job Type Detection**
The system automatically detects if a job is commercial or residential:
- `job.jobType === 'commercial'` → Shows CommercialEstimateTab
- `job.jobType === 'residential'` → Shows regular EstimateTab

### 2. **Data Storage**
Commercial estimates are stored in a separate structure:
```javascript
job.financials.commercialEstimate = {
  // Equipment
  equipmentCost: 0,
  
  // ACT Labor Worksheet Data
  actLaborQty: 0,
  actLaborUnit: 'sqft',
  actLaborWaste: 5,
  actLaborUnitCost: 0.85,
  actLaborCost: 0,
  
  // Drywall Labor Worksheet Data
  drywallLaborQty: 0,
  drywallLaborUnit: 'sqft',
  drywallLaborWaste: 5,
  drywallLaborUnitCost: 0.75,
  drywallLaborCost: 0,
  
  // ... similar structure for all labor types
  
  // Materials
  actMaterialCost: 0,
  drywallMaterialCost: 0,
  // ... other material costs
  
  // Percentages
  overheadPercentage: 15,
  profitPercentage: 20,
  salesTaxRate: 7.25,
  totalEstimateAmount: 0
}
```

### 3. **Calculations**
The system automatically calculates:
- **Adjusted Quantities**: Qty × (1 + Waste% / 100)
- **Labor Costs**: Adjusted Qty × Unit Cost
- **Total Labor Cost**: Sum of all labor items
- **Total Material Cost**: Sum of all material items  
- **Total Direct Cost**: Equipment + Labor + Materials
- **Overhead Amount**: Direct Cost × Overhead %
- **Profit Amount**: (Direct Cost + Overhead) × Profit %
- **Sales Tax**: Materials Only × Tax Rate
- **Final Total**: All costs + overhead + profit + tax

## Labor Worksheet Features

### 1. **Quantity Management**
- Input actual quantities for each labor type
- Support for different units (sqft, linear ft, each, hours)
- Real-time validation and formatting

### 2. **Waste Calculations**
- Configurable waste percentage for each labor type
- Automatic calculation of adjusted quantities
- Industry-standard defaults (5% waste)

### 3. **Pay Rate Management**
- Store and manage pay rates for each labor type
- Easy to update rates for different projects
- Historical rate tracking for consistency

### 4. **Professional Table Layout**
- Clean, organized spreadsheet appearance
- Hover effects for better user experience
- Responsive design for different screen sizes
- Professional color scheme and typography

## Quote Generation

### 1. **Professional PDF Output**
- Company branding and header
- Detailed line item breakdown including worksheet data
- Professional formatting and layout
- All calculations clearly displayed

### 2. **Commercial vs Residential Quotes**
- **Commercial**: Shows detailed breakdown with categories and worksheet data
- **Residential**: Shows traditional sqft-based breakdown

### 3. **Email Integration**
- Automatic PDF generation
- Professional email templates
- Different messaging for commercial vs residential

## Usage Example

1. **Create a Commercial Job**
   - Set `jobType: 'commercial'` when creating the job

2. **Navigate to Financials**
   - Go to the Estimate tab
   - System automatically shows CommercialEstimateTab

3. **Input Labor Worksheet Data**
   - Enter quantities for each labor type
   - Select appropriate units (sqft, linear ft, each, hours)
   - Adjust waste percentages as needed
   - Input pay rates for each labor type
   - Watch totals calculate automatically

4. **Input Other Costs**
   - Fill in equipment costs
   - Input material costs for each type
   - Adjust overhead and profit percentages

5. **Review Calculations**
   - All totals update automatically
   - Professional breakdown visible
   - Profit margins clearly displayed

6. **Generate Quote**
   - Click "Send Quote" button
   - Professional PDF generated with full worksheet data
   - Email template ready

## Benefits

### 1. **Professional Appearance**
- Looks like a real estimating spreadsheet
- Clear organization and grouping
- Professional quote output with worksheet data

### 2. **Comprehensive Coverage**
- All commercial drywall services covered
- Detailed breakdown for clients
- Professional scope of work
- Pay rate management for consistency

### 3. **Flexible Pricing**
- Easy to adjust individual line items
- Configurable overhead and profit
- Manual override capability
- Waste factor calculations

### 4. **Seamless Integration**
- Works alongside existing residential system
- No changes to current functionality
- Easy to switch between job types
- Professional worksheet interface

## Technical Implementation

### 1. **New Components**
- `CommercialEstimateTab.jsx` - Main commercial estimate interface with worksheet
- `useCommercialEstimate.js` - Hook for commercial estimate logic and calculations

### 2. **Conditional Rendering**
- `JobFinancials.jsx` automatically shows correct tab based on job type
- No changes needed to existing residential functionality

### 3. **Data Structure**
- Separate `commercialEstimate` object in job financials
- Maintains backward compatibility
- Easy to extend with additional line items
- Worksheet data structure for labor costs

### 4. **Quote System**
- Enhanced `QuoteModal.jsx` handles both commercial and residential
- Different PDF layouts and content
- Professional formatting for both types
- Worksheet data included in commercial quotes

## Future Enhancements

The system is designed to be easily extensible:

1. **Additional Line Items**: Easy to add new categories
2. **Custom Calculations**: Can add project-specific formulas
3. **Integration**: Ready for QuickBooks and other systems
4. **Reporting**: Can generate detailed cost analysis reports
5. **Rate Management**: Historical pay rate tracking and analysis
6. **Waste Optimization**: Advanced waste calculation algorithms

This new commercial financials system provides the professional estimating capabilities you need while maintaining the simplicity of the residential system for those projects. The worksheet format makes it easy to manage pay rates, quantities, and waste factors for accurate commercial estimates.
