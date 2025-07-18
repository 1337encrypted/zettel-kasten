
import React from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Home from "./pages/Home";
import UserPublicProfile from "./pages/UserPublicProfile";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./context/AuthContext";
import AuthPage from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import ConfirmEmailPage from "./pages/ConfirmEmail";
import ResetPasswordPage from "./pages/ResetPassword";
import AdminPage from "./pages/Admin";
import AdminRoute from "./components/AdminRoute";
import DocsPage from "./pages/Docs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" storageKey="zettelkasten-ui-theme" enableSystem>
      <TooltipProvider>
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/u/:userId/*" element={<UserPublicProfile />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/confirm-email" element={<ConfirmEmailPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard/*" element={<Index />} />
              </Route>
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
