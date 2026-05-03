import { ClerkProvider, SignIn, SignUp, Show, useUser, useClerk } from "@clerk/react";
import { shadcn } from "@clerk/themes";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useRef } from "react";
import { AppProviders } from "./contexts";
import { AppLayout } from "./components/layout/AppLayout";

// Import pages
import Home from "./pages/home";
import ListingsPage from "./pages/listings";
import ListingDetail from "./pages/listing-detail";
import CreateListingPage from "./pages/create-listing";
import Dashboard from "./pages/dashboard";
import MessagesPage from "./pages/messages";
import OrdersPage from "./pages/orders";
import ProfilePage from "./pages/profile";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
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

function SignInPage() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-muted/30 px-4 py-12">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-muted/30 px-4 py-12">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <Home />
      </Show>
    </>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
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
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back to Djamel E Shop",
            subtitle: "Sign in to access your account",
          },
        },
        signUp: {
          start: {
            title: "Join the local market",
            subtitle: "Create an account to start buying and selling",
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
  return (
    <AppProviders>
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <ClerkProviderWithRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </AppProviders>
  );
}

export default App;
