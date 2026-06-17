import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PwaInstall from "@/components/PwaInstall";
import PendoInitializer from "@/components/PendoInitializer";
import "./globals.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tally.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Tally -group challenges that don't live in a spreadsheet",
  description:
    "Spin up a group challenge in 60 seconds, share a link, watch a live leaderboard. Read X books, run Y miles, do Z for 30 days -anything.",
  openGraph: {
    title: "Tally",
    description: "Group challenges minus the spreadsheet.",
    type: "website",
  },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Tally" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(apiKey){
    (function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||{};o._q=o._q||[];
    v=['initialize','identify','updateOptions','pageLoad','track','trackAgent'];for(w=0,x=v.length;w<x;++w)(function(m){
    o[m]=o[m]||function(){o._q[m===v[0]?'unshift':'push']([m].concat([].slice.call(arguments,0)));};})(v[w]);
    y=e.createElement(n);y.async=!0;y.src='https://cdn.pendo.io/agent/static/'+apiKey+'/pendo.js';
    z=e.getElementsByTagName(n)[0];z.parentNode.insertBefore(y,z);})(window,document,'script','pendo');
})('d17a882c-4710-4483-a351-b73f3a6e1275');`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="ambient-canvas bg-mesh flex min-h-screen flex-col board-grain">
        <PendoInitializer />
        <PwaInstall />
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
