import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { FORM_DEFINITIONS } from "@shared/forms";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  Paperclip,
  RefreshCw,
  Send,
  Shield,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearch } from "wouter";
import { toast } from "sonner";
import type { FormAssignment } from "../../../drizzle/schema";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663422523197/hseGhsrVbVzK9EhSTDG2Rt/kapex-logo_1a013539.png";

// ─── Form field renderers ─────────────────────────────────────────────────────

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide border-b border-border pb-2 mb-4 mt-6 first:mt-0">
      {children}
    </h3>
  );
}

// ─── Individual Form Components ───────────────────────────────────────────────

function CreditApplicationForm({ data, onChange }: { data: Record<string, string>; onChange: (k: string, v: string) => void }) {
  const f = (k: string) => data[k] ?? "";
  return (
    <div>
      <SectionTitle>Applicant Information</SectionTitle>
      <div className="space-y-4">
        <Field label="Name of Credit Applicant(s) to be listed on the Account" required>
          <Input value={f("applicantName")} onChange={(e) => onChange("applicantName", e.target.value)} placeholder="Full legal name(s)" />
        </Field>
        <FieldGroup>
          <Field label="Street Address" required>
            <Input value={f("streetAddress")} onChange={(e) => onChange("streetAddress", e.target.value)} placeholder="123 Main St" />
          </Field>
          <Field label="City" required>
            <Input value={f("city")} onChange={(e) => onChange("city", e.target.value)} />
          </Field>
          <Field label="Zip Code" required>
            <Input value={f("zip")} onChange={(e) => onChange("zip", e.target.value)} />
          </Field>
          <Field label="Phone" required>
            <Input value={f("phone")} onChange={(e) => onChange("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
          </Field>
        </FieldGroup>
        <FieldGroup>
          <Field label="Billing Address">
            <Input value={f("billingAddress")} onChange={(e) => onChange("billingAddress", e.target.value)} placeholder="If different from above" />
          </Field>
          <Field label="Billing City">
            <Input value={f("billingCity")} onChange={(e) => onChange("billingCity", e.target.value)} />
          </Field>
          <Field label="Billing Zip">
            <Input value={f("billingZip")} onChange={(e) => onChange("billingZip", e.target.value)} />
          </Field>
          <Field label="Fax">
            <Input value={f("fax")} onChange={(e) => onChange("fax", e.target.value)} />
          </Field>
        </FieldGroup>
      </div>

      <SectionTitle>Business Information</SectionTitle>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Business Type <span className="text-destructive">*</span></Label>
          <div className="flex flex-wrap gap-4">
            {["Corporation", "Limited Partners", "Partners", "Sole Owner", "Individual"].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox
                  checked={f("businessType") === type}
                  onCheckedChange={() => onChange("businessType", type)}
                />
                {type}
              </label>
            ))}
          </div>
        </div>
        <FieldGroup>
          <Field label="Type of Business" required>
            <Input value={f("typeOfBusiness")} onChange={(e) => onChange("typeOfBusiness", e.target.value)} placeholder="e.g., Freight Importer" />
          </Field>
          <Field label="IRS #">
            <Input value={f("irsNumber")} onChange={(e) => onChange("irsNumber", e.target.value)} placeholder="EIN or SSN" />
          </Field>
          <Field label="Year Established">
            <Input value={f("yearEstablished")} onChange={(e) => onChange("yearEstablished", e.target.value)} placeholder="e.g., 2005" />
          </Field>
          <Field label="At Present Location Since">
            <Input value={f("locationSince")} onChange={(e) => onChange("locationSince", e.target.value)} />
          </Field>
          <Field label="Dun & Bradstreet #">
            <Input value={f("dunBradstreet")} onChange={(e) => onChange("dunBradstreet", e.target.value)} />
          </Field>
          <Field label="Annual Sales $">
            <Input value={f("annualSales")} onChange={(e) => onChange("annualSales", e.target.value)} placeholder="e.g., 5,000,000" />
          </Field>
          <Field label="Terms of Payment">
            <Input value={f("termsOfPayment")} onChange={(e) => onChange("termsOfPayment", e.target.value)} placeholder="e.g., Net 30" />
          </Field>
          <Field label="Credit Requested $" required>
            <Input value={f("creditRequested")} onChange={(e) => onChange("creditRequested", e.target.value)} placeholder="e.g., 50,000" />
          </Field>
        </FieldGroup>
      </div>

      <SectionTitle>Owners, Partners, or Officers</SectionTitle>
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <FieldGroup key={n}>
            <Field label={`Name ${n}`}>
              <Input value={f(`ownerName${n}`)} onChange={(e) => onChange(`ownerName${n}`, e.target.value)} />
            </Field>
            <Field label={`Title ${n}`}>
              <Input value={f(`ownerTitle${n}`)} onChange={(e) => onChange(`ownerTitle${n}`, e.target.value)} />
            </Field>
          </FieldGroup>
        ))}
      </div>

      <SectionTitle>Trade References (Open Account)</SectionTitle>
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label={`Reference ${n} Name`}>
              <Input value={f(`refName${n}`)} onChange={(e) => onChange(`refName${n}`, e.target.value)} />
            </Field>
            <Field label="Phone">
              <Input value={f(`refPhone${n}`)} onChange={(e) => onChange(`refPhone${n}`, e.target.value)} />
            </Field>
            <Field label="Email">
              <Input value={f(`refEmail${n}`)} onChange={(e) => onChange(`refEmail${n}`, e.target.value)} type="email" />
            </Field>
          </div>
        ))}
      </div>

      <SectionTitle>Banking Information</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Bank Name" required>
          <Input value={f("bankName")} onChange={(e) => onChange("bankName", e.target.value)} />
        </Field>
        <Field label="Branch">
          <Input value={f("bankBranch")} onChange={(e) => onChange("bankBranch", e.target.value)} />
        </Field>
        <Field label="Contact">
          <Input value={f("bankContact")} onChange={(e) => onChange("bankContact", e.target.value)} />
        </Field>
        <Field label="Account #" required>
          <Input value={f("bankAccountNumber")} onChange={(e) => onChange("bankAccountNumber", e.target.value)} />
        </Field>
        <Field label="Phone">
          <Input value={f("bankPhone")} onChange={(e) => onChange("bankPhone", e.target.value)} />
        </Field>
      </div>

      <SectionTitle>Shipping & Billing Contact</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Anticipated Shipments/Month">
          <Input value={f("shipmentsPerMonth")} onChange={(e) => onChange("shipmentsPerMonth", e.target.value)} placeholder="e.g., 10" />
        </Field>
        <Field label="Payable Contact Name">
          <Input value={f("payableContact")} onChange={(e) => onChange("payableContact", e.target.value)} />
        </Field>
        <Field label="Payable Email">
          <Input value={f("payableEmail")} onChange={(e) => onChange("payableEmail", e.target.value)} type="email" />
        </Field>
        <Field label="Payable Phone">
          <Input value={f("payablePhone")} onChange={(e) => onChange("payablePhone", e.target.value)} />
        </Field>
        <Field label="Payable Fax">
          <Input value={f("payableFax")} onChange={(e) => onChange("payableFax", e.target.value)} />
        </Field>
      </div>

      <div className="mt-6 p-4 bg-muted/40 rounded-lg border border-border text-xs text-muted-foreground leading-relaxed">
        <p className="font-semibold text-foreground mb-1">Terms & Conditions</p>
        <p>Unless other specific arrangements have been made in advance, each invoice is due and payable upon presentation. This policy is based on our requirement to advance large sums to U.S. Customs, Carriers, and Forwarders on your behalf. Past due invoices are subject to interest charges. KLN Freight (USA) Inc reserves the right to modify a client's status without prior notice. All business is conducted according to the National Customs Brokers and Freight Forwarders Association of America, Inc. Terms and Conditions of Service.</p>
      </div>
    </div>
  );
}

function BankAuthorizationForm({ data, onChange }: { data: Record<string, string>; onChange: (k: string, v: string) => void }) {
  const f = (k: string) => data[k] ?? "";
  return (
    <div>
      <div className="bg-accent/40 border border-primary/20 rounded-lg p-4 mb-6 text-sm">
        <p className="font-medium text-foreground mb-1">About This Form</p>
        <p className="text-muted-foreground">This authorization allows your bank to release account information to KLN Freight (USA) Inc. for credit verification purposes. Any information provided will be held in strict confidence.</p>
      </div>
      <SectionTitle>Authorization Details</SectionTitle>
      <div className="space-y-4">
        <FieldGroup>
          <Field label="Company Name" required>
            <Input value={f("companyName")} onChange={(e) => onChange("companyName", e.target.value)} />
          </Field>
          <Field label="Checking Account No." required>
            <Input value={f("checkingAccountNo")} onChange={(e) => onChange("checkingAccountNo", e.target.value)} />
          </Field>
        </FieldGroup>
        <Field label="Bank Name" required>
          <Input value={f("bankName")} onChange={(e) => onChange("bankName", e.target.value)} placeholder="Name of your bank" />
        </Field>
      </div>
      <div className="mt-6 p-4 bg-muted/40 rounded-lg border border-border text-xs text-muted-foreground">
        <p>You are hereby authorizing your bank to release account information regarding your accounts or lines of credit to KLN Freight (USA) Inc. Please debit your checking account for any charges related to this bank information request.</p>
        <p className="mt-2 font-medium text-foreground">KLN Freight (USA) Inc. — Credit Department<br />Fax: (650)-589-9104</p>
      </div>
    </div>
  );
}

function ISFPOAForm({ data, onChange }: { data: Record<string, string>; onChange: (k: string, v: string) => void }) {
  const f = (k: string) => data[k] ?? "";
  return (
    <div>
      <div className="bg-accent/40 border border-primary/20 rounded-lg p-4 mb-6 text-sm">
        <p className="font-medium text-foreground mb-1">Importer Security Filing (ISF) Power of Attorney</p>
        <p className="text-muted-foreground">This document grants K-APEX (Kerry Freight USA Inc.) authority to file ISF on your behalf for import shipments into the United States.</p>
      </div>
      <SectionTitle>Principal Information</SectionTitle>
      <div className="space-y-4">
        <FieldGroup>
          <Field label="EIN # (Employer Identification Number)" required>
            <Input value={f("ein")} onChange={(e) => onChange("ein", e.target.value)} placeholder="XX-XXXXXXX" />
          </Field>
          <Field label="Legal Designation" required>
            <Input value={f("legalDesignation")} onChange={(e) => onChange("legalDesignation", e.target.value)} placeholder="e.g., Corporation, Individual" />
          </Field>
        </FieldGroup>
        <Field label="Name of Principal (Company or Individual)" required>
          <Input value={f("principalName")} onChange={(e) => onChange("principalName", e.target.value)} />
        </Field>
        <Field label="Residing At / Business Address" required>
          <Input value={f("address")} onChange={(e) => onChange("address", e.target.value)} />
        </Field>
        <Field label="Doing Business Under the Laws of the State of" required>
          <Input value={f("stateOfBusiness")} onChange={(e) => onChange("stateOfBusiness", e.target.value)} placeholder="e.g., California" />
        </Field>
        <Field label="POA Valid Until (Date)">
          <Input value={f("poaValidUntil")} onChange={(e) => onChange("poaValidUntil", e.target.value)} type="date" />
        </Field>
      </div>
      <div className="mt-6 p-4 bg-muted/40 rounded-lg border border-border text-xs text-muted-foreground">
        <p>By signing, you hereby appoint <strong>Kerry Freight (USA) Inc. - DBA Kerry Apex (MIA), 1530 NW 98th Court Suite 100, Doral, FL 33172</strong> as a true and lawful agent with full power and authority to perform Importer Security Filing (ISF) on behalf of the principal without limitation. All penalties associated with incorrect or late information will be for the account of the principal unless proven to be the fault of the agent.</p>
      </div>
    </div>
  );
}

function FPPIAuthorizationForm({ data, onChange }: { data: Record<string, string>; onChange: (k: string, v: string) => void }) {
  const f = (k: string) => data[k] ?? "";
  return (
    <div>
      <div className="bg-accent/40 border border-primary/20 rounded-lg p-4 mb-6 text-sm">
        <p className="font-medium text-foreground mb-1">Written Authorization — Foreign Principal Party in Interest (FPPI)</p>
        <p className="text-muted-foreground">This authorization is required by U.S. law (15 CFR 30.3) for KLN Freight USA, Inc. to prepare and file Electronic Export Information (EEI) via the Automated Export System (AES) on your behalf.</p>
      </div>
      <SectionTitle>FPPI Information</SectionTitle>
      <div className="space-y-4">
        <Field label="Company Name of Foreign Principal Party in Interest" required>
          <Input value={f("fppiCompanyName")} onChange={(e) => onChange("fppiCompanyName", e.target.value)} />
        </Field>
        <Field label="Address">
          <Input value={f("fppiAddress")} onChange={(e) => onChange("fppiAddress", e.target.value)} />
        </Field>
        <Field label="Country">
          <Input value={f("fppiCountry")} onChange={(e) => onChange("fppiCountry", e.target.value)} />
        </Field>
      </div>
      <div className="mt-6 p-4 bg-muted/40 rounded-lg border border-border text-xs text-muted-foreground">
        <p>The above company hereby authorizes <strong>KLN Freight USA, Inc.</strong> to act as forwarding agent for U.S. export control purposes and to prepare and file the EEI via AES on their behalf. This authorization shall remain in effect until revoked by written notice and is effective for all routed export shipments originating from the United States to the FPPI listed above.</p>
      </div>
    </div>
  );
}

function InsuranceWaiverForm({ data, onChange }: { data: Record<string, string>; onChange: (k: string, v: string) => void }) {
  const f = (k: string) => data[k] ?? "";
  const choice = f("insuranceChoice");
  return (
    <div>
      <div className="bg-accent/40 border border-primary/20 rounded-lg p-4 mb-6 text-sm">
        <p className="font-medium text-foreground mb-1">Shipping Insurance Declaration</p>
        <p className="text-muted-foreground">K-APEX's policy is to insure all shipments for full replacement value. Please indicate your preference below.</p>
      </div>
      <SectionTitle>Insurance Preference</SectionTitle>
      <div className="space-y-3">
        <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${choice === "accept" ? "border-primary bg-accent" : "border-border hover:border-primary/40"}`}>
          <input type="radio" name="insurance" value="accept" checked={choice === "accept"} onChange={() => onChange("insuranceChoice", "accept")} className="mt-1" />
          <div>
            <p className="font-semibold text-foreground">Accept Insurance Coverage</p>
            <p className="text-sm text-muted-foreground mt-1">I would like K-APEX to insure my shipments for full replacement value. Insurance premiums will apply.</p>
          </div>
        </label>
        <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${choice === "waive" ? "border-destructive/60 bg-destructive/5" : "border-border hover:border-destructive/40"}`}>
          <input type="radio" name="insurance" value="waive" checked={choice === "waive"} onChange={() => onChange("insuranceChoice", "waive")} className="mt-1" />
          <div>
            <p className="font-semibold text-foreground">Waive Insurance Coverage</p>
            <p className="text-sm text-muted-foreground mt-1">I choose to decline insurance on future shipments. I accept full responsibility for any loss or damage once shipments have left K-APEX's facility.</p>
          </div>
        </label>
      </div>
      {choice === "waive" && (
        <div className="mt-4 p-4 bg-destructive/5 border border-destructive/20 rounded-lg text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Important Notice</p>
          <p>By waiving insurance, you agree to make payment in full for any freight charges and merchandise regardless of condition received, and for any missing merchandise that may be lost during transit. K-APEX's only burden of proof of shipment will be to provide a tracking number.</p>
        </div>
      )}
      <Field label="Company / Position (if applicable)" required>
        <Input className="mt-4" value={f("companyPosition")} onChange={(e) => onChange("companyPosition", e.target.value)} placeholder="e.g., Acme Corp / CFO" />
      </Field>
    </div>
  );
}

// ─── Form renderer dispatcher ─────────────────────────────────────────────────

function renderFormFields(
  formType: string,
  data: Record<string, string>,
  onChange: (k: string, v: string) => void
) {
  switch (formType) {
    case "credit_application": return <CreditApplicationForm data={data} onChange={onChange} />;
    case "bank_authorization": return <BankAuthorizationForm data={data} onChange={onChange} />;
    case "isf_poa": return <ISFPOAForm data={data} onChange={onChange} />;
    case "fppi_authorization": return <FPPIAuthorizationForm data={data} onChange={onChange} />;
    case "insurance_waiver": return <InsuranceWaiverForm data={data} onChange={onChange} />;
    default: return <p className="text-muted-foreground text-sm">Form fields not available.</p>;
  }
}

// ─── Document Uploader ────────────────────────────────────────────────────────

function DocumentUploader({ token, formId }: { token: string; formId: number }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState("");

  const uploadMutation = trpc.customer.uploadDocument.useMutation({
    onSuccess: () => {
      toast.success("Document uploaded successfully!");
      setDescription("");
      setUploading(false);
    },
    onError: (err) => {
      toast.error(err.message ?? "Upload failed.");
      setUploading(false);
    },
  });

  const { data: docs, refetch: refetchDocs } = trpc.customer.getFormDocuments.useQuery({ token, formId });

  const handleFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB.");
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate(
        { token, formId, fileName: file.name, fileBase64: base64, mimeType: file.type, description },
        { onSettled: () => refetchDocs() }
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mt-6 border-t border-border pt-5">
      <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Paperclip className="w-4 h-4 text-primary" /> Supporting Documents (Optional)
      </p>
      {docs && docs.length > 0 && (
        <div className="mb-3 space-y-2">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-2 text-xs bg-muted/40 rounded px-3 py-2">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span className="flex-1 truncate text-foreground">{doc.fileName}</span>
              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View</a>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-2">
        <Input
          placeholder="Document description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="text-sm"
        />
        <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full border-dashed"
        >
          {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : <><Paperclip className="w-4 h-4 mr-2" /> Attach Document</>}
        </Button>
        <p className="text-xs text-muted-foreground">PDF, JPG, PNG, DOC up to 10MB</p>
      </div>
    </div>
  );
}

// ─── Signature Block ──────────────────────────────────────────────────────────

function SignatureBlock({
  signatureName,
  signatureTitle,
  agreed,
  onNameChange,
  onTitleChange,
  onAgreedChange,
}: {
  signatureName: string;
  signatureTitle: string;
  agreed: boolean;
  onNameChange: (v: string) => void;
  onTitleChange: (v: string) => void;
  onAgreedChange: (v: boolean) => void;
}) {
  return (
    <div className="mt-6 border-t border-border pt-5 bg-muted/20 rounded-b-lg p-5 -mx-6 -mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-primary" />
        <p className="text-sm font-semibold text-foreground">Digital Signature</p>
      </div>
      <div className="space-y-3">
        <FieldGroup>
          <Field label="Full Name (as signature)" required>
            <Input value={signatureName} onChange={(e) => onNameChange(e.target.value)} placeholder="Type your full name" />
          </Field>
          <Field label="Title / Position">
            <Input value={signatureTitle} onChange={(e) => onTitleChange(e.target.value)} placeholder="e.g., CFO, Owner" />
          </Field>
        </FieldGroup>
        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors">
          <Checkbox checked={agreed} onCheckedChange={(v) => onAgreedChange(v === true)} className="mt-0.5" />
          <span className="text-sm text-foreground">
            I, <strong>{signatureName || "[Your Name]"}</strong>, confirm that I have read and agree to the terms of this document, and that all information provided is accurate and complete to the best of my knowledge. I understand this constitutes a legal agreement.
          </span>
        </label>
      </div>
    </div>
  );
}

// ─── Main Customer Onboard Component ─────────────────────────────────────────

export default function CustomerOnboard() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") ?? "";

  const [currentFormIdx, setCurrentFormIdx] = useState(0);
  const [fieldData, setFieldData] = useState<Record<number, Record<string, string>>>({});
  const [signatureNames, setSignatureNames] = useState<Record<number, string>>({});
  const [signatureTitles, setSignatureTitles] = useState<Record<number, string>>({});
  const [agreed, setAgreed] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, error, refetch } = trpc.customer.validateToken.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  const saveFormMutation = trpc.customer.saveFormData.useMutation();
  const submitFormMutation = trpc.customer.submitForm.useMutation();

  // Load saved field data from DB when form data arrives
  useEffect(() => {
    if (data?.forms) {
      const saved: Record<number, Record<string, string>> = {};
      for (const form of data.forms) {
        if (form.fieldData && typeof form.fieldData === "object") {
          saved[form.id] = form.fieldData as Record<string, string>;
        }
      }
      setFieldData(saved);
      // Find first incomplete form
      const firstIncomplete = data.forms.findIndex((f) => f.status !== "completed");
      if (firstIncomplete >= 0) setCurrentFormIdx(firstIncomplete);
    }
  }, [data?.forms]);

  const handleFieldChange = useCallback(
    (formId: number, key: string, value: string) => {
      setFieldData((prev) => {
        const updated = { ...prev, [formId]: { ...(prev[formId] ?? {}), [key]: value } };
        // Debounced auto-save
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
          saveFormMutation.mutate({ token, formId, fieldData: updated[formId] ?? {} });
        }, 1500);
        return updated;
      });
    },
    [token, saveFormMutation]
  );

  const handleSubmitForm = async (form: FormAssignment) => {
    const sigName = signatureNames[form.id] ?? "";
    if (!sigName.trim()) {
      toast.error("Please enter your full name as a signature.");
      return;
    }
    if (!agreed[form.id]) {
      toast.error("Please check the agreement box to confirm.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitFormMutation.mutateAsync({
        token,
        formId: form.id,
        fieldData: fieldData[form.id] ?? {},
        signatureName: sigName,
        signatureTitle: signatureTitles[form.id] ?? "",
      });
      toast.success(`${form.formTitle} submitted successfully!`);
      if (result.allComplete) {
        setAllDone(true);
      } else {
        await refetch();
        // Move to next incomplete form
        const forms = data?.forms ?? [];
        const nextIdx = forms.findIndex((f, i) => i > currentFormIdx && f.status !== "completed");
        if (nextIdx >= 0) setCurrentFormIdx(nextIdx);
        else {
          const anyIncomplete = forms.findIndex((f) => f.status !== "completed");
          if (anyIncomplete >= 0) setCurrentFormIdx(anyIncomplete);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Submission failed. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full border border-border text-center p-8">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">Invalid Link</h2>
          <p className="text-muted-foreground text-sm">This link is missing a token. Please use the link provided by your K-APEX representative.</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Loading your onboarding forms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full border border-border text-center p-8">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">Link Error</h2>
          <p className="text-muted-foreground text-sm">{error.message}</p>
          <p className="text-xs text-muted-foreground mt-3">Please contact your K-APEX representative for a new link.</p>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const { session, forms } = data;
  const completedCount = forms.filter((f) => f.status === "completed").length;
  const totalCount = forms.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const currentForm = forms[currentFormIdx];

  if (allDone || completedCount === totalCount) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border bg-card h-14 flex items-center px-6">
          <img src={LOGO_URL} alt="K-APEX" className="h-8 w-auto" />
        </header>
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <Card className="max-w-lg w-full border border-border text-center">
            <CardContent className="pt-10 pb-10 space-y-5">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Onboarding Complete!</h2>
                <p className="text-muted-foreground mt-2">
                  Thank you, <strong>{session.customerName}</strong>. All {totalCount} forms have been submitted successfully.
                </p>
              </div>
              <div className="bg-muted/40 rounded-lg p-4 text-sm text-left space-y-2">
                <p className="font-medium text-foreground">What happens next:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Your K-APEX representative will review your submission</li>
                  <li>• The credit department will process your credit application</li>
                  <li>• You will receive a setup confirmation and credit approval notification</li>
                  <li>• Typical processing time is 2–5 business days</li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground">
                Questions? Contact your K-APEX representative directly.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentForm) return null;

  const formDef = FORM_DEFINITIONS[currentForm.formType as keyof typeof FORM_DEFINITIONS];
  const currentFieldData = fieldData[currentForm.id] ?? {};

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card h-14 flex items-center px-6 justify-between">
        <img src={LOGO_URL} alt="K-APEX" className="h-8 w-auto" />
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Welcome,</p>
          <p className="text-sm font-medium text-foreground">{session.customerName}</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full p-4 lg:p-8 gap-6">
        {/* Left: Form sidebar */}
        <aside className="lg:w-72 shrink-0">
          <Card className="border border-border sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Your Forms</CardTitle>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{completedCount} of {totalCount} complete</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {forms.map((form, idx) => {
                const isActive = idx === currentFormIdx;
                const isComplete = form.status === "completed";
                const def = FORM_DEFINITIONS[form.formType as keyof typeof FORM_DEFINITIONS];
                return (
                  <button
                    key={form.id}
                    onClick={() => setCurrentFormIdx(idx)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors border-b border-border last:border-0 ${
                      isActive ? "bg-accent" : "hover:bg-muted/40"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isComplete ? "bg-green-100 text-green-600" :
                      isActive ? "bg-primary text-primary-foreground" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {isComplete ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                       isActive ? <RefreshCw className="w-3.5 h-3.5" /> :
                       <Clock className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {form.formTitle}
                      </p>
                      {def && (
                        <p className="text-xs text-muted-foreground/70 mt-0.5">~{def.estimatedMinutes} min</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </aside>

        {/* Right: Active form */}
        <main className="flex-1 min-w-0">
          {currentForm.status === "completed" ? (
            <Card className="border border-green-200 bg-green-50">
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-foreground">{currentForm.formTitle}</h3>
                <p className="text-muted-foreground mt-1">This form has been submitted.</p>
                {currentForm.signatureName && (
                  <p className="text-sm text-muted-foreground mt-2">Signed by: <strong>{currentForm.signatureName}</strong></p>
                )}
                {currentForm.submittedAt && (
                  <p className="text-xs text-muted-foreground mt-1">Submitted: {new Date(currentForm.submittedAt).toLocaleString()}</p>
                )}
                <div className="mt-4 flex justify-center gap-3">
                  {currentFormIdx > 0 && (
                    <Button variant="outline" size="sm" onClick={() => setCurrentFormIdx(currentFormIdx - 1)}>
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                  )}
                  {currentFormIdx < forms.length - 1 && (
                    <Button size="sm" className="bg-primary text-primary-foreground" onClick={() => setCurrentFormIdx(currentFormIdx + 1)}>
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-border">
              <CardHeader className="border-b border-border">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-bold text-foreground">{currentForm.formTitle}</CardTitle>
                    {formDef && <p className="text-sm text-muted-foreground mt-1">{formDef.description}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">Routes to</p>
                    <p className="text-xs font-semibold text-primary">{currentForm.routingDepartment}</p>
                    {formDef && <p className="text-xs text-muted-foreground mt-0.5">~{formDef.estimatedMinutes} min</p>}
                  </div>
                </div>
                {saveFormMutation.isPending && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> Auto-saving...
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-6">
                {renderFormFields(
                  currentForm.formType,
                  currentFieldData,
                  (k, v) => handleFieldChange(currentForm.id, k, v)
                )}

                <DocumentUploader token={token} formId={currentForm.id} />

                <SignatureBlock
                  signatureName={signatureNames[currentForm.id] ?? ""}
                  signatureTitle={signatureTitles[currentForm.id] ?? ""}
                  agreed={agreed[currentForm.id] ?? false}
                  onNameChange={(v) => setSignatureNames((p) => ({ ...p, [currentForm.id]: v }))}
                  onTitleChange={(v) => setSignatureTitles((p) => ({ ...p, [currentForm.id]: v }))}
                  onAgreedChange={(v) => setAgreed((p) => ({ ...p, [currentForm.id]: v }))}
                />

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <div className="flex gap-2">
                    {currentFormIdx > 0 && (
                      <Button variant="outline" size="sm" onClick={() => setCurrentFormIdx(currentFormIdx - 1)}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                      </Button>
                    )}
                  </div>
                  <Button
                    className="bg-primary text-primary-foreground hover:opacity-90"
                    onClick={() => handleSubmitForm(currentForm)}
                    disabled={submitting || !agreed[currentForm.id] || !signatureNames[currentForm.id]?.trim()}
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                    ) : (
                      <><Send className="w-4 h-4 mr-2" /> Submit & Continue</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
