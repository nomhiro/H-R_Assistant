import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { getAllAccounts } from "./src/util/cosmos/account";

let allowedEmails: string[] = [];

async function fetchAllowedEmails() {
  try {
    allowedEmails = await getAllAccounts()
      .then((accounts) => accounts.map((account) => account.email))
    console.log("🚀Allowed emails updated:", allowedEmails);
  } catch (error) {
    console.error("Error fetching allowed emails:", error);
  }
}

// 初期化時に許可されたメールアドレスを取得
fetchAllowedEmails();

export const authConfig: NextAuthConfig = {
  providers: [Google],
  trustHost: true, // 型エラーを修正: trustHost を true に設定
  callbacks: {
    async signIn({ user }) {
      if (allowedEmails.includes(user.email || "")) {
        console.log("許可されたメールアドレス:", user.email);
        return true; // 許可されたメールアドレスの場合ログインを許可
      }
      console.log("許可されていないメールアドレス:", user.email);
      return false; // 許可されていない場合ログインを拒否
    },
    async jwt({ token, user, account }) {
      if (user && account?.id_token) {
        token.idToken = account?.id_token;
      }
      return token;
    },
    async session({ token, session }) {
      session.idToken = token.idToken;
      return session;
    },
  },
};