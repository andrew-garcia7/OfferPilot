import Register from "./pages/Register";
import Login from "./pages/Login";
import Protocols from "./pages/Protocols";
import { Navigate, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import AuthLayout from "./AuthLayout";
import Landing from "./pages/Landing";
import NewInterview from "./pages/NewInterview";
import InterviewRoom from "./pages/InterviewRoom";
import Coding from "./pages/Coding";
import Resume from "./pages/Resume";
import History from "./pages/History";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import PricingPage from "./pages/PricingPage";
import SuccessStories from "./pages/SuccessStories";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import About from "./pages/About";
import ForgotPassword from "./pages/ForgotPassword";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import OAuthCallback from "./pages/OAuthCallback";
import Onboarding from "./pages/Onboarding";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { SettingsProvider } from "./contexts/SettingsContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null; // wait for session restore
  if (!user)   return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* OAuth callback — no layout */}
      <Route path="/auth/callback" element={<OAuthCallback />} />

      {/* Auth pages — logo-only navbar */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Onboarding — standalone */}
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

      {/* Coding playground — standalone, no marketing Layout */}
      <Route path="/coding" element={<ProtectedRoute><Coding /></ProtectedRoute>} />

      {/* Interview room — standalone meeting mode, no marketing navbar */}
      <Route path="/room/:id" element={<ProtectedRoute><InterviewRoom /></ProtectedRoute>} />

      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failure" element={<PaymentFailure />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/success-stories" element={<SuccessStories />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/about" element={<About />} />
        <Route path="/protocols" element={<Protocols />} />
        <Route path="/new" element={<ProtectedRoute><NewInterview /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/resume-optimizer" element={<Navigate to="/resume" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
