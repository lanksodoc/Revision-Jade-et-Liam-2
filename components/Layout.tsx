
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white font-sans overflow-x-hidden">
      <header className="p-6 flex justify-between items-center bg-black/30 backdrop-blur-md sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.5)]">
            <span className="text-2xl font-bold text-indigo-900">Q</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic">Le Grand Quiz des Champions</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};
