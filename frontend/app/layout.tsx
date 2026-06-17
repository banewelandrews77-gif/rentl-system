import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { ChatBot } from "@/components/ChatBot";

export const metadata: Metadata = {
  title: "HostelConnect GH — Student Housing in Ghana",
  description: "Find verified hostel listings near universities in Ghana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <ChatBot />
        </AuthProvider>
      </body>
    </html>
  );
}
