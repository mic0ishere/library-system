import { SessionProvider } from "next-auth/react";
import { GeistSans } from "geist/font/sans";
import "@/styles/globals.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <main className={`${GeistSans.variable} font-sans`}>
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
}
