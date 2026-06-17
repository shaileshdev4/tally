import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PwaInstall from "@/components/PwaInstall";
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
        <PwaInstall />
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
