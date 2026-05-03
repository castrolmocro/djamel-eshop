import { I18nProvider } from "./I18nContext";
import { ThemeProvider } from "./ThemeContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="djamel-theme">
      <I18nProvider>
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}
