import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { FORM_DEFINITIONS, FORM_PACKAGES, FormTypeId } from "@shared/forms";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  FileText,
  Loader2,
  Package,
  Send,
  User,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663422523197/hseGhsrVbVzK9EhSTDG2Rt/kapex-logo_1a013539.png";

type CustomerType = "importer" | "exporter" | "both" | "custom";

const PACKAGE_OPTIONS: { type: CustomerType; label: string; description: string; badge?: string }[] = [
  {
    type: "importer",
    label: "Importer Package",
    description: "Credit App, Bank Auth, ISF POA, Insurance Declaration",
    badge: "Most Common",
  },
  {
    type: "exporter",
    label: "Exporter Package",
    description: "Credit App, Bank Auth, FPPI Authorization, Insurance Declaration",
  },
  {
    type: "both",
    label: "Importer & Exporter",
    description: "All of the above — full package for dual-role customers",
  },
  {
    type: "custom",
    label: "Custom Selection",
    description: "Manually choose which forms to include",
  },
];

export default function NewOnboarding() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  const [step, setStep] = useState<"customer" | "package" | "confirm" | "done">("customer");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [customerType, setCustomerType] = useState<CustomerType>("importer");
  const [customForms, setCustomForms] = useState<FormTypeId[]>([]);
  const [result, setResult] = useState<{ sessionId: number; magicLinkUrl: string } | null>(null);

  const createSession = trpc.salesperson.createSession.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setStep("done");
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to create onboarding session.");
    },
  });

  const selectedForms = customerType === "custom"
    ? customForms
    : FORM_PACKAGES[customerType]?.forms ?? [];

  const toggleCustomForm = (formId: FormTypeId) => {
    setCustomForms((prev) =>
      prev.includes(formId) ? prev.filter((f) => f !== formId) : [...prev, formId]
    );
  };

  const handleSubmit = () => {
    createSession.mutate({
      customerName,
      customerEmail,
      customerCompany: customerCompany || undefined,
      customerType,
      customForms: customerType === "custom" ? customForms : undefined,
      notes: notes || undefined,
      origin: window.location.origin,
    });
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card h-14 flex items-center px-6 gap-4">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="h-5 w-px bg-border" />
        <img src={LOGO_URL} alt="K-APEX" className="h-7 w-auto" />
        <span className="text-sm font-medium text-foreground">New Onboarding Session</span>
      </header>

      <div className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-2xl">
          {/* Progress steps */}
          {step !== "done" && (
            <div className="flex items-center gap-2 mb-8">
              {(["customer", "package", "confirm"] as const).map((s, i) => {
                const labels = ["Customer Info", "Form Package", "Confirm & Send"];
                const steps = ["customer", "package", "confirm"];
                const currentIdx = steps.indexOf(step);
                const isComplete = i < currentIdx;
                const isActive = s === step;
                return (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                      isComplete ? "bg-primary text-primary-foreground" :
                      isActive ? "border-2 border-primary text-primary" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {isComplete ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-sm ${isActive ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                      {labels[i]}
                    </span>
                    {i < 2 && <div className="flex-1 h-px bg-border" />}
                  </div>
                );
              })}
            </div>
          )}

          {/* Step 1: Customer Info */}
          {step === "customer" && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-primary" /> Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Customer Name <span className="text-destructive">*</span></Label>
                    <Input id="name" placeholder="Jane Smith" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Customer Email <span className="text-destructive">*</span></Label>
                    <Input id="email" type="email" placeholder="jane@company.com" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" placeholder="Acme Imports LLC" value={customerCompany} onChange={(e) => setCustomerCompany(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Internal Notes</Label>
                  <Textarea id="notes" placeholder="Any notes for internal reference..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                </div>
                <Button
                  className="w-full bg-primary text-primary-foreground hover:opacity-90"
                  onClick={() => setStep("package")}
                  disabled={!customerName.trim() || !customerEmail.trim() || !/\S+@\S+\.\S+/.test(customerEmail)}
                >
                  Continue to Form Package
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Package Selection */}
          {step === "package" && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="w-5 h-5 text-primary" /> Select Form Package
                </CardTitle>
                <p className="text-sm text-muted-foreground">Choose the package that matches {customerName}'s business type.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PACKAGE_OPTIONS.map((pkg) => (
                    <button
                      key={pkg.type}
                      onClick={() => setCustomerType(pkg.type)}
                      className={`text-left p-4 rounded-lg border-2 transition-all ${
                        customerType === pkg.type
                          ? "border-primary bg-accent"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-semibold text-sm text-foreground">{pkg.label}</span>
                        {pkg.badge && (
                          <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            {pkg.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{pkg.description}</p>
                    </button>
                  ))}
                </div>

                {/* Custom form selector */}
                {customerType === "custom" && (
                  <div className="mt-4 p-4 bg-muted/40 rounded-lg border border-border">
                    <p className="text-sm font-medium text-foreground mb-3">Select individual forms:</p>
                    <div className="space-y-2">
                      {(Object.keys(FORM_DEFINITIONS) as FormTypeId[]).map((formId) => {
                        const def = FORM_DEFINITIONS[formId];
                        return (
                          <label key={formId} className="flex items-start gap-3 cursor-pointer">
                            <Checkbox
                              checked={customForms.includes(formId)}
                              onCheckedChange={() => toggleCustomForm(formId)}
                              className="mt-0.5"
                            />
                            <div>
                              <p className="text-sm font-medium text-foreground">{def.title}</p>
                              <p className="text-xs text-muted-foreground">{def.description}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Selected forms preview */}
                {selectedForms.length > 0 && (
                  <div className="mt-2 p-3 bg-accent/50 rounded-lg">
                    <p className="text-xs font-semibold text-foreground mb-2">Forms included ({selectedForms.length}):</p>
                    <ul className="space-y-1">
                      {selectedForms.map((fId: FormTypeId) => (
                        <li key={fId} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <FileText className="w-3 h-3 text-primary shrink-0" />
                          {FORM_DEFINITIONS[fId as FormTypeId]?.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep("customer")} className="flex-1">
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-primary text-primary-foreground hover:opacity-90"
                    onClick={() => setStep("confirm")}
                    disabled={customerType === "custom" && customForms.length === 0}
                  >
                    Review & Confirm
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Confirm */}
          {step === "confirm" && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Send className="w-5 h-5 text-primary" /> Review & Send
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="bg-muted/40 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer</span>
                    <span className="font-medium text-foreground">{customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium text-foreground">{customerEmail}</span>
                  </div>
                  {customerCompany && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Company</span>
                      <span className="font-medium text-foreground">{customerCompany}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Package</span>
                    <span className="font-medium text-foreground">{PACKAGE_OPTIONS.find((p) => p.type === customerType)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Forms</span>
                    <span className="font-medium text-foreground">{selectedForms.length} forms</span>
                  </div>
                </div>

                <div className="bg-accent/40 border border-primary/20 rounded-lg p-4 text-sm">
                  <p className="font-medium text-foreground mb-1">What happens next:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• A secure magic link will be generated for {customerName}</li>
                    <li>• The link will be valid for 30 days</li>
                    <li>• You'll see the link to share with your customer</li>
                    <li>• You'll be notified when all forms are completed</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("package")} className="flex-1">
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-primary text-primary-foreground hover:opacity-90"
                    onClick={handleSubmit}
                    disabled={createSession.isPending}
                  >
                    {createSession.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                    ) : (
                      <><Send className="w-4 h-4 mr-2" /> Create & Get Link</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Done */}
          {step === "done" && result && (
            <Card className="border border-border">
              <CardContent className="pt-8 pb-8 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Onboarding Session Created!</h2>
                  <p className="text-muted-foreground mt-1">
                    Share the link below with <strong>{customerName}</strong> so they can complete their forms.
                  </p>
                </div>
                <div className="bg-muted/40 rounded-lg p-4 text-left">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Customer Magic Link</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-background border border-border rounded px-3 py-2 break-all text-foreground">
                      {result.magicLinkUrl}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(result.magicLinkUrl);
                        toast.success("Link copied to clipboard!");
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  This link is valid for 30 days. The customer can save their progress and return at any time.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => navigate(`/onboarding/${result.sessionId}`)}>
                    View Session
                  </Button>
                  <Button
                    className="bg-primary text-primary-foreground hover:opacity-90"
                    onClick={() => navigate("/dashboard")}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
