import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { ProtectedLayout } from "@/components/protected-route";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/navbar";

// it needs to be imported here to work
import "geist/font/sans";
import "@/styles/globals.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ProtectedLayout>
          <TooltipProvider>
            <main
              className="w-full flex flex-col items-center px-4 md:px-16 lg:px-32"
            >
              {Component.displayName !== "ErrorPage" && <Navbar />}
              <Component {...pageProps} />
            </main>
          </TooltipProvider>
        </ProtectedLayout>
      </ThemeProvider>
    </SessionProvider>
  );
}
