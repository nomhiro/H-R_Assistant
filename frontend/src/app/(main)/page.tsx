"use client";

import { useSession } from "next-auth/react";
import FormInput from "@/components/FormInput/FormInput";
import MessageArea from "@/components/MessageArea/MessageArea";
import Head from "next/head"; // Headを追加

export default function Home() {
  const { data: session } = useSession();

  console.log(session?.idToken); // ID トークンを sessionに格納できている
  console.log(session?.user?.email); // auth() と同様に取得できる

  return (
    <>
      <Head>
        <title>AIチャット</title> {/* タイトルを設定 */}
      </Head>
      <main className="flex flex-col text-gray-800 w-full h-full overflow-y-auto">
        <div className="flex bg-slate-300 h-5/6 justify-center">
          <MessageArea />
        </div>
        <div className="flex h-1/6 justify-center items-center">
          <FormInput />
        </div>
      </main>
    </>
  );
}
