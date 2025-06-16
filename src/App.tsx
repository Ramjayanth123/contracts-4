import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/components/access/AuthProvider";
import { ProtectedRoute } from "@/components/access/ProtectedRoute";
import { AccessControlProvider } from "@/components/access/RoleBasedAccess";
import { Toaster as UIToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import Layout from "@/components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Contracts from "./pages/Contracts";
import ContractDetail from "./pages/ContractDetail";
import ContractCreation from "./pages/ContractCreation";
import DocumentReview from "./pages/DocumentReview";
import Settings from "./pages/Settings";
import Administration from "./pages/Administration";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Workflows from "./pages/Workflows";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OpenAITest from "./pages/OpenAITest";
import Index from "./pages/Index";
import WorkflowDashboard from "@/components/workflow/WorkflowDashboard";
import LegalReviewDashboard from "@/components/workflow/LegalReviewDashboard";
import ViewerSignatureDashboard from "@/components/workflow/ViewerSignatureDashboard";
import SessionRestorer from "@/components/SessionRestorer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <SonnerToaster />
        <BrowserRouter>
          <AuthProvider>
            <SessionRestorer />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/openai-test" element={<OpenAITest />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <AccessControlProvider>
                    <Layout />
                  </AccessControlProvider>
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="contracts" element={<Contracts />} />
                <Route path="contracts/:id" element={<ContractDetail />} />
                <Route path="contracts/create" element={<ContractCreation />} />
                <Route path="documents" element={<DocumentReview />} />
                <Route path="workflows" element={<Workflows />} />
                <Route path="workflow/dashboard" element={<WorkflowDashboard />} />
                <Route path="workflow/legal-review" element={<LegalReviewDashboard />} />
                <Route path="workflow/signature" element={<ViewerSignatureDashboard />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="reports" element={<Reports />} />
                <Route path="administration" element={<Administration />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
        <UIToaster />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
