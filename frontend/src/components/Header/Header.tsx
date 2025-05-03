import React from 'react';
import { IoHome } from 'react-icons/io5';
import { MdFolder } from 'react-icons/md';
import Link from 'next/link';
import { useSession } from "next-auth/react"; // 追加
import { LogInButton, LogOutButton } from "@/components/AuthButton";

const Header = () => {
  const { data: session } = useSession(); // セッション情報を取得

  return (
    <header className='bg-slate-900 text-white text-lg flex items-center justify-between px-4'>
      <div className='flex items-center'>
        <Link href="/" className="flex items-center">
          <IoHome className='text-2xl' />
          <span className='ml-2 hover:underline'>AIチャット</span>
        </Link>
        <Link href="/documents" className="flex items-center text-xs hover:underline ml-4">
          <MdFolder className="mr-1" />
          ナレッジ
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {session?.user?.email && ( // サインインしている場合にメールアドレスを表示
          <span className="text-sm">{session.user.email.split("@")[0]}</span>
        )}
        {session ? <LogOutButton /> : <LogInButton />} {/* サインイン状態に応じてボタンを表示 */}
      </div>
    </header>
  );
};

export default Header;