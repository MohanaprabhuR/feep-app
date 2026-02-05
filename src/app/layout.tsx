
import "./globals.css";
import { AuthProvider } from "@/components/context/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
         <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
