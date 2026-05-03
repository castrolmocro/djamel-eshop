import { ClerkProvider, SignIn, SignUp, useUser, useClerk } from "@clerk/react";
import { shadcn } from "@clerk/themes";
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
import ListingsPage from "./pages/listings";
import ListingDetail from "./pages/listing-detail";
import CreateListingPage from "./pages/create-listing";
import Dashboard from "./pages/dashboard";
import MessagesPage from "./pages/messages";
import OrdersPage from "./pages/orders";
import ProfilePage from "./pages/profile";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
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
  if (!clerkPubKey) {
    clerkInitError = "VITE_CLERK_PUBLISHABLE_KEY is not configured.";
  }
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

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/favicon.svg`,
  },
  variables: {
    colorPrimary: "hsl(15 80% 55%)",
    colorForeground: "hsl(20 14% 15%)",
    colorMutedForeground: "hsl(25 10% 40%)",
    colorDanger: "hsl(0 75% 50%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInput: "hsl(30 15% 95%)",
    colorInputForeground: "hsl(20 14% 15%)",
    colorNeutral: "hsl(30 15% 85%)",
    fontFamily: "'Outfit', sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white dark:bg-zinc-950 rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl border",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-2xl font-bold text-foreground",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButtonText: "text-foreground font-medium",
    formFieldLabel: "text-sm font-medium text-foreground",
    footerActionLink: "text-primary hover:text-primary/80 font-medium",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground",
    identityPreviewEditButton: "text-primary hover:text-primary/80",
    formFieldSuccessText: "text-green-600",
    alertText: "text-destructive",
    logoBox: "h-12 flex justify-center mb-4",
    logoImage: "h-full w-auto",
    socialButtonsBlockButton: "border-input bg-background hover:bg-muted transition-colors",
    formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm",
    formFieldInput: "bg-background border-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent",
    footerAction: "mt-6",
    dividerLine: "bg-border",
    alert: "bg-destructive/10 border-destructive/20",
    otpCodeFieldInput: "border-input bg-background",
    formFieldRow: "mb-4",
    main: "px-8 py-6",
  },
};

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
        <div>
          <h1 className="text-3xl font-black mb-2 gradient-text">Djamel E Shop</h1>
          <p className="text-muted-foreground text-sm">السوق المحلي الجزائري</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-200 text-start space-y-2" dir="rtl">
          <p className="font-semibold">⚙️ إعداد مطلوب</p>
          <p>يجب إضافة متغير البيئة <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">VITE_CLERK_PUBLISHABLE_KEY</code> لتشغيل نظام المصادقة.</p>
          <p className="text-xs opacity-70 mt-1">Configure <strong>VITE_CLERK_PUBLISHABLE_KEY</strong> in your Railway environment variables.</p>
        </div>
        <a
          href="https://clerk.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          احصل على مفتاح Clerk مجاناً
        </a>
      </div>
    </div>
  );
}

function SignInPage() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-muted/30 px-4 py-12">
      <SignIn
        routing="virtual"
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={`${basePath}/`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-muted/30 px-4 py-12">
      <SignUp
        routing="virtual"
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={`${basePath}/`}
      />
    </div>
  );
}

function HomeRedirect() {
  const { isLoaded, isSignedIn } = useUser();
  if (isLoaded && isSignedIn) {
    return <Redirect to="/dashboard" />;
  }
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
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
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
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "مرحباً بعودتك",
            subtitle: "سجّل دخولك للوصول إلى حسابك",
          },
        },
        signUp: {
          start: {
            title: "انضم إلى السوق المحلي",
            subtitle: "أنشئ حساباً للبيع والشراء",
          },
        },
      }}
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
