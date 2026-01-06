export const campaignFormSteps = [
  {
    id: 1,
    title: "Basic Information",
    description: "Campaign name and overview",
    icon: "fa-info-circle",
    fields: ["campaignName", "campaignOverview"],
    fieldConfigs: {
      campaignName: {
        label: "Campaign Name",
        type: "text",
        placeholder: "Enter campaign name",
        required: true
      },
      campaignOverview: {
        label: "Campaign Overview",
        type: "textarea",
        placeholder: "Describe the campaign...",
        rows: 4,
        required: true
      }
    }
  },
  {
    id: 2,
    title: "Vehicle Specifications",
    description: "Vehicle details and specifications",
    icon: "fa-car",
    fields: ["yearOfManufacture", "brand", "make", "kmReading", "vehicleCondition", "otherSpecifications"],
    fieldConfigs: {
      yearOfManufacture: {
        label: "Year of Manufacture",
        type: "number",
        placeholder: "e.g., 2023",
        required: true
      },
      brand: {
        label: "Brand",
        type: "text",
        placeholder: "e.g., Toyota, Honda",
        required: true
      },
      make: {
        label: "Make/Model",
        type: "text",
        placeholder: "e.g., Corolla, Civic",
        required: true
      },
      kmReading: {
        label: "KM Reading",
        type: "number",
        placeholder: "Current mileage",
        required: true
      },
      vehicleCondition: {
        label: "Vehicle Condition",
        type: "select",
        options: [
          { value: "excellent", label: "Excellent" },
          { value: "good", label: "Good" },
          { value: "fair", label: "Fair" },
          { value: "poor", label: "Poor" }
        ],
        required: true
      },
      otherSpecifications: {
        label: "Other Specifications",
        type: "textarea",
        placeholder: "Additional vehicle details...",
        rows: 3,
        required: false
      }
    }
  },
  {
    id: 3,
    title: "Financial Details",
    description: "Pricing and financial information",
    icon: "fa-dollar-sign",
    fields: ["totalAssetValue", "downPaymentAmount", "interestRate", "interestAmount", "processingFee", "totalAmountToBePaid"],
    fieldConfigs: {
      totalAssetValue: {
        label: "Total Asset Value (BDT)",
        type: "number",
        placeholder: "Total asset price",
        required: true
      },
      downPaymentAmount: {
        label: "Down Payment Amount (BDT)",
        type: "number",
        placeholder: "Down payment required",
        required: true
      },
      interestRate: {
        label: "Interest Rate (%)",
        type: "number",
        placeholder: "Annual interest rate",
        required: true
      },
      interestAmount: {
        label: "Interest Amount (BDT)",
        type: "readonly",
        placeholder: "Calculated automatically",
        required: false
      },
      processingFee: {
        label: "Processing Fee (BDT)",
        type: "number",
        placeholder: "Processing fee amount",
        required: true
      },
      totalAmountToBePaid: {
        label: "Total Amount to be Paid (BDT)",
        type: "readonly",
        placeholder: "Calculated automatically",
        required: false
      }
    }
  },
  {
    id: 4,
    title: "Campaign Settings",
    description: "Terms and conditions",
    icon: "fa-cog",
    fields: ["termPeriodsAllowed", "startDate", "otherConditions"],
    fieldConfigs: {
      termPeriodsAllowed: {
        label: "Term Periods Allowed",
        type: "select",
        options: [
          { value: "12-months", label: "12 Months" },
          { value: "18-months", label: "18 Months" },
          { value: "24-months", label: "24 Months" },
          { value: "36-months", label: "36 Months" },
          { value: "48-months", label: "48 Months" },
          { value: "60-months", label: "60 Months" }
        ],
        required: true
      },
      startDate: {
        label: "Start Date",
        type: "date",
        placeholder: "Campaign start date",
        required: true
      },
      otherConditions: {
        label: "Other Conditions",
        type: "textarea",
        placeholder: "Additional terms and conditions...",
        rows: 3,
        required: false
      }
    }
  },
  {
    id: 5,
    title: "Vehicle Images",
    description: "Upload vehicle images",
    icon: "fa-images",
    fields: ["image1", "image2", "image3"],
    fieldConfigs: {
      image1: {
        label: "Vehicle Image 1",
        type: "file",
        accept: "image/*",
        required: true
      },
      image2: {
        label: "Vehicle Image 2",
        type: "file",
        accept: "image/*",
        required: false
      },
      image3: {
        label: "Vehicle Image 3",
        type: "file",
        accept: "image/*",
        required: false
      }
    }
  },
  {
    id: 6,
    title: "Review",
    description: "Review all information",
    icon: "fa-check-circle",
    fields: []
  }
];

export const getCampaignTableColumns = () => [
  {
    key: 'title',
    label: 'Title',
    showIcon: true,
    iconKey: 'icon',
    iconMap: {
      'car': 'fa-car',
      'auto': 'fa-taxi',
      'bike': 'fa-motorcycle'
    }
  },
  {
    key: 'category',
    label: 'Category'
  },
  {
    key: 'assetPrice',
    label: 'Asset Price (BDT)'
  },
  {
    key: 'status',
    label: 'Status',
    isBadge: true
  },
  {
    key: 'startDate',
    label: 'Start'
  },
  {
    key: 'endDate',
    label: 'End'
  },
  {
    key: 'actions',
    label: 'Actions',
    isActions: true
  }
];

export const getCampaignKPIData = () => [
  {
    title: "Total Campaigns",
    value: "127",
    trendValue: "+6.7%",
    trendLabel: "vs 119 last period",
    color: "blue",
    icon: "fa-rocket"
  },
  {
    title: "Active Campaigns",
    value: "89",
    trendValue: "+8.5%",
    trendLabel: "vs 82 last period",
    color: "green",
    icon: "fa-check-circle"
  },
  {
    title: "Pending Approval",
    value: "12",
    trendValue: "-20.0%",
    trendLabel: "vs 15 last period",
    color: "yellow",
    icon: "fa-clock"
  },
  {
    title: "Total Investment",
    value: "৳2.5M",
    trendValue: "+13.6%",
    trendLabel: "vs ৳2.2M last period",
    color: "purple",
    icon: "fa-dollar-sign"
  }
];
