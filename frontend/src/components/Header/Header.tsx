import React from 'react'
import { IoEarth } from 'react-icons/io5'

const Header = () => {
  return (
    // 画面上部のHeaderメニュー。H&R Assistantと表示する
    <header className='bg-slate-900 text-white text-lg flex items-center justify-between px-4'>
      <div className='flex items-center'>
        <IoEarth className='text-2xl' />
        <span className='ml-2'>H&R Assistant</span>
      </div>
    </header>
  )
}

export default Header;