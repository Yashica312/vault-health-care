import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AppProvider, useApp } from "./contexts/AppContext";
import AppShell from "./components/AppShell";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Records from "./pages/Records";
import RecordDetail from "./pages/RecordDetail";
import Prescriptions from "./pages/Prescriptions";
import Doctors from "./pages/Doctors";
import DoctorProfile from "./pages/DoctorProfile";
import Upload from "./pages/Upload";
import Emergency from "./pages/Emergency";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedLayout = () => {
  const { auth } = useApp();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading auth session…
      </div>
    );
  }

  if (!auth.isAuthenticated) return <Navigate to="/login" replace />;
  return <AppShell><Outlet /></AppShell>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/app" element={<Dashboard />} />
              <Route path="/app/records" element={<Records />} />
              <Route path="/app/records/:id" element={<RecordDetail />} />
              <Route path="/app/prescriptions" element={<Prescriptions />} />
              <Route path="/app/doctors" element={<Doctors />} />
              <Route path="/app/doctors/:id" element={<DoctorProfile />} />
              <Route path="/app/upload" element={<Upload />} />
              <Route path="/app/emergency" element={<Emergency />} />
              <Route path="/app/profile" element={<Profile />} />
              <Route path="/app/notifications" element={<Notifications />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
