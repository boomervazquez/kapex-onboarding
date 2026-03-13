// Form type identifiers and their metadata
export const FORM_DEFINITIONS = {
  credit_application: {
    id: "credit_application",
    title: "Credit Agreement & Application",
    description: "Business credit application including company information, references, and banking details.",
    routingDepartment: "Credit Department",
    routingEmail: "credit@kln.com",
    requiresSignature: true,
    estimatedMinutes: 10,
  },
  bank_authorization: {
    id: "bank_authorization",
    title: "Bank Authorization Release",
    description: "Authorizes your bank to release account information to KLN Freight (USA) Inc. for credit verification.",
    routingDepartment: "Credit Department",
    routingEmail: "credit@kln.com",
    requiresSignature: true,
    estimatedMinutes: 3,
  },
  isf_poa: {
    id: "isf_poa",
    title: "ISF Power of Attorney",
    description: "Grants K-APEX authority to file Importer Security Filing (ISF) on your behalf for import shipments.",
    routingDepartment: "Import Operations",
    routingEmail: "import.ops@kln.com",
    requiresSignature: true,
    estimatedMinutes: 5,
  },
  fppi_authorization: {
    id: "fppi_authorization",
    title: "Written Authorization – FPPI",
    description: "Authorizes K-APEX to prepare and file Electronic Export Information (EEI) via AES on your behalf.",
    routingDepartment: "Export Operations",
    routingEmail: "export.ops@kln.com",
    requiresSignature: true,
    estimatedMinutes: 5,
  },
  insurance_waiver: {
    id: "insurance_waiver",
    title: "Shipping Insurance Declaration",
    description: "Declare your insurance preference: accept K-APEX insurance coverage or waive it for your shipments.",
    routingDepartment: "Operations",
    routingEmail: "ops@kln.com",
    requiresSignature: true,
    estimatedMinutes: 3,
  },
} as const;

export type FormTypeId = keyof typeof FORM_DEFINITIONS;

// Pre-built form packages by customer type
export const FORM_PACKAGES: Record<string, { label: string; description: string; forms: FormTypeId[] }> = {
  importer: {
    label: "Importer Package",
    description: "Standard package for import customers: credit application, bank authorization, ISF POA, and insurance declaration.",
    forms: ["credit_application", "bank_authorization", "isf_poa", "insurance_waiver"],
  },
  exporter: {
    label: "Exporter Package",
    description: "Standard package for export customers: credit application, bank authorization, FPPI authorization, and insurance declaration.",
    forms: ["credit_application", "bank_authorization", "fppi_authorization", "insurance_waiver"],
  },
  both: {
    label: "Importer & Exporter Package",
    description: "Full package for customers doing both import and export operations.",
    forms: ["credit_application", "bank_authorization", "isf_poa", "fppi_authorization", "insurance_waiver"],
  },
  custom: {
    label: "Custom Selection",
    description: "Manually select the specific forms required for this customer.",
    forms: [],
  },
};
