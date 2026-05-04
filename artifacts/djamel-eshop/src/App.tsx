import { ClerkProvider, useUser, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useRef } from "react";
import { AppProviders } from "./contexts";
import { AppLayout } from "./components/layout/AppLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
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

let clerkPubKey: string | undefined;
let clerkInitError: string | null = null;

try {
  clerkPubKey = publishableKeyFromHost(
    window.location.hostname,
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  );
  if (!clerkPubKey) clerkInitError = "VITE_CLERK_PUBLISHABLE_KEY is not configured.";
} catch (e: any) {
  clerkInitError = e?.message ?? "Failed to initialize auth.";
}

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function LoadingSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ClerkMissingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-black gradient-text">Djamel E Shop</h1>
        <p className="text-muted-foreground text-sm">السوق المحلي الجزائري</p>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-200 text-start" dir="rtl">
          <p className="font-semibold mb-1">⚙️ إعداد مطلوب</p>
          <p>يجب إضافة <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">VITE_CLERK_PUBLISHABLE_KEY</code> في متغيرات البيئة.</p>
        </div>
      </div>
    </div>
  );
}

function HomeRedirect() {
  const { isLoaded, isSignedIn } = useUser();
  if (isLoaded && isSignedIn) return <Redirect to="/dashboard" />;
  return <Home />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) return <LoadingSpinner />;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  return <>{children}</>;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey!}
      proxyUrl={clerkProxyUrl}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
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
    </ClerkProvider>
  );
}

function App() {
  if (clerkInitError || !clerkPubKey) {
    return (
      <AppProviders>
        <ClerkMissingPage />
      </AppProviders>
    );
  }

  return (
    <ErrorBoundary>
      <AppProviders>
        <TooltipProvider>
          <WouterRouter base={basePath}>
            <ClerkProviderWithRoutes />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
