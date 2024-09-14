'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../store/store'
import Header from '@/components/Header/Header';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex flex-col h-screen'>
      <Provider store={store}>
        <Header />
        <main className='bg-slate-50 flex-1 overflow-auto p-2 sm:p-6 md:p-8'>{children}</main>
      </Provider>
    </div>
  )
}

export default MainLayout;