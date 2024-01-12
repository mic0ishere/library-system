import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { GeistSans } from "geist/font/sans";
import { ProtectedLayout } from "@/components/protected-route";
import Navbar from "@/components/navbar";

import "@/styles/globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

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
              className={`${GeistSans.variable} font-sans w-full flex flex-col items-center px-8 md:px-16 lg:px-32`}
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
