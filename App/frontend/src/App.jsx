// Ref: RF-017, RF-018, B-011, B2-001, B2-005, AND-RF-004, AND-RF-005, AND-RF-006
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ServerAvailabilityProvider } from './context/ServerAvailabilityContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ToastProvider } from './context/ToastContext';
import { SocialUIProvider } from './context/SocialUIContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { NetworkStatusBanner } from './components/NetworkStatusBanner';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { FeedPage } from './pages/FeedPage';
import { ProfilePage } from './pages/ProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { initBackButtonListener } from './utils/backButtonHandler';
import { setupAppLifecycle } from './utils/platform';

const PublicOnlyRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export const AppContent = () => {
  const { user } = useAuth();

  useEffect(() => {
    initBackButtonListener();
    const cleanupLifecycle = setupAppLifecycle({
      onResume: () => {
        console.info('[AppLifecycle] Resumed into foreground');
      },
      onPause: () => {
        console.info('[AppLifecycle] Paused into background');
      }
    });
    return () => cleanupLifecycle();
  }, []);

  return (
    <>
      <NetworkStatusBanner />
      <Navbar />
      <main className={`main-container ${user ? 'has-mobile-nav' : ''}`}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <FeedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <MobileBottomNav />
    </>
  );
};

export default function App() {
  return (
    <Router>
      <ServerAvailabilityProvider>
        <AuthProvider>
          <WebSocketProvider>
            <ToastProvider>
              <SocialUIProvider>
                <AppContent />
              </SocialUIProvider>
            </ToastProvider>
          </WebSocketProvider>
        </AuthProvider>
      </ServerAvailabilityProvider>
    </Router>
  );
}
