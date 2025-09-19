HSH Contractor Construction Management Application
## Complete Project Documentation

### Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Application Architecture](#application-architecture)
4. [Core Features & Workflows](#core-features--workflows)
5. [Component Structure](#component-structure)
6. [Data Management](#data-management)
7. [Integration Points](#integration-points)
8. [Development Setup](#development-setup)
9. [Known Issues & TODOs](#known-issues--todos)
10. [User Preferences & Requirements](#user-preferences--requirements)

---

## Project Overview

**Application Name**: HSH Contractor Construction Management System  
**Purpose**: Comprehensive construction project management application for drywall contractors  
**Target Users**: Project managers, schedulers, field workers, accounting staff  
**Current Status**: Core functionality implemented, ready for final development phase

### Key Business Areas Covered
- **Project Management**: Job creation, tracking, and completion
- **Time & Labor Management**: Employee time tracking and payroll
- **Financial Management**: Estimates, change orders, invoicing
- **Operations**: Scheduling, inventory, supplier management
- **Client Relations**: Client portal and communication
- **Accounting Integration**: QuickBooks Online sync

---

## Technology Stack

### Frontend Framework
- **React 18.2.0** with Vite build system
- **Framer Motion** for animations
- **Tailwind CSS** for styling
- **Radix UI** components for UI elements

### Key Dependencies
```json
{
  "react": "^18.2.0",
  "framer-motion": "^10.16.4",
  "lucide-react": "^0.285.0",
  "date-fns": "^3.3.1",
  "react-big-calendar": "^1.19.4",
  "jspdf": "^2.5.1",
  "@hello-pangea/dnd": "^18.0.1"
}
```

### Development Tools
- **Vite** for development and building
- **ESLint** for code quality
- **PostCSS** and **Autoprefixer** for CSS processing
- **Tailwind CSS** for utility-first styling

---

## Application Architecture

### Main Application Structure
```
src/
├── App.jsx                    # Main application router
├── main.jsx                   # Application entry point
├── components/                # React components
│   ├── ui/                   # Reusable UI components
│   ├── job-details/          # Job-specific components
│   ├── job-financials/       # Financial components
│   ├── clock-in-out/         # Time tracking components
│   ├── inventory-management/ # Inventory components
│   ├── onboarding/           # Employee onboarding
│   └── quickbooks/           # QuickBooks integration
├── hooks/                    # Custom React hooks
├── services/                 # Business logic services
└── lib/                      # Utility functions
```

### State Management
- **Local Storage**: Primary data persistence
- **React Hooks**: Component state management
- **Custom Hooks**: Business logic encapsulation
- **Context API**: Shared state where needed

---

## Core Features & Workflows

### 1. Job Management System

#### Job Lifecycle
1. **Job Creation** → **Estimating** → **Active** → **Completed**
2. **Scope Management**: Break down jobs into manageable scopes
3. **Takeoff System**: Material and labor calculations
4. **Change Orders**: Track modifications and updates

#### Key Components
- `JobsList.jsx`: Main job dashboard
- `JobDetails.jsx`: Comprehensive job view
- `CreateJobForm.jsx`: New job creation
- `ScopeDetails.jsx`: Scope management

#### Data Structure
```javascript
{
  id: "job-123",
  name: "Office Building Drywall",
  status: "active", // estimating, active, completed
  client: "ABC Construction",
  address: "123 Main St",
  startDate: "2024-01-15",
  endDate: "2024-03-15",
  estimate: 50000,
  actual: 52000,
  scopes: [...],
  takeoffPhases: [...],
  checklists: [...],
  documents: [...],
  dailyLogs: [...]
}
```

### 2. Time & Labor Management

#### Time Clock System
- **Clock In/Out**: GPS-enabled time tracking
- **Piece Rate Tracking**: Production-based compensation
- **Break Management**: Automatic break deductions
- **Location Tracking**: Integrated with job addresses

#### Payroll Processing
- **Hourly Wages**: Standard time tracking
- **Piece Rates**: Production-based pay
- **Overtime Calculation**: Automatic OT detection
- **Deductions**: Tool deductions, banked hours

#### Key Components
- `TimeClock.jsx`: Main time clock interface
- `ClockInOut.jsx`: Clock in/out functionality
- `PayrollDashboard.jsx`: Payroll management
- `TimeReports.jsx`: Time and payroll reports

### 3. Financial Management

#### Job Financials
- **Estimates**: Initial project estimates
- **Actual Costs**: Real-time cost tracking
- **Change Orders**: Cost modifications
- **Profit/Loss**: Real-time P&L calculations

#### QuickBooks Integration
- **Automatic Sync**: Jobs → QuickBooks projects
- **Invoice Generation**: Direct invoice creation
- **Customer Management**: Automatic customer creation
- **Queue System**: Failed operations retry

#### Key Components
- `JobFinancials.jsx`: Financial dashboard
- `QuickBooksConnection.jsx`: Integration management
- `InvoiceProcessingPanel.jsx`: Invoice handling

### 4. Scheduling System

#### Schedule Management
- **Calendar View**: Visual schedule display
- **Job Scheduling**: Assign jobs to dates
- **Employee Assignment**: Assign workers to jobs
- **Template System**: Reusable schedule templates

#### Key Features
- Drag-and-drop scheduling
- Employee availability tracking
- Schedule conflict detection
- Mobile-friendly interface

#### Key Components
- `ScheduleDashboard.jsx`: Main schedule view
- `ScheduleCalendar.jsx`: Calendar interface
- `ScheduleTemplateModal.jsx`: Template management

### 5. Inventory Management

#### Inventory System
- **Warehouse Management**: Track inventory locations
- **Material Tracking**: Monitor material usage
- **Allocation System**: Assign materials to jobs
- **Analytics**: Usage patterns and forecasting

#### Key Components
- `InventoryManagementPanel.jsx`: Main inventory interface
- `WarehouseTab.jsx`: Warehouse management
- `AssetsTab.jsx`: Asset tracking
- `AllocationsTab.jsx`: Material allocation

### 6. Employee Management

#### Employee Lifecycle
1. **Onboarding**: Document collection and setup
2. **Active Management**: Time tracking and payroll
3. **Document Management**: Certifications, licenses
4. **Performance Tracking**: Time and production metrics

#### Key Components
- `LaborManagement.jsx`: Employee management
- `OnboardingDashboard.jsx`: New employee setup
- `EmployeeDocuments.jsx`: Document management

### 7. Client Portal

#### Client Features
- **Project Status**: Real-time job progress
- **Document Access**: Plans, permits, invoices
- **Communication**: Direct messaging system
- **Payment Tracking**: Invoice and payment status

#### Key Components
- `ClientPortalPanel.jsx`: Client interface
- `MessageComposer.jsx`: Communication tools

### 8. Analytics & Reporting

#### Dashboard Analytics
- **Job Performance**: Profit/loss by job
- **Employee Metrics**: Productivity and time analysis
- **Financial Reports**: Cash flow and profitability
- **Operational KPIs**: Efficiency metrics

#### Key Components
- `AnalyticsDashboard.jsx`: Main analytics view
- `AnalyticsCharts.jsx`: Chart components
- `CashFlowPanel.jsx`: Cash flow analysis

---

## Commercial Financials System

The commercial financials system provides a comprehensive estimating worksheet specifically designed for commercial drywall projects. This system differs significantly from the residential financials and includes advanced features for managing complex project breakdowns and multiple bid versions.

### Key Features

#### 1. Detailed Line Item Breakdown
The commercial estimate includes comprehensive line items for:
- **Equipment Costs**: All equipment and tool costs
- **Labor Costs**: Detailed worksheet format for each labor type
- **Material Costs**: All material expenses
- **Overhead & Profit**: Configurable percentages
- **Sales Tax**: Applied to materials only

#### 2. Labor Worksheet Format
Each labor type (ACT, Drywall, Channel, Suspended Grid, Metal Framing, Insulation, FRP, Door Install) includes:
- **Quantity (Qty)**: Amount of work to be performed
- **Unit**: Measurement unit (sqft, linear ft, each)
- **Waste Percentage**: Configurable waste factor
- **Adjusted Quantity**: Automatically calculated (Qty × (1 + Waste% / 100))
- **Unit Cost**: Pay rate per unit
- **Total Cost**: Calculated total (Adjusted Qty × Unit Cost)

#### 3. Project Breakdowns
Support for dividing projects into logical sections:
- **Breakdown Management**: Add/remove breakdown sections (e.g., "1st Floor", "2nd Floor", "West Wing")
- **Individual Tracking**: Each breakdown maintains its own cost data
- **Summary View**: Overview of all breakdowns with subtotals
- **PDF Integration**: Breakdown information included in generated quotes

#### 4. Multiple Bid Versions
Support for managing different versions of the same estimate:
- **Version Control**: Create and manage multiple bid versions (e.g., "Initial", "Pre-Construction", "Final")
- **Data Persistence**: Each version stores complete estimate data
- **Easy Switching**: Switch between versions to compare or update estimates
- **Quote Integration**: Current bid version displayed in quotes and PDFs

#### 5. Advanced Calculations
- **Real-time Updates**: All calculations update automatically as values change
- **Waste Calculations**: Automatic adjustment for material waste
- **Overhead & Profit**: Applied to direct costs
- **Sales Tax**: Calculated on materials only
- **Breakdown Totals**: Individual and combined breakdown calculations

### Data Structure

The commercial estimate data is stored in `job.financials.commercialEstimate` with the following structure:

```javascript
{
  // Bid version management
  currentBidVersion: "initial",
  bidVersions: ["initial", "pre-construction", "final"],
  bidVersionData: {
    "initial": { /* complete estimate data */ },
    "pre-construction": { /* complete estimate data */ },
    "final": { /* complete estimate data */ }
  },
  
  // Breakdowns
  breakdowns: [
    {
      id: "unique-id",
      name: "1st Floor",
      equipmentCost: 0,
      actLaborQty: 0,
      actLaborUnit: "sqft",
      actLaborWaste: 5,
      actLaborUnitCost: 0.85,
      // ... all other fields for each breakdown
    }
  ],
  
  // Main estimate data
  equipmentCost: 0,
  actLaborQty: 0,
  actLaborUnit: "sqft",
  actLaborWaste: 5,
  actLaborUnitCost: 0.85,
  // ... all other estimate fields
}
```

### User Interface

#### Bid Version Management
- **Current Version Selector**: Dropdown to switch between bid versions
- **New Version Creation**: Input field to create new bid versions
- **Version History**: List of all available versions

#### Breakdown Management
- **Add Breakdowns**: Input field to add new breakdown sections
- **Breakdown List**: Display of all current breakdowns with remove options
- **Breakdown Summary**: Detailed view of each breakdown's costs

#### Estimate Worksheet
- **Labor Table**: Spreadsheet-style interface for labor calculations
- **Material Inputs**: Direct cost inputs for materials
- **Real-time Totals**: Automatic calculation updates
- **Summary Section**: Comprehensive cost breakdown with overhead and profit

### Quote Generation

The system generates professional PDF quotes that include:
- **Project Information**: Name, type, date, bid version
- **Scope of Work**: Detailed project specifications
- **Cost Breakdown**: Complete line item breakdown
- **Breakdown Summary**: Individual breakdown totals
- **Terms & Conditions**: Standard contract terms
- **Professional Branding**: Company logo and contact information

### Benefits

1. **Professional Estimating**: Spreadsheet-like interface familiar to estimators
2. **Project Organization**: Logical breakdowns for complex projects
3. **Version Control**: Track estimate evolution throughout project lifecycle
4. **Accurate Calculations**: Automatic waste and overhead calculations
5. **Professional Quotes**: Ready-to-send PDF quotes with all project details
6. **Data Persistence**: Complete estimate history and version management

This system provides commercial contractors with the tools needed to create detailed, professional estimates while maintaining flexibility for project changes and multiple bid scenarios.

---

## Material Costs Section

The Material Costs section has been transformed from simple bulk input fields to a comprehensive worksheet system similar to the Labor Costs table. This provides detailed tracking and calculation capabilities for all material expenses.

### Features

- **Material Worksheet Table**: Each material line item includes:
  - Material name (ACT, Drywall, Channel, Suspended Grid, Metal Framing, Insulation, FRP)
  - Quantity input field
  - Unit selection (sqft, linear ft, each, lbs, sheets, sticks, grids, studs, batts, panels)
  - Waste percentage (editable, defaults to 5%)
  - Adjusted quantity (automatically calculated: Qty × (1 + Waste% / 100))
  - Unit cost (from pricing table)
  - Extended cost (Adjusted Qty × Unit Cost)

- **Import Panel**: 
  - File upload support for CSV/XLSX files (Togal export format)
  - Template download for proper file formatting
  - Automatic population of material data from external sources

- **Real-time Calculations**: 
  - Material costs are calculated automatically as quantities, waste percentages, or unit costs change
  - Total material cost updates in real-time
  - Breakdown summaries reflect the new calculation method

### Data Structure

Each material type now stores:
```javascript
{
  actMaterialQty: 0,           // Quantity
  actMaterialUnit: 'sqft',     // Unit of measurement
  actMaterialWaste: 5,         // Waste percentage
  actMaterialUnitCost: 0.45,   // Cost per unit
  // ... similar for all material types
}
```

### Calculation Logic

Material costs are calculated using the formula:
```
Extended Cost = Quantity × (1 + Waste% / 100) × Unit Cost
```

This ensures that waste factors are properly accounted for in material estimates, providing more accurate cost projections.

### Integration with Existing Features

- **Breakdowns**: Each project breakdown now includes the detailed material worksheet fields
- **Bid Versions**: Material worksheet data is saved and loaded with bid version changes
- **Quote Generation**: PDF quotes include the detailed material breakdown
- **Total Calculations**: Material costs contribute to overall estimate totals

---

## Component Structure

### UI Components (`src/components/ui/`)
- **Button**: Standardized button components
- **Card**: Content containers
- **Dialog**: Modal dialogs
- **Form Elements**: Input, Select, Textarea
- **Navigation**: Dropdown menus, tabs
- **Tables**: Data display tables
- **Toast**: Notification system

### Business Components
- **Job Management**: Complete job lifecycle
- **Time Tracking**: Clock in/out and reporting
- **Financial**: Estimates, costs, invoicing
- **Operations**: Scheduling, inventory, suppliers
- **HR**: Employee management and payroll
- **Analytics**: Reporting and dashboards

### Service Layer (`src/services/`)
- **Data Services**: Local storage management
- **Integration Services**: QuickBooks, messaging
- **Business Logic**: Calculations and validations
- **Utility Services**: Helper functions

---

## Data Management

### Local Storage Structure
```javascript
{
  "jobs": [...],                    // All job data
  "employees": [...],               // Employee records
  "timeEntries": [...],             // Time clock data
  "pieceRateEntries": [...],        // Production tracking
  "payrollReports": [...],          // Payroll data
  "schedules": [...],               // Schedule data
  "inventory": [...],               // Inventory items
  "suppliers": [...],               // Supplier data
  "checklistTemplates": [...],      // Checklist templates
  "jobMessages": {...},             // Job-specific messages
  "quickbooksQueue": [...],         // QuickBooks operations
  "userData": {...}                 // User preferences
}
```

### Data Validation
- **Input Validation**: Form field validation
- **Business Rules**: Logical data constraints
- **Error Handling**: Graceful error recovery
- **Data Integrity**: Consistent data structure

---

## Integration Points

### 1. QuickBooks Online Integration
- **OAuth 2.0**: Secure authentication
- **API Integration**: REST API calls
- **Queue System**: Failed operation retry
- **Data Sync**: Bidirectional data flow

### 2. Messaging System
- **SMS Integration**: Twilio (planned)
- **Email Integration**: SendGrid (planned)
- **Internal Messaging**: Job-specific communication

### 3. Location Services
- **GPS Tracking**: Employee location
- **Job Addresses**: Location-based features
- **Distance Calculation**: Automatic distance detection

---

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Modern web browser

### Installation
```bash
# Clone repository
git clone [repository-url]

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables
Create `.env` file in project root:
```env
# QuickBooks Integration
VITE_QUICKBOOKS_CLIENT_ID=your_client_id
VITE_QUICKBOOKS_CLIENT_SECRET=your_client_secret
VITE_QUICKBOOKS_REDIRECT_URI=http://localhost:5173/quickbooks/callback

# Messaging Services (future)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
SENDGRID_API_KEY=your_sendgrid_key
```

### Development Workflow
1. **Feature Development**: Create new components in appropriate directories
2. **State Management**: Use existing hooks pattern
3. **Data Persistence**: Follow local storage structure
4. **UI Consistency**: Use existing UI components
5. **Testing**: Test in multiple browsers and devices

---

## Known Issues & TODOs

### Current Limitations
1. **Data Persistence**: Currently using localStorage (consider database)
2. **Real-time Updates**: No real-time synchronization
3. **Offline Support**: Limited offline functionality
4. **Multi-user**: Single user application
5. **Backup/Restore**: No data backup system

### Planned Enhancements
1. **Database Integration**: Replace localStorage with proper database
2. **Real-time Sync**: WebSocket or polling for updates
3. **Mobile App**: Native mobile application
4. **Advanced Analytics**: More detailed reporting
5. **API Development**: REST API for external integrations

### Technical Debt
1. **Code Organization**: Some components need refactoring
2. **Error Handling**: Improve error handling throughout
3. **Performance**: Optimize large data sets
4. **Accessibility**: Improve accessibility features
5. **Testing**: Add comprehensive test coverage

---

## User Preferences & Requirements

### Location Tracking
- **Preference**: Integrated into time clock interface
- **Implementation**: Show job addresses on map
- **Default Distance**: Pre-set distance for clock in/out
- **User Experience**: Seamless location-based features

### Schedule Templates
- **Preference**: High-level schedule items only
- **Exclusion**: No sub-schedule task items
- **Purpose**: Simplified template management
- **Implementation**: Template system without detailed tasks

### Mobile Experience
- **Responsive Design**: Mobile-first approach
- **Touch Interface**: Touch-friendly controls
- **Offline Capability**: Basic offline functionality
- **Performance**: Fast loading on mobile devices

---

## Development Guidelines

### Code Standards
1. **Component Structure**: Functional components with hooks
2. **Naming Conventions**: PascalCase for components, camelCase for functions
3. **File Organization**: Group related components together
4. **State Management**: Use appropriate state management patterns
5. **Error Handling**: Implement comprehensive error handling

### UI/UX Guidelines
1. **Consistency**: Use existing UI component library
2. **Accessibility**: Follow WCAG guidelines
3. **Mobile First**: Design for mobile devices first
4. **Performance**: Optimize for fast loading
5. **User Feedback**: Provide clear feedback for all actions

### Testing Strategy
1. **Unit Testing**: Test individual components
2. **Integration Testing**: Test component interactions
3. **User Testing**: Test with actual users
4. **Cross-browser Testing**: Test in multiple browsers
5. **Mobile Testing**: Test on various mobile devices

---

## Conclusion

This construction management application provides a comprehensive solution for drywall contractors to manage their entire business operations. The application is well-structured, feature-rich, and ready for final development phases.

### Key Strengths
- **Comprehensive Feature Set**: Covers all major business areas
- **Modern Technology Stack**: Uses current best practices
- **User-Friendly Interface**: Intuitive and responsive design
- **Extensible Architecture**: Easy to add new features
- **Integration Ready**: Prepared for external service integration

### Next Steps for Development Team
1. **Review Architecture**: Understand the current structure
2. **Identify Gaps**: Find areas needing improvement
3. **Plan Enhancements**: Prioritize feature additions
4. **Implement Testing**: Add comprehensive test coverage
5. **Optimize Performance**: Improve loading and responsiveness
6. **Add Database**: Replace localStorage with proper database
7. **Deploy Production**: Prepare for production deployment

The application is ready for the development team to take over and complete the final implementation phase.
