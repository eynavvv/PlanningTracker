import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, List, Settings, LogOut, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: List, label: 'All Plans', path: '/plans' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-slate-900 min-h-screen text-slate-300 flex flex-col shadow-xl flex-shrink-0 transition-all duration-300`}>
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                {!isCollapsed && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20"></div>
                        <span className="font-bold text-white text-lg tracking-tight">AntiGravity</span>
                    </div>
                )}
                {isCollapsed && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20 mx-auto"></div>
                )}
            </div>

            {/* User Profile Section */}
            {user && (
                <div className={`p-4 border-b border-slate-800 ${isCollapsed ? 'flex justify-center' : ''}`}>
                    {isCollapsed ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500 shadow-lg" title={user.name}>
                            {user.picture ? (
                                <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500 shadow-lg flex-shrink-0">
                                {user.picture ? (
                                    <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

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

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 w-full transition-colors mb-2`}
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    {!isCollapsed && <span>Collapse</span>}
                </button>

                <button
                    onClick={handleLogout}
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 w-full transition-colors`}
                    title={isCollapsed ? 'Sign out' : ''}
                >
                    <LogOut className="w-5 h-5 opacity-70" />
                    {!isCollapsed && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

