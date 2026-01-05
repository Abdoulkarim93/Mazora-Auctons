import React, { Component, Suspense, lazy, ErrorInfo, ReactNode } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context.tsx';
import { Layout } from './components/Layout.tsx';
import { LoadingSpinner } from './components/Loading.tsx';
import { ScrollToTop } from './components/ScrollToTop.tsx';
import { AIChatBot } from './components/AIChatBot.tsx';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage?: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    const message = error instanceof Error 
      ? error.message 
      : (typeof error === 'object' ? JSON.stringify(error) : String(error));
    return { hasError: true, errorMessage: message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Critical Application Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-center">
          <div className="max-w-md">
            <div className="text-6xl mb-4 animate-bounce">⚠️</div>
            <h1 className="text-2xl font-display font-black text-gray-900 mb-2 uppercase tracking-tighter italic">Sistem Hatası</h1>
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl mb-6">
              <p className="text-red-800 text-[10px] font-mono break-all font-bold">
                {this.state.errorMessage}
              </p>
            </div>
            <p className="text-gray-500 mb-6 font-medium text-sm">Mazora geçici bir sorunla karşılaştı. Lütfen sayfayı yenileyin.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-primary text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-primary-800 transition-all active:scale-95"
            >
              MAZORA'YI YENİLE
            </button>
          </div>
        </div>
      );
    }
    // Fix: Accessing props via any cast to resolve property existence error on ErrorBoundary type
    return (this as any).props.children;
  }
}

// Optimized Lazy Loading
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
const QuickListSuccess = lazy(() => import('./pages/QuickListSuccess').then(module => ({ default: module.QuickListSuccess })));
const UserFeedback = lazy(() => import('./pages/UserFeedback').then(module => ({ default: module.UserFeedback })));
const VerifiedSellers = lazy(() => import('./pages/VerifiedSellers').then(module => ({ default: module.VerifiedSellers })));

// Legal pages
const HelpCenter = lazy(() => import('./pages/Legal').then(module => ({ default: module.HelpCenter })));
const EscrowPolicy = lazy(() => import('./pages/Legal').then(module => ({ default: module.EscrowPolicy })));
const AuctionRules = lazy(() => import('./pages/Legal').then(module => ({ default: module.AuctionRules })));
const EthicsPolicy = lazy(() => import('./pages/Legal').then(module => ({ default: module.EthicsPolicy })));
const PrivacyPolicy = lazy(() => import('./pages/Legal').then(module => ({ default: module.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/Legal').then(module => ({ default: module.TermsOfService })));
const MembershipContract = lazy(() => import('./pages/Legal').then(module => ({ default: module.MembershipContract })));
const FAQ = lazy(() => import('./pages/FAQ').then(module => ({ default: module.FAQ })));
const AboutUs = lazy(() => import('./pages/AboutUs').then(module => ({ default: module.AboutUs })));

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
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/sell" element={<SellItem />} />
                <Route path="/quick-list-success" element={<QuickListSuccess />} />
                <Route path="/auction/:id" element={<AuctionDetail />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/requests" element={<BuyerRequests />} />
                <Route path="/requests/create" element={<CreateRequest />} />
                <Route path="/requests/my" element={<MyRequests />} />
                <Route path="/feedback" element={<UserFeedback />} />
                <Route path="/verified-sellers" element={<VerifiedSellers />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/escrow" element={<EscrowPolicy />} />
                <Route path="/rules" element={<AuctionRules />} />
                <Route path="/ethics" element={<EthicsPolicy />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/contract" element={<MembershipContract />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminPanel />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <AIChatBot />
            </Suspense>
          </Layout>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;