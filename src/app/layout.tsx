import type {Metadata} from 'next';
import './globals.css';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SpotlightSearch } from "@/components/SpotlightSearch";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener";
import { UserProfileAvatar } from "@/components/UserProfileAvatar";
import { NotificationCenter } from "@/components/NotificationCenter";
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'QbLog | Second Cerveau pour Développeurs',
  description: 'Organisez vos extraits de code, vos bugs et vos connaissances dans un espace de travail futuriste.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'QbLog',
  },
};

export const viewport = {
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <Script id="theme-loader" strategy="beforeInteractive">
          {`
            (function() {
              const theme = localStorage.getItem('theme') || 'dark';
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            })();
          `}
        </Script>
      </head>
      <body className="font-body antialiased bg-background text-foreground overflow-x-hidden w-full min-h-screen">
        <FirebaseClientProvider>
          <FirebaseErrorListener />
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col min-h-screen bg-transparent overflow-x-hidden w-full relative">
              <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-lg px-3 md:px-6">
                <div className="flex items-center gap-1 md:gap-2">
                  <SidebarTrigger className="text-foreground hover:bg-white/5 h-10 w-10 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 border-none outline-none ring-0 focus:ring-0" />
                  <div className="h-6 w-px bg-border mx-1 hidden md:block" />
                </div>
                <div className="flex flex-1 items-center gap-2 overflow-hidden px-1">
                  <SpotlightSearch />
                </div>
                <div className="flex items-center gap-2 md:gap-4 shrink-0 pr-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] hidden lg:inline-block">v1.0.0</span>
                  <div className="flex items-center gap-1">
                    <NotificationCenter />
                    <UserProfileAvatar className="h-8 w-8 md:h-9 md:w-9 border-border shadow-lg" iconClassName="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </div>
                </div>
              </header>
              <main className="flex-1 p-3 md:p-6 lg:p-10 overflow-x-hidden w-full pb-24 md:pb-6">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
