import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

// Pages
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import EmailVerificationPage from "@/pages/EmailVerificationPage";
import DashboardLayout from "@/pages/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import IntakeChat from "@/pages/IntakeChat";
import ProposalEditor from "@/pages/ProposalEditor";
import ProjectProvisioning from "@/pages/ProjectProvisioning";
import ProjectBoard from "@/pages/ProjectBoard";
import CommsMeetingSummaries from "@/pages/CommsMeetingSummaries";
import ResearchCopilot from "@/pages/ResearchCopilot";
import LaunchRelease from "@/pages/LaunchRelease";
import ClientPortal from "@/pages/ClientPortal";
import HandoverKnowledgeBase from "@/pages/HandoverKnowledgeBase";
import SupportSLATriage from "@/pages/SupportSLATriage";
import SettingsPreferences from "@/pages/SettingsPreferences";
import AdminDashboard from "@/pages/AdminDashboard";
import DocsHelpCenter from "@/pages/DocsHelpCenter";
import PricingCheckout from "@/pages/PricingCheckout";
import PrivacyTerms from "@/pages/PrivacyTerms";
import NotFound from "@/pages/NotFound";

// React Query client with optimal defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/pricing" element={<PricingCheckout />} />
            <Route path="/docs" element={<DocsHelpCenter />} />
            <Route path="/privacy" element={<PrivacyTerms />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="intake" element={<IntakeChat />} />
              <Route path="proposals" element={<ProposalEditor />} />
              <Route path="provisioning" element={<ProjectProvisioning />} />
              <Route path="projects/:id" element={<ProjectBoard />} />
              <Route path="comms" element={<CommsMeetingSummaries />} />
              <Route path="research" element={<ResearchCopilot />} />
              <Route path="launch" element={<LaunchRelease />} />
              <Route path="handover" element={<HandoverKnowledgeBase />} />
              <Route path="support" element={<SupportSLATriage />} />
              <Route path="settings" element={<SettingsPreferences />} />
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
            
            {/* Client Portal */}
            <Route path="/portal/:projectId" element={<ClientPortal />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
