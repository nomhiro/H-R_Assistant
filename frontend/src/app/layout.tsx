"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider, useSession, signIn } from "next-auth/react";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const checkSession = async () => {
      const session = await fetch("/api/auth/session").then((res) => res.json());
      if (!session?.user) {
        signIn();
      }
    };
    checkSession();
  }, []);

  return (
    <html lang="ja">
      <body className={inter.className}>
        <SessionProvider>
          <AuthGuard>{children}</AuthGuard> {/* 認可ガードを適用 */}
        </SessionProvider>
      </body>
    </html>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>読み込み中...</div>;
  }

  if (!session?.user) {
    return <div>ログインが必要です。</div>;
  }

  return <>{children}</>;
}
