import type { Metadata, Viewport } from "next/dist/lib/metadata/types/metadata-interface";
import "./globals.css";

export const metadata: Metadata = {
  title: "KIEZKINGS - Urban Survival RPG",
  description: "Vom Penner zum König der Straße. Ein mobiles Urban Survival RPG.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KIEZKINGS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1A1A1A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👑</text></svg>" />
      </head>
      <body className="antialiased" style={{ background: '#1A1A1A' }}>
        {children}
      </body>
    </html>
  );
}
