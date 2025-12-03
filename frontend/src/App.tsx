import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Create a client for React Query
const queryClient = new QueryClient();

// Replace with your actual Google Client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
              <Navbar />
              <main className="flex-1">
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
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
