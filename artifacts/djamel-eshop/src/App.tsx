import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { AppProviders } from "./contexts";
import { AppLayout } from "./components/layout/AppLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { isSupabaseConfigured } from "./lib/supabase";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { ShoppingBag } from "lucide-react";

import Home from "./pages/home";
import SignInPage from "./pages/sign-in";
import SignUpPage from "./pages/sign-up";
import ListingsPage from "./pages/listings";
import ListingDetail from "./pages/listing-detail";
import CreateListingPage from "./pages/create-listing";
import Dashboard from "./pages/dashboard";
import MessagesPage from "./pages/messages";
import OrdersPage from "./pages/orders";
import ProfilePage from "./pages/profile";
import PublicProfilePage from "./pages/public-profile";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2,
    },
  },
});

const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

function LoadingSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function SupabaseMissingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-black">Djamel E Shop</h1>
        <p className="text-muted-foreground text-sm">السوق المحلي الجزائري</p>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-200 text-start" dir="rtl">
          <p className="font-semibold mb-2">⚙️ إعداد Supabase مطلوب</p>
          <p className="mb-2">يجب إضافة متغيرات البيئة في ملف <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">.env</code> أو إعدادات Replit:</p>
          <ul className="list-disc list-inside space-y-1 text-xs font-mono">
            <li>VITE_SUPABASE_URL</li>
            <li>VITE_SUPABASE_ANON_KEY</li>
            <li>SUPABASE_JWT_SECRET</li>
            <li>DATABASE_URL</li>
          </ul>
          <p className="mt-3 text-xs">راجع ملف <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">.env.example</code> للتفاصيل.</p>
        </div>
      </div>
    </div>
  );
}

function HomeRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  if (isLoaded && isSignedIn) return <Redirect to="/dashboard" />;
  return <Home />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <LoadingSpinner />;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  return <>{children}</>;
}

function AuthTokenSync() {
  const { getToken } = useAuth();
  useEffect(() => {
    setAuthTokenGetter(getToken);
    return () => setAuthTokenGetter(null);
  }, [getToken]);
  return null;
}

function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthTokenSync />
      <AppLayout>
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route path="/listings/create" component={() => <ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
          <Route path="/listings/:listingId" component={() => <ListingDetail />} />
          <Route path="/listings" component={ListingsPage} />
          <Route path="/dashboard" component={() => <ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/messages" component={() => <ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/orders" component={() => <ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/profile" component={() => <ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/profiles/:userId" component={() => <PublicProfilePage />} />
          <Route component={NotFound} />
        </Switch>
      </AppLayout>
    </QueryClientProvider>
  );
}

function App() {
  if (!isSupabaseConfigured) {
    return (
      <AppProviders>
        <SupabaseMissingPage />
      </AppProviders>
    );
  }

  return (
    <ErrorBoundary>
      <AppProviders>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={basePath}>
              <AppRoutes />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
