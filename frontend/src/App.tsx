import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import PetProfileCreation from './pages/PetProfileCreation';
import BookingPage from './pages/BookingPage';
import PetSitterRegistration from './pages/PetSitterRegistration';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Create a client for React Query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route
                  path="/pet-profile"
                  element={
                    <ProtectedRoute>
                      <PetProfileCreation />
                    </ProtectedRoute>
                  }
                />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/become-a-sitter" element={<PetSitterRegistration />} />
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
  );
}

export default App;
