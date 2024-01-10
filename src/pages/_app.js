import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { GeistSans } from "geist/font/sans";
import { ProtectedLayout } from "@/components/protected-route";
import Navbar from "@/components/navbar";

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
          <main className={`${GeistSans.variable} font-sans w-full mt-8 flex flex-col items-center px-8 md:px-16 lg:px-32`}>
            <Navbar />
            <Component {...pageProps} />
          </main>
        </ProtectedLayout>
      </ThemeProvider>
    </SessionProvider>
  );
}
