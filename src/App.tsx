
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CompanyActivation from "./pages/CompanyActivation";
import EmployerAdminDashboard from "./components/EmployerAdminDashboard";
import ResetPassword from "./components/ResetPassword";
import EmailVerification from "./components/EmailVerification";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/company-setup" element={<CompanyActivation />} />
            <Route path="/company-dashboard" element={<EmployerAdminDashboard />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route 
              path="/verify-email" 
              element={
                <EmailVerification 
                  onBack={() => window.location.href = '/'} 
                  onVerificationSuccess={() => window.location.href = '/company-setup'}
                  email={new URLSearchParams(window.location.search).get('email') || undefined}
                />
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
