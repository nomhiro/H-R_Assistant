import React from 'react';
import { IoHome } from 'react-icons/io5';
import { MdFolder } from 'react-icons/md';
import Link from 'next/link';

const Header = () => {
  return (
    <header className='bg-slate-900 text-white text-lg flex items-center justify-between px-4'>
      <div className='flex items-center'>
        <Link href="/" className="flex items-center">
          <IoHome className='text-2xl' />
          <span className='ml-2 hover:underline'>AIアシスタント</span>
        </Link>
      </div>
      <div className='flex space-x-4'>
        <Link href="/documents" className="flex items-center text-sm hover:underline">
          <MdFolder className="mr-1" />
          ドキュメント管理
        </Link>
      </div>
    </header>
  );
};

export default Header;