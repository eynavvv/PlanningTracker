import { useEffect, useState } from 'react';
import { supabase } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';

const UserPresence = () => {
    const { user } = useAuth();
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        if (!user || !supabase || !supabase.channel) return;

        const channel = supabase.channel('online-users', {
            config: {
                presence: {
                    key: user.id,
                },
            },
        });

        const syncUsers = () => {
            const newState = channel.presenceState();
            const users = Object.values(newState).flat().map(presence => presence.user_info);
            const uniqueUsers = Array.from(new Map(users.map(u => [u.id, u])).values());
            setOnlineUsers(uniqueUsers);
        };

        channel
            .on('presence', { event: 'sync' }, syncUsers)
            .on('presence', { event: 'join' }, syncUsers)
            .on('presence', { event: 'leave' }, syncUsers)
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user_info: {
                            id: user.id,
                            name: user.user_metadata?.full_name || user.email,
                            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
                            email: user.email
                        }
                    });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    if (onlineUsers.length === 0) return null;

    return (
        <div className="flex items-center gap-4">
        <div className="flex -space-x-2 overflow-hidden items-center">
            {onlineUsers.map((onlineUser) => (
                <div
                    key={onlineUser.id}
                    className="relative group inline-block"
                >
                    {onlineUser.avatar_url ? (
                        <img
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800 object-cover"
                            src={onlineUser.avatar_url}
                            alt={onlineUser.name}
                            title={onlineUser.name}
                        />
                    ) : (
                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800 bg-ss-navy flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                            {onlineUser.name?.charAt(0) || onlineUser.email?.charAt(0)}
                        </div>
                    )}
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[60] pointer-events-none font-bold shadow-xl border border-slate-700">
                        {onlineUser.name}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                    {/* Active dot */}
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" />
                </div>
            ))}
        </div>
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
        </div>
    );
};

export default UserPresence;
