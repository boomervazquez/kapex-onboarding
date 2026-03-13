import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  Send,
  AlertCircle,
  Building2,
  Mail,
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663422523197/hseGhsrVbVzK9EhSTDG2Rt/kapex-logo_1a013539.png";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <Clock className="w-3.5 h-3.5" /> },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-800 border-blue-200", icon: <RefreshCw className="w-3.5 h-3.5" /> },
  completed: { label: "Completed", color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-600 border-gray-200", icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

const TYPE_LABELS: Record<string, string> = {
  importer: "Importer",
  exporter: "Exporter",
  both: "Importer & Exporter",
  custom: "Custom",
};

export default function SessionDetail() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const sessionId = parseInt(params.id ?? "0");
  const [regenerating, setRegenerating] = useState(false);
  const [newLink, setNewLink] = useState<string | null>(null);

  const { data, isLoading, refetch } = trpc.salesperson.getSession.useQuery(
    { sessionId },
    { enabled: isAuthenticated && !isNaN(sessionId) }
  );

  const regenerateMutation = trpc.salesperson.regenerateMagicLink.useMutation({
    onSuccess: (result) => {
      setNewLink(result.magicLinkUrl);
      setRegenerating(false);
      toast.success("New magic link generated!");
    },
    onError: () => {
      setRegenerating(false);
      toast.error("Failed to regenerate link.");
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Session not found.</p>
      </div>
    );
  }

  const { session, forms, magicLink, documents } = data;
  const completedForms = forms.filter((f) => f.status === "completed").length;
  const progressPct = forms.length > 0 ? Math.round((completedForms / forms.length) * 100) : 0;
  const statusCfg = STATUS_CONFIG[session.status] ?? STATUS_CONFIG.pending;

  const currentMagicLinkUrl = newLink ?? (magicLink ? `${window.location.origin}/onboard?token=${magicLink.token}` : null);

  const copyLink = () => {
    if (currentMagicLinkUrl) {
      navigator.clipboard.writeText(currentMagicLinkUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card h-14 flex items-center px-6 gap-4">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>
        <div className="h-5 w-px bg-border" />
        <img src={LOGO_URL} alt="K-APEX" className="h-7 w-auto" />
        <span className="text-sm font-medium text-foreground">Session #{session.id}</span>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>
      </header>

      <div className="flex-1 p-6 lg:p-8 max-w-5xl mx-auto w-full">
        {/* Header info */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{session.customerName}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{session.customerEmail}</span>
              {session.customerCompany && (
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{session.customerCompany}</span>
              )}
              <span className="text-muted-foreground/60">|</span>
              <span>{TYPE_LABELS[session.customerType] ?? session.customerType}</span>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full border ${statusCfg.color}`}>
            {statusCfg.icon} {statusCfg.label}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Forms */}
          <div className="lg:col-span-2 space-y-4">
            {/* Progress */}
            <Card className="border border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-foreground">Overall Progress</span>
                  <span className="text-sm font-bold text-primary">{completedForms}/{forms.length} forms</span>
                </div>
                <div className="bg-muted rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{progressPct}% complete</p>
              </CardContent>
            </Card>

            {/* Forms list */}
            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Assigned Forms
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {forms.map((form, idx) => {
                  const formStatus = STATUS_CONFIG[form.status] ?? STATUS_CONFIG.pending;
                  return (
                    <div key={form.id} className={`px-5 py-4 flex items-start gap-4 ${idx < forms.length - 1 ? "border-b border-border" : ""}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        form.status === "completed" ? "bg-green-100 text-green-600" :
                        form.status === "in_progress" ? "bg-blue-100 text-blue-600" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {form.status === "completed" ? <CheckCircle2 className="w-4 h-4" /> :
                         form.status === "in_progress" ? <RefreshCw className="w-4 h-4" /> :
                         <Clock className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm text-foreground">{form.formTitle}</p>
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${formStatus.color}`}>
                            {formStatus.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Send className="w-3 h-3" />
                            Routes to: <strong className="text-foreground">{form.routingDepartment}</strong>
                          </span>
                          {form.submittedAt && (
                            <span>Submitted: {new Date(form.submittedAt).toLocaleDateString()}</span>
                          )}
                          {form.signatureName && (
                            <span>Signed by: {form.signatureName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Documents */}
            {documents.length > 0 && (
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Uploaded Documents ({documents.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {documents.map((doc, idx) => (
                    <div key={doc.id} className={`px-5 py-3 flex items-center gap-3 ${idx < documents.length - 1 ? "border-b border-border" : ""}`}>
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{doc.fileName}</p>
                        {doc.description && <p className="text-xs text-muted-foreground">{doc.description}</p>}
                        <p className="text-xs text-muted-foreground">{new Date(doc.createdAt).toLocaleDateString()}</p>
                      </div>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm"><ExternalLink className="w-4 h-4" /></Button>
                      </a>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Info & Link */}
          <div className="space-y-4">
            {/* Session info */}
            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Session Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{new Date(session.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Package</span>
                  <span className="font-medium">{TYPE_LABELS[session.customerType]}</span>
                </div>
                {session.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium text-green-600">{new Date(session.completedAt).toLocaleDateString()}</span>
                  </div>
                )}
                {session.notes && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-muted-foreground text-xs mb-1">Notes</p>
                    <p className="text-foreground text-xs">{session.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Magic Link */}
            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Customer Magic Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentMagicLinkUrl ? (
                  <>
                    <div className="bg-muted/40 rounded p-3">
                      <code className="text-xs break-all text-foreground">{currentMagicLinkUrl}</code>
                    </div>
                    {magicLink && (
                      <p className="text-xs text-muted-foreground">
                        Expires: {new Date(magicLink.expiresAt).toLocaleDateString()} · Accessed {magicLink.accessCount}×
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={copyLink}>
                        <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={regenerating}
                        onClick={() => {
                          setRegenerating(true);
                          regenerateMutation.mutate({ sessionId, origin: window.location.origin });
                        }}
                      >
                        {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1" />}
                        Regenerate
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No magic link found.</p>
                )}
              </CardContent>
            </Card>

            {/* Routing info */}
            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Form Routing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {forms.map((form) => (
                  <div key={form.id} className="flex items-start gap-2 text-xs">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${form.status === "completed" ? "bg-green-500" : "bg-muted-foreground/40"}`} />
                    <div>
                      <p className="font-medium text-foreground">{form.formTitle}</p>
                      <p className="text-muted-foreground">→ {form.routingDepartment}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
