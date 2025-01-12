"use client"

import React from 'react';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen" >
      <main className="bg-slate-50 flex-1 overflow-auto" > {children} </main>
    </div>
  );
}

export default MainLayout;