import React from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

const Layout = () => {
    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Theme toggle in top right corner */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            <main className="flex-1 p-8 overflow-y-auto h-screen scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
