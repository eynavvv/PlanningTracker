import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, List, Settings, ChevronLeft, ChevronRight, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { signOut, user } = useAuth();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: List, label: 'All Plans', path: '/plans' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-slate-900 min-h-screen text-slate-300 flex flex-col shadow-xl flex-shrink-0 transition-all duration-300`}>
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                {!isCollapsed && (
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded" />
                        <span className="font-bold text-white text-xl tracking-tight">SundaySky</span>
                    </div>
                )}
                {isCollapsed && (
                    <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded mx-auto" />
                )}
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-blue-600/10 text-blue-400 font-medium'
                                : 'hover:bg-slate-800 hover:text-white'
                            }`
                        }
                        title={isCollapsed ? item.label : ''}
                    >
                        <item.icon className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                        {!isCollapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-2">
                {!isCollapsed && user && (
                    <div className="px-3 py-2 mb-2 flex items-center gap-3 text-sm text-slate-400 bg-slate-800/50 rounded-lg overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                            {user.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-8 h-8 rounded-full" />
                            ) : (
                                <User className="w-4 h-4 text-blue-400" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="truncate font-medium text-slate-300">{user.user_metadata?.full_name || 'User'}</p>
                            <p className="truncate text-xs text-slate-500">{user.email}</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={signOut}
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/20 w-full transition-colors`}
                    title="Sign Out"
                >
                    <LogOut className="w-5 h-5" />
                    {!isCollapsed && <span>Sign Out</span>}
                </button>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 w-full transition-colors`}
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    {!isCollapsed && <span>Collapse</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

