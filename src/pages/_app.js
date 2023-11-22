import { GeistSans } from "geist/font/sans";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <main className={`${GeistSans.variable} font-sans`}>
      <Component {...pageProps} />
    </main>
  );
}
