
import React from 'react';
import { IoEarth } from 'react-icons/io5';


const Header = () => {
  return (
    // H&R Assistantのタイトル。画面の上部に表示する。
    <header className="bg-slate-900 text-white p-4 flex items-center">
      <IoEarth className="size-7 mr-4" />
      <h1 className="text-2xl">H&R Assistant</h1>
    </header>
  );
};

export default Header;
