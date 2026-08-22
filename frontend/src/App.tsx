import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import PetProfileCreation from './pages/PetProfileCreation';
import BookingPage from './pages/BookingPage';
import PetSitterRegistration from './pages/PetSitterRegistration';
import BecomeSitterLandingPage from './pages/BecomeSitterLandingPage';
import SitterDashboard from './pages/SitterDashboard';
import SitterProfileView from './pages/SitterProfileView';
import ContactSitterPage from './pages/ContactSitterPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import SearchResultsPage from './pages/SearchResultsPage';
import MessagesPage from './pages/MessagesPage';
import SitterMessagesPage from './pages/SitterMessagesPage';


import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ToastProvider from './components/ui/Toast';
import GoogleOneTap from './components/auth/GoogleOneTap';

// Create a client for React Query
const queryClient = new QueryClient();

// Google Client ID (NOT a secret). Prefer setting `VITE_GOOGLE_CLIENT_ID` in your environment.
// Fallback is kept for local dev convenience.
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '148696767812-0m22i59jnp90ejdr9gp6itg52svthbqg.apps.googleusercontent.com';
console.log("App: Initializing with Google Client ID:", GOOGLE_CLIENT_ID?.substring(0, 10) + "...");

// React Router does not reset scroll position on navigation the way a traditional
// multi-page site does, so landing on a new route (e.g. search results, a sitter
// profile) can render mid-scroll if the previous page was scrolled down. Reset to
// the top whenever the pathname changes; query-string-only updates (e.g. changing
// search filters while staying on /search) intentionally don't trigger this.
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GoogleOneTap />
          <ToastProvider>
            <Router>
              <ScrollToTop />
              <div className="min-h-screen flex flex-col bg-background text-foreground font-sans overflow-x-hidden">
                <Navbar />
                <main className="flex-1 w-full overflow-x-hidden">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/messages"
                      element={
                        <ProtectedRoute>
                          <MessagesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/pet-profile"
                      element={
                        <ProtectedRoute>
                          <PetProfileCreation />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="/booking" element={<BookingPage />} />
                    <Route path="/search" element={<SearchResultsPage />} />
                    <Route path="/sitter/:id" element={<SitterProfileView />} />
                    <Route path="/contact-sitter/:id" element={<ContactSitterPage />} />
                    <Route path="/become-a-sitter" element={<BecomeSitterLandingPage />} />
                    <Route path="/become-a-sitter/register" element={<PetSitterRegistration />} />
                    <Route
                      path="/sitter-dashboard"
                      element={
                        <ProtectedRoute>
                          <SitterDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/sitter-messages"
                      element={
                        <ProtectedRoute>
                          <SitterMessagesPage />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </Router>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
