import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import NewOnboarding from "./pages/NewOnboarding";
import SessionDetail from "./pages/SessionDetail";
import CustomerOnboard from "./pages/CustomerOnboard";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      {/* Public landing / login */}
      <Route path="/" component={Home} />
      {/* Salesperson portal */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/onboarding/new" component={NewOnboarding} />
      <Route path="/onboarding/:id" component={SessionDetail} />
      {/* Customer magic-link portal */}
      <Route path="/onboard" component={CustomerOnboard} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
