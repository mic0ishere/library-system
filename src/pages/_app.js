import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedLayout } from "@/components/protected-route";
import { Toaster } from "@/components/ui/sonner";

import Navbar from "@/components/navbar";

import { GeistSans } from "geist/font/sans";
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
        <TooltipProvider>
          <main
            className={`w-full flex flex-col items-center px-4 md:px-16 lg:px-32 ${GeistSans.variable} font-sans`}
          >
            <ProtectedLayout>
              {Component.displayName !== "ErrorPage" && <Navbar />}
              <Component {...pageProps} />
            </ProtectedLayout>
            <Toaster />
          </main>
        </TooltipProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
