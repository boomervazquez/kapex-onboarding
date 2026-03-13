import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { ArrowRight, CheckCircle, FileText, Users, Zap } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663422523197/hseGhsrVbVzK9EhSTDG2Rt/kapex-logo_1a013539.png";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [loading, isAuthenticated, navigate]);

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Salesperson-Initiated",
      desc: "Create onboarding sessions in seconds, choose the right form package, and send a secure link directly to your customer.",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Smart Form Packages",
      desc: "Pre-built packages for Importers, Exporters, or both. Or build a custom selection — only the forms each customer actually needs.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Passwordless for Customers",
      desc: "Customers access their forms via a secure magic link — no account creation, no password. They can save progress and return anytime.",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Real-Time Progress Tracking",
      desc: "See exactly which forms are complete, in progress, or pending. Get notified the moment a customer finishes their onboarding.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <img src={LOGO_URL} alt="K-APEX" className="h-10 w-auto" />
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-primary text-primary-foreground hover:opacity-90"
          >
            Staff Login <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-accent/30 to-background">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground text-sm font-medium px-3 py-1 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" />
            Customer Onboarding Portal
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-6">
            Onboard Freight Clients<br />
            <span className="text-primary">Without the Paper Chase</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Replace PDFs, faxes, and email chains with a streamlined digital portal. 
            Salespersons initiate. Customers complete. Everyone stays informed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-primary text-primary-foreground hover:opacity-90 text-base px-8"
            >
              Staff Login <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-card border-t border-border">
        <div className="container">
          <h2 className="text-2xl font-bold text-center text-foreground mb-10">
            Everything you need to streamline onboarding
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-background rounded-lg border border-border p-6">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-primary mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 bg-card">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>© 2026 KLN Freight (USA) Inc. — K-APEX. All rights reserved.</span>
          <span>A member of Kerry Logistics Network</span>
        </div>
      </footer>
    </div>
  );
}
