"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider, useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

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
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);

  useEffect(() => {
    const fetchAllowedEmails = async () => {
      const response = await fetch("/api/auth/allowed-emails");
      const emails = await response.json();
      setAllowedEmails(emails);
    };
    fetchAllowedEmails();
  }, []);

  if (status === "loading" || allowedEmails.length === 0) {
    return <div>読み込み中...</div>; // ローディング状態
  }

  if (!session?.user) {
    return <div>ログインが必要です。</div>; // 未ログインの場合
  }

  if (!allowedEmails.includes(session.user.email || "")) {
    return <div>認可されていないアカウントです。</div>; // 許可されていない場合
  }

  return <>{children}</>; // 許可された場合のみ子要素を表示
}
