import React from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import UserPresence from './UserPresence';

const Layout = () => {
    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {/* Presence and Theme toggles in top right corner */}
            <div className="fixed top-4 right-4 z-50 flex items-center gap-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 transition-all">
                <UserPresence />
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                <ThemeToggle />
            </div>
            <main className="flex-1 p-8 overflow-y-auto h-screen scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                <div className="max-w-[1800px] mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
