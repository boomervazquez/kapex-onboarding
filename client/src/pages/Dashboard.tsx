import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  User,
  AlertCircle,
} from "lucide-react";
import { useLocation } from "wouter";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663422523197/hseGhsrVbVzK9EhSTDG2Rt/kapex-logo_1a013539.png";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <Clock className="w-3 h-3" /> },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-800 border-blue-200", icon: <RefreshCw className="w-3 h-3" /> },
  completed: { label: "Completed", color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-600 border-gray-200", icon: <AlertCircle className="w-3 h-3" /> },
};

const TYPE_LABELS: Record<string, string> = {
  importer: "Importer",
  exporter: "Exporter",
  both: "Importer & Exporter",
  custom: "Custom",
};

export default function Dashboard() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  const { data: sessions, isLoading, refetch } = trpc.salesperson.listSessions.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <img src={LOGO_URL} alt="K-APEX" className="h-12 w-auto mb-2" />
        <p className="text-muted-foreground">Please log in to access the salesperson portal.</p>
        <Button onClick={() => (window.location.href = getLoginUrl())} className="bg-primary text-primary-foreground">
          Log In
        </Button>
      </div>
    );
  }

  const stats = {
    total: sessions?.length ?? 0,
    pending: sessions?.filter((s) => s.status === "pending").length ?? 0,
    inProgress: sessions?.filter((s) => s.status === "in_progress").length ?? 0,
    completed: sessions?.filter((s) => s.status === "completed").length ?? 0,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sidebar + Main layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0 min-h-screen">
          <div className="p-5 border-b border-sidebar-border">
            <img src={LOGO_URL} alt="K-APEX" className="h-9 w-auto brightness-0 invert" />
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 px-3 mb-2">
              Onboarding
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md bg-sidebar-accent text-sidebar-accent-foreground text-sm font-medium"
            >
              <FileText className="w-4 h-4" /> All Sessions
            </button>
            <button
              onClick={() => navigate("/onboarding/new")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground text-sm"
            >
              <Plus className="w-4 h-4" /> New Onboarding
            </button>
          </nav>
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                {user?.name?.[0]?.toUpperCase() ?? <User className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name ?? "Salesperson"}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email ?? ""}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground px-1 py-1"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Onboarding Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage and track your customer onboarding sessions.</p>
            </div>
            <Button
              onClick={() => navigate("/onboarding/new")}
              className="bg-primary text-primary-foreground hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" /> New Onboarding
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Sessions", value: stats.total, icon: <FileText className="w-5 h-5 text-primary" /> },
              { label: "Pending", value: stats.pending, icon: <Clock className="w-5 h-5 text-yellow-500" /> },
              { label: "In Progress", value: stats.inProgress, icon: <RefreshCw className="w-5 h-5 text-blue-500" /> },
              { label: "Completed", value: stats.completed, icon: <CheckCircle2 className="w-5 h-5 text-green-500" /> },
            ].map((stat) => (
              <Card key={stat.label} className="border border-border">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    {stat.icon}
                  </div>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sessions table */}
          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-semibold">All Onboarding Sessions</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : !sessions || sessions.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">No onboarding sessions yet</p>
                  <p className="text-sm text-muted-foreground/70 mt-1 mb-4">
                    Create your first session to get started.
                  </p>
                  <Button
                    onClick={() => navigate("/onboarding/new")}
                    className="bg-primary text-primary-foreground"
                  >
                    <Plus className="w-4 h-4 mr-2" /> New Onboarding
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="text-left px-6 py-3 text-muted-foreground font-medium">Customer</th>
                        <th className="text-left px-6 py-3 text-muted-foreground font-medium">Type</th>
                        <th className="text-left px-6 py-3 text-muted-foreground font-medium">Progress</th>
                        <th className="text-left px-6 py-3 text-muted-foreground font-medium">Status</th>
                        <th className="text-left px-6 py-3 text-muted-foreground font-medium">Created</th>
                        <th className="px-6 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((session) => {
                        const statusCfg = STATUS_CONFIG[session.status] ?? STATUS_CONFIG.pending;
                        return (
                          <tr
                            key={session.id}
                            className="border-b border-border hover:bg-muted/20 cursor-pointer transition-colors"
                            onClick={() => navigate(`/onboarding/${session.id}`)}
                          >
                            <td className="px-6 py-4">
                              <p className="font-medium text-foreground">{session.customerName}</p>
                              <p className="text-xs text-muted-foreground">{session.customerEmail}</p>
                              {session.customerCompany && (
                                <p className="text-xs text-muted-foreground">{session.customerCompany}</p>
                              )}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {TYPE_LABELS[session.customerType] ?? session.customerType}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-muted rounded-full h-1.5 w-24">
                                  <div
                                    className="bg-primary h-1.5 rounded-full transition-all"
                                    style={{
                                      width: session.totalForms > 0
                                        ? `${(session.completedForms / session.totalForms) * 100}%`
                                        : "0%",
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {session.completedForms}/{session.totalForms}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
                                {statusCfg.icon}
                                {statusCfg.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground text-xs">
                              {new Date(session.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/onboarding/${session.id}`);
                                }}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
