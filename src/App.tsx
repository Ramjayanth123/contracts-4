
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/components/access/AuthProvider";
import { AccessControlProvider } from "@/components/access/RoleBasedAccess";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Contracts from "./pages/Contracts";
import ContractDetail from "./pages/ContractDetail";

import ContractCreation from "./pages/ContractCreation";
import DocumentReview from "./pages/DocumentReview";
import NotFound from "./pages/NotFound";
import Workflows from "./pages/Workflows";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Administration from "./pages/Administration";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
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
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
