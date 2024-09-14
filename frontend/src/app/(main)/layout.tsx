"use client"
import React from 'react';
import { Provider } from 'react-redux';
import SideMenu from '../../components/SideMenu/SideMenu';
import { store } from '../../store/store';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen">
      <Provider store={store}>
        <SideMenu />
        <main className="bg-slate-50 flex-1 overflow-auto">{children}</main>
      </Provider>
    </div>
  );
};

export default MainLayout;
