import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

// Auth Context
import { AuthProvider } from "@/contexts/AuthContext";

// Route Guards
import { ProtectedRoute, PublicRoute, RoleRoute } from "@/components/ProtectedRoute";

// Pages
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            } />
            <Route path="/forgot-password" element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            } />
            <Route path="/reset-password" element={
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            } />
            <Route path="/verify-email" element={
              <PublicRoute>
                <EmailVerificationPage />
              </PublicRoute>
            } />
            <Route path="/pricing" element={<PricingCheckout />} />
            <Route path="/docs" element={<DocsHelpCenter />} />
            <Route path="/privacy" element={<PrivacyTerms />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
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
              <Route path="admin" element={
                <RoleRoute requiredRole="admin">
                  <AdminDashboard />
                </RoleRoute>
              } />
            </Route>
            
            {/* Client Portal - Public but may need project access validation */}
            <Route path="/portal/:projectId" element={<ClientPortal />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster 
          position="top-right"
          expand={true}
          richColors={true}
          closeButton={true}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
