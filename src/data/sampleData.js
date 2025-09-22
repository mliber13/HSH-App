// Sample data for testing - extracted from your actual localStorage data
export const sampleData = {
  jobs: [
    {
      "id": "mek0ijfmz4ob0qxfpgp",
      "jobName": "Test Build",
      "jobType": "residential",
      "generalContractorId": "me7cjx7lc3nem2xn7s6",
      "superintendentId": "me7ck3kjv6r5lg6cfi",
      "projectManagerId": "me7csygpuc0ugl3hyn",
      "address": "11212 Steubenville Pike Lisbon, OH 44432",
      "lockboxCode": "2468",
      "geofenceRadius": 500,
      "generalContractor": "Payne and Payne",
      "superintendent": "Nick Darone",
      "projectManager": "Jeff Drebus",
      "financialCategories": ["drywall"],
      "status": "active",
      "scopes": [
        {
          "id": "mellg0u8btx61mvunqt",
          "jobId": "mek0ijfmz4ob0qxfpgp",
          "name": "Hang",
          "description": "Drywall hanging with specified thickness for ceilings and walls.",
          "status": "Not Started",
          "ceilingThickness": "5/8\"",
          "wallThickness": "1/2\"",
          "hangExceptions": "5/8\" at garage firewall. Moisture resistant drywall at wet walls.",
          "createdAt": "2025-08-21T16:06:12.032Z",
          "updatedAt": "2025-08-21T16:06:12.032Z"
        },
        {
          "id": "mellg0u8d1v4irnsdbp",
          "jobId": "mek0ijfmz4ob0qxfpgp",
          "name": "Finish",
          "description": "Drywall finishing with specified textures and finishes.",
          "status": "Not Started",
          "ceilingFinish": "Stomp Knockdown",
          "ceilingExceptions": "",
          "wallFinish": "Level 4 Smooth",
          "wallExceptions": "Roll Texture Garage walls and Small Closet Walls.",
          "createdAt": "2025-08-21T16:06:12.032Z",
          "updatedAt": "2025-08-21T16:06:12.032Z"
        }
      ],
      "takeoffPhases": [
        {
          "id": "melliy1is958vmmf5g",
          "jobId": "mek0ijfmz4ob0qxfpgp",
          "name": "Main Scope",
          "materials": [
            {
              "id": "material-1755792606589-0.19846668041063165",
              "type": "Corner Bead",
              "subtype": "Square Bead",
              "length": "9'",
              "threadType": "",
              "quantity": "25",
              "unit": "pcs"
            },
            {
              "id": "auto-1755792616926-1",
              "type": "Joint Compound",
              "subtype": "All Purpose Joint Compound",
              "quantity": "22",
              "unit": "Box",
              "autoCalculated": true
            },
            {
              "id": "auto-1755792616926-2",
              "type": "Joint Compound",
              "subtype": "Lite Weight Joint Compound",
              "quantity": "18",
              "unit": "Box",
              "autoCalculated": true
            },
            {
              "id": "auto-1755792616926-3",
              "type": "Joint Compound",
              "subtype": "Easy Sand 90",
              "quantity": "5",
              "unit": "Bags",
              "autoCalculated": true
            },
            {
              "id": "auto-1755792616926-4",
              "type": "Fasteners",
              "subtype": "Drywall Screws 1-1/4\"",
              "threadType": "Coarse Thread",
              "quantity": "2",
              "unit": "Box",
              "autoCalculated": true
            },
            {
              "id": "auto-1755792616926-5",
              "type": "Adhesives",
              "subtype": "TiteBond Foam",
              "quantity": "2",
              "unit": "Tube",
              "autoCalculated": true
            },
            {
              "id": "auto-1755792616926-6",
              "type": "Adhesives",
              "subtype": "Spray Adhesive",
              "quantity": "1",
              "unit": "Can",
              "autoCalculated": true
            },
            {
              "id": "auto-1755792616926-7",
              "type": "Tape",
              "subtype": "500' Paper Tape",
              "quantity": "7",
              "unit": "Roll",
              "autoCalculated": true
            },
            {
              "id": "auto-1755792616926-8",
              "type": "Tape",
              "subtype": "300' Mesh Tape",
              "quantity": "1",
              "unit": "Roll",
              "autoCalculated": true
            }
          ],
          "entries": [
            {
              "id": "melljzpmczu4ufx8uy4",
              "phaseId": "melliy1is958vmmf5g",
              "notes": "",
              "boards": [
                {
                  "boardType": "Standard",
                  "thickness": "5/8",
                  "width": "48",
                  "length": "12",
                  "quantity": "200",
                  "id": 1755792525496
                }
              ],
              "createdAt": "2025-08-21T16:09:17.194Z",
              "updatedAt": "2025-08-21T16:09:17.194Z",
              "floorSpace": "1st Floor"
            }
          ],
          "createdAt": "2025-08-21T16:08:28.374Z",
          "updatedAt": "2025-08-21T16:10:16.927Z"
        }
      ],
      "checklists": [],
      "financials": {
        "estimate": {
          "sqft": 10000,
          "drywallMaterialRate": 0.66,
          "hangerRate": 0.27,
          "finisherRate": 0.27,
          "prepCleanRate": 0.03,
          "drywallSalesTaxRate": 7.25,
          "totalEstimateAmount": 17500,
          "quote": 0,
          "scopeQuotes": [
            {
              "scopeId": "mek0ir9hi9ruy368s0m",
              "scopeName": "Hang",
              "quoteAmount": 0
            },
            {
              "scopeId": "mek0ir9hscw0lnqxak",
              "scopeName": "Finish",
              "quoteAmount": 0
            },
            {
              "scopeId": "mellg0u8btx61mvunqt",
              "scopeName": "Hang",
              "quoteAmount": 0
            },
            {
              "scopeId": "mellg0u8d1v4irnsdbp",
              "scopeName": "Finish",
              "quoteAmount": 0
            }
          ],
          "act": {
            "materialRate": 0,
            "laborRate": 0,
            "unit": "sqft",
            "salesTaxRate": 0
          },
          "channel": {
            "materialRate": 0,
            "laborRate": 0,
            "unit": "lf",
            "salesTaxRate": 0
          },
          "door": {
            "installRate": 0,
            "unit": "ea",
            "salesTaxRate": 0
          },
          "insulation": {
            "materialRate": 0,
            "laborRate": 0,
            "unit": "sqft",
            "salesTaxRate": 0
          },
          "metalFraming": {
            "materialRate": 0,
            "laborRate": 0,
            "unit": "lf",
            "salesTaxRate": 0
          },
          "suspendedGrid": {
            "materialRate": 0,
            "laborRate": 0,
            "unit": "sqft",
            "salesTaxRate": 0
          },
          "other": {
            "materialRate": 0,
            "materialDescription": "",
            "laborRate": 0,
            "laborDescription": "",
            "unit": "sqft",
            "salesTaxRate": 0
          }
        },
        "fieldRevised": {
          "hangerRate": 0.27,
          "finisherRate": 0.29,
          "prepCleanRate": 0.03,
          "sqft": 9600,
          "drywallMaterialRate": 0.66,
          "drywallSalesTaxRate": 7.25,
          "drywallMaterialCost": 6336,
          "changeOrders": [],
          "act": {
            "laborRate": 0
          },
          "channel": {
            "laborRate": 0
          },
          "door": {
            "installRate": 0
          },
          "insulation": {
            "laborRate": 0
          },
          "metalFraming": {
            "laborRate": 0
          },
          "suspendedGrid": {
            "laborRate": 0
          },
          "other": {
            "laborRate": 0,
            "laborDescription": ""
          }
        },
        "actual": {
          "changeOrders": [],
          "materialInvoices": [
            {
              "id": "invoice-1755697418491-0.6214491658042793",
              "supplierName": "L&W Supply",
              "invoiceNumber": "1234",
              "sqftDelivered": 9600,
              "dollarAmount": 5664.23,
              "salesTax": 441.79,
              "notes": "",
              "createdAt": "2025-08-20T13:43:38.491Z",
              "updatedAt": "2025-08-20T13:43:38.491Z"
            }
          ],
          "drywallMaterialCost": 0,
          "drywallSalesTaxCost": 0,
          "laborCosts": [],
          "manualLaborCosts": [],
          "act": {
            "materialCost": 0,
            "laborCost": 0,
            "salesTaxCost": 0
          },
          "channel": {
            "materialCost": 0,
            "laborCost": 0,
            "salesTaxCost": 0
          },
          "door": {
            "installCost": 0,
            "salesTaxCost": 0
          },
          "insulation": {
            "materialCost": 0,
            "laborCost": 0,
            "salesTaxCost": 0
          },
          "metalFraming": {
            "materialCost": 0,
            "laborCost": 0,
            "salesTaxCost": 0
          },
          "suspendedGrid": {
            "materialCost": 0,
            "laborCost": 0,
            "salesTaxCost": 0
          },
          "other": {
            "materialCost": 0,
            "materialDescription": "",
            "laborCost": 0,
            "laborDescription": "",
            "salesTaxCost": 0
          }
        }
      },
      "createdAt": "2025-08-21T16:08:28.374Z",
      "updatedAt": "2025-08-21T16:10:16.927Z"
    }
  ],
  employees: [
    {
      "id": "test-hanger-1",
      "firstName": "Mike",
      "lastName": "Johnson",
      "email": "mike.johnson@example.com",
      "phone": "(555) 123-4567",
      "employeeType": "Employee",
      "role": "Hanger",
      "payType": "hourly",
      "hourlyRate": 28,
      "salaryAmount": 0,
      "isActive": true,
      "bankedHours": 0,
      "perDiem": 0,
      "fuelAllowance": 0,
      "toolDeductions": [],
      "childSupportDeduction": 0,
      "miscDeduction": 0,
      "miscDeductionNote": "",
      "documents": [],
      "createdAt": "2025-08-19T19:24:27.740Z",
      "updatedAt": "2025-08-21T16:20:28.701Z",
      "onboardingStatus": null,
      "onboardingStartDate": null,
      "onboardingCompletedDate": null,
      "onboardingData": null
    },
    {
      "id": "test-finisher-1",
      "firstName": "Sarah",
      "lastName": "Williams",
      "email": "sarah.williams@example.com",
      "phone": "(555) 234-5678",
      "employeeType": "1099 Contractor",
      "role": "Finisher",
      "payType": "hourly",
      "hourlyRate": 30,
      "salaryAmount": 0,
      "isActive": true,
      "bankedHours": 0,
      "perDiem": 0,
      "fuelAllowance": 100,
      "toolDeductions": [
        {
          "id": "tool-1",
          "description": "Drywall Lift",
          "totalAmount": 1000,
          "weeklyDeduction": 100,
          "remainingBalance": 700,
          "startDate": "2025-08-19T19:24:27.740Z"
        }
      ],
      "childSupportDeduction": 150,
      "miscDeduction": 0,
      "miscDeductionNote": "",
      "documents": [],
      "createdAt": "2025-08-19T19:24:27.740Z",
      "updatedAt": "2025-08-21T16:20:28.701Z",
      "onboardingStatus": null,
      "onboardingStartDate": null,
      "onboardingCompletedDate": null,
      "onboardingData": null
    },
    {
      "id": "mejzwpx51zsoq0ahyu4",
      "firstName": "Dave",
      "lastName": "Busico",
      "email": "dbfungol@gmail.com",
      "phone": "",
      "employeeType": "Employee",
      "role": "Finisher",
      "payType": "hourly",
      "hourlyRate": 55,
      "salaryAmount": 0,
      "perDiem": 0,
      "fuelAllowance": 100,
      "bankedHours": 0,
      "toolDeductions": [],
      "documents": [],
      "childSupportDeduction": 0,
      "miscDeduction": 0,
      "miscDeductionNote": "",
      "isActive": true,
      "createdAt": "2025-08-20T13:15:33.305Z",
      "updatedAt": "2025-08-21T16:20:28.701Z",
      "onboardingStatus": "in_progress",
      "onboardingStartDate": "2025-08-20T13:16:02.690Z",
      "onboardingData": {
        "message": "Hi Dave,\n\nWelcome to HSH Drywall! Please complete the following onboarding documents at your earliest convenience.\n\nBest regards,\nHSH HR Team",
        "documents": [
          {
            "id": "w4",
            "name": "W-4 Form",
            "required": true,
            "description": "Employee's Withholding Certificate",
            "status": "sent",
            "sentDate": "2025-08-20T13:16:02.690Z"
          },
          {
            "id": "i9",
            "name": "I-9 Form",
            "required": true,
            "description": "Employment Eligibility Verification",
            "status": "sent",
            "sentDate": "2025-08-20T13:16:02.690Z"
          },
          {
            "id": "direct_deposit",
            "name": "Direct Deposit Form",
            "required": false,
            "description": "Bank account information for payroll",
            "status": "sent",
            "sentDate": "2025-08-20T13:16:02.690Z"
          },
          {
            "id": "emergency_contact",
            "name": "Emergency Contact Form",
            "required": true,
            "description": "Emergency contact information",
            "status": "sent",
            "sentDate": "2025-08-20T13:16:02.690Z"
          },
          {
            "id": "employee_handbook",
            "name": "Employee Handbook Acknowledgment",
            "required": true,
            "description": "Company policies and procedures",
            "status": "sent",
            "sentDate": "2025-08-20T13:16:02.690Z"
          },
          {
            "id": "safety_training",
            "name": "Safety Training Acknowledgment",
            "required": true,
            "description": "Workplace safety guidelines",
            "status": "sent",
            "sentDate": "2025-08-20T13:16:02.690Z"
          },
          {
            "id": "benefits_enrollment",
            "name": "Benefits Enrollment Form",
            "required": false,
            "description": "Health insurance and benefits options",
            "status": "sent",
            "sentDate": "2025-08-20T13:16:02.690Z"
          }
        ],
        "dueDate": "2025-08-27",
        "sendEmail": true,
        "sendSMS": false,
        "sentDate": "2025-08-20T13:16:02.690Z"
      },
      "onboardingCompletedDate": null
    },
    {
      "id": "mek0hn5o7fit5wq4e8u",
      "firstName": "Roberto",
      "lastName": "Galvan",
      "email": "rbgalan@gmail.com",
      "phone": "",
      "employeeType": "1099 Contractor",
      "role": "Hanger",
      "payType": "hourly",
      "hourlyRate": 30,
      "salaryAmount": 0,
      "perDiem": 35,
      "fuelAllowance": 0,
      "bankedHours": 0,
      "toolDeductions": [],
      "documents": [],
      "childSupportDeduction": 0,
      "miscDeduction": 0,
      "miscDeductionNote": "",
      "isActive": true,
      "createdAt": "2025-08-20T13:31:49.500Z",
      "updatedAt": "2025-08-21T16:20:28.701Z",
      "onboardingStatus": null,
      "onboardingStartDate": null,
      "onboardingCompletedDate": null,
      "onboardingData": null
    }
  ],
  timeEntries: [
    {
      "id": "mek41tcnh2jjfaabrld",
      "employeeId": "mek0hn5o7fit5wq4e8u",
      "jobId": "mek0ijfmz4ob0qxfpgp",
      "clockInTime": "2025-08-20T15:11:17.360Z",
      "clockOutTime": "2025-08-20T15:11:29.495Z",
      "totalHours": 8,
      "notes": "Assisted Mike Johnson with hanging piece rate work",
      "entryType": "hourly",
      "createdAt": "2025-08-20T15:11:29.495Z",
      "updatedAt": "2025-08-20T15:11:29.495Z"
    },
    {
      "id": "mek5ge4xn5e5b93jomh",
      "employeeId": "test-finisher-1",
      "jobId": "mek0ijfmz4ob0qxfpgp",
      "clockInTime": "2025-08-20T15:48:26.226Z",
      "clockOutTime": "2025-08-20T15:50:49.233Z",
      "totalHours": 8,
      "notes": "Assisted Dave Busico with skim coat piece rate work",
      "entryType": "hourly",
      "createdAt": "2025-08-20T15:50:49.233Z",
      "updatedAt": "2025-08-20T15:50:49.233Z"
    },
    {
      "id": "mek5kncbpgfz8y5vlts",
      "employeeId": "test-finisher-1",
      "jobId": "mek0ijfmz4ob0qxfpgp",
      "clockInTime": "2025-08-20T15:52:34.065Z",
      "clockOutTime": "2025-08-20T15:54:07.787Z",
      "totalHours": 8,
      "notes": "Assisted Dave Busico with texture coat piece rate work",
      "entryType": "hourly",
      "createdAt": "2025-08-20T15:54:07.787Z",
      "updatedAt": "2025-08-20T15:54:07.787Z"
    },
    {
      "id": "mek5lp7xavusowljpko",
      "employeeId": "test-finisher-1",
      "jobId": "mek0ijfmz4ob0qxfpgp",
      "clockInTime": "2025-08-20T15:54:44.359Z",
      "clockOutTime": "2025-08-20T15:54:56.877Z",
      "totalHours": 8,
      "notes": "Assisted Dave Busico with sand coat piece rate work",
      "entryType": "hourly",
      "createdAt": "2025-08-20T15:54:56.877Z",
      "updatedAt": "2025-08-20T15:54:56.877Z"
    }
  ],
  pieceRateEntries: [
    {
      "id": "mek41jzkhibpfwiyvwg",
      "employeeId": "test-hanger-1",
      "jobId": "mek0ijfmz4ob0qxfpgp",
      "role": "Hanger",
      "coat": "hang",
      "startTime": "2025-08-20T15:11:17.360Z",
      "endTime": "2025-08-20T15:11:29.495Z",
      "status": "completed",
      "completionPercentage": 100,
      "pieceRate": 0.27,
      "totalEarnings": 2352,
      "apprenticeId": "mek0hn5o7fit5wq4e8u",
      "apprenticeHours": 8,
      "apprenticeCost": 0,
      "notes": "",
      "createdAt": "2025-08-20T15:11:17.360Z",
      "updatedAt": "2025-08-20T15:11:29.495Z"
    },
    {
      "id": "mek45oidx44wael3tia",
      "employeeId": "mejzwpx51zsoq0ahyu4",
      "jobId": "mek0ijfmz4ob0qxfpgp",
      "role": "Finisher",
      "coat": "tape",
      "startTime": "2025-08-20T15:14:29.845Z",
      "endTime": "2025-08-20T15:14:49.796Z",
      "status": "completed",
      "completionPercentage": 100,
      "pieceRate": 0.29,
      "totalEarnings": 556.8,
      "apprenticeId": null,
      "apprenticeHours": 0,
      "apprenticeCost": 0,
      "notes": "",
      "createdAt": "2025-08-20T15:14:29.845Z",
      "updatedAt": "2025-08-20T15:14:49.796Z"
    },
    {
      "id": "mek5c4etgubjuqzq828",
      "employeeId": "mejzwpx51zsoq0ahyu4",
      "jobId": "mek0ijfmz4ob0qxfpgp",
      "role": "Finisher",
      "coat": "bed",
      "startTime": "2025-08-20T15:47:30.005Z",
      "endTime": "2025-08-20T15:47:50.347Z",
      "status": "completed",
      "completionPercentage": 100,
      "pieceRate": 0.29,
      "totalEarnings": 556.8,
      "apprenticeId": null,
      "apprenticeHours": 0,
      "apprenticeCost": 0,
      "notes": "",
      "createdAt": "2025-08-20T15:47:30.005Z",
      "updatedAt": "2025-08-20T15:47:50.347Z"
    },
    {
      "id": "mek5dbsixexov97g05",
      "employeeId": "mejzwpx51zsoq0ahyu4",
      "jobId": "mek0ijfmz4ob0qxfpgp",
      "role": "Finisher",
      "coat": "skim",
      "startTime": "2025-08-20T15:48:26.226Z",
      "endTime": "2025-08-20T15:50:49.233Z",
      "status": "completed",
      "completionPercentage": 100,
      "pieceRate": 0.29,
      "totalEarnings": 316.8,
      "apprenticeId": "test-finisher-1",
      "apprenticeHours": 8,
      "apprenticeCost": 0,
      "notes": "",
      "createdAt": "2025-08-20T15:48:26.226Z",
      "updatedAt": "2025-08-20T15:50:49.233Z"
    },
    {
      "id": "mek5in0xzcgtfb1gref",
      "employeeId": "mejzwpx51zsoq0ahyu4",
      "jobId": "mek0ijfmz4ob0qxfpgp",
      "role": "Finisher",
      "coat": "texture",
      "startTime": "2025-08-20T15:52:34.065Z",
      "endTime": "2025-08-20T15:54:07.787Z",
      "status": "completed",
      "completionPercentage": 100,
      "pieceRate": 0.29,
      "totalEarnings": 316.8,
      "apprenticeId": "test-finisher-1",
      "apprenticeHours": 8,
      "apprenticeCost": 0,
      "notes": "",
      "createdAt": "2025-08-20T15:52:34.065Z",
      "updatedAt": "2025-08-20T15:54:07.787Z"
    },
    {
      "id": "mek5lfk76rrb1ovgz7o",
      "employeeId": "mejzwpx51zsoq0ahyu4",
      "jobId": "mek0ijfmz4ob0qxfpgp",
      "role": "Finisher",
      "coat": "sand",
      "startTime": "2025-08-20T15:54:44.359Z",
      "endTime": "2025-08-20T15:54:56.877Z",
      "status": "completed",
      "completionPercentage": 100,
      "pieceRate": 0.29,
      "totalEarnings": 316.8,
      "apprenticeId": "test-finisher-1",
      "apprenticeHours": 8,
      "apprenticeCost": 240,
      "notes": "",
      "createdAt": "2025-08-20T15:54:44.359Z",
      "updatedAt": "2025-08-20T15:54:56.877Z"
    }
  ],
  payrollEntries: []
};

// Function to initialize sample data in localStorage
export const initializeSampleData = () => {
  // Only initialize if localStorage is empty (check both old and new key formats)
  const hasJobs = localStorage.getItem('hsh_drywall_jobs_v2') || localStorage.getItem('hsh_drywall_jobs') || localStorage.getItem('hsh_jobs');
  
  if (!hasJobs || JSON.parse(hasJobs).length === 0) {
    console.log('Initializing sample data...');
    
    // Use the correct keys that the app actually uses
    localStorage.setItem('hsh_drywall_jobs_v2', JSON.stringify(sampleData.jobs));
    localStorage.setItem('hsh_drywall_employees_v2', JSON.stringify(sampleData.employees));
    localStorage.setItem('hsh_drywall_time_entries_v2', JSON.stringify(sampleData.timeEntries));
    localStorage.setItem('hsh_drywall_piece_rate_entries_v2', JSON.stringify(sampleData.pieceRateEntries));
    localStorage.setItem('hsh_drywall_payroll_entries_v2', JSON.stringify(sampleData.payrollEntries));
    
    console.log('Sample data initialized!');
  }
};
