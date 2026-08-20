import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/ThemeContext";
import { LangProvider } from "@/lib/LangContext";
import { PortfolioProvider } from "@/lib/PortfolioContext";
import { PORTFOLIO_CONFIG } from "@/lib/config";
import Portfolio from "@/pages/Portfolio";
import NotFound from "@/pages/not-found";

const Admin = lazy(() => import("@/pages/Admin"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Portfolio} />
      <Route path={PORTFOLIO_CONFIG.adminPath} component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LangProvider>
          <PortfolioProvider>
            <TooltipProvider>
              <Toaster />
              <Suspense fallback={<div className="min-h-screen bg-background text-foreground flex items-center justify-center text-sm">Loading...</div>}>
                <Router />
              </Suspense>
            </TooltipProvider>
          </PortfolioProvider>
        </LangProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
