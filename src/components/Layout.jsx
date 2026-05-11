import React from 'react';
import { ExternalLink, Rocket } from 'lucide-react';

const NEW_APP_URL = 'https://ai-apps.sundaysky.com/apps/planning-tracker';

const Layout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-6">
            <div className="max-w-xl w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg mb-6">
                    <Rocket className="w-8 h-8" />
                </div>

                <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-3">
                    Planning Tracker has moved!
                </h1>

                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                    Planning Tracker now lives inside <span className="font-semibold text-slate-800 dark:text-slate-200">SundaySky AI Apps</span>. Please update your bookmarks and continue your work there.
                </p>

                <a
                    href={NEW_APP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all"
                >
                    Open in SundaySky AI Apps
                    <ExternalLink className="w-4 h-4" />
                </a>

                <div className="mt-6 text-xs text-slate-400 dark:text-slate-500 break-all">
                    {NEW_APP_URL}
                </div>
            </div>
        </div>
    );
};

export default Layout;
