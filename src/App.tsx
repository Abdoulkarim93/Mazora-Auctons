import React, { Component, Suspense, lazy, ErrorInfo, ReactNode } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context';
import { Layout } from './components/Layout';
import { LoadingSpinner } from './components/Loading';
import { ScrollToTop } from './components/ScrollToTop';

interface ErrorBoundaryProps {
  // children must be explicitly included in props type for React 18 class components
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// --- Error Boundary for Crash Prevention ---
// Fix: Use explicitly referenced React.Component base class with correct generic parameters to ensure props and state are correctly inherited and recognized by the compiler
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Explicit initialization of state as member of class extension
  state: ErrorBoundaryState = { hasError: false };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    // Fix: Accessing state inherited from Component base class via 'this'
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong.</h1>
            <p className="text-gray-500 mb-4">We've tracked the issue. Please refresh to continue.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-800"
            >
              Refresh App
            </button>
          </div>
        </div>
      );
    }

    // Fix: Using any cast to bypass "Property 'props' does not exist on type 'ErrorBoundary'" error
    return (this as any).props.children;
  }
}

// --- CODE SPLITTING: Lazy Load Pages ---
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const SellItem = lazy(() => import('./pages/SellItem').then(module => ({ default: module.SellItem })));
const AuctionDetail = lazy(() => import('./pages/AuctionDetail').then(module => ({ default: module.AuctionDetail })));
const Categories = lazy(() => import('./pages/Categories').then(module => ({ default: module.Categories })));
const BuyerRequests = lazy(() => import('./pages/BuyerRequests').then(module => ({ default: module.BuyerRequests })));
const CreateRequest = lazy(() => import('./pages/CreateRequest').then(module => ({ default: module.CreateRequest })));
const MyRequests = lazy(() => import('./pages/MyRequests').then(module => ({ default: module.MyRequests })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const Register = lazy(() => import('./pages/Register').then(module => ({ default: module.Register })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const AdminLogin = lazy(() => import('./pages/AdminLogin').then(module => ({ default: module.AdminLogin })));
const AdminPanel = lazy(() => import('./pages/AdminPanel').then(module => ({ default: module.AdminPanel })));
const NotFound = lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })));

// Legal pages grouped
const HelpCenter = lazy(() => import('./pages/Legal').then(module => ({ default: module.HelpCenter })));
const EscrowPolicy = lazy(() => import('./pages/Legal').then(module => ({ default: module.EscrowPolicy })));
const AuctionRules = lazy(() => import('./pages/Legal').then(module => ({ default: module.AuctionRules })));
const EthicsPolicy = lazy(() => import('./pages/Legal').then(module => ({ default: module.EthicsPolicy })));
const PrivacyPolicy = lazy(() => import('./pages/Legal').then(module => ({ default: module.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/Legal').then(module => ({ default: module.TermsOfService })));

const App = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <ScrollToTop />
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/sell" element={<SellItem />} />
                <Route path="/auction/:id" element={<AuctionDetail />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/requests" element={<BuyerRequests />} />
                <Route path="/requests/create" element={<CreateRequest />} />
                <Route path="/requests/my" element={<MyRequests />} />
                
                {/* Legal Routes */}
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/escrow" element={<EscrowPolicy />} />
                <Route path="/rules" element={<AuctionRules />} />
                <Route path="/ethics" element={<EthicsPolicy />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminPanel />} />
                
                {/* Catch-all 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;