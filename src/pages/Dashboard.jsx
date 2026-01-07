import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { sheetsService } from '../services/googleSheets';
import NewInitiativeModal from '../components/NewInitiativeModal';

// Dropdown options based on user schema
const STATUS_OPTIONS = ['Initial Planning', 'Release Planning', 'Development', 'Released'];
const PM_OPTIONS = ['Naama', 'Asaf', 'Sapir'];
const UX_OPTIONS = ['Tal', 'Maya', 'Naor'];
const GROUP_OPTIONS = ['Zebra', 'Pegasus'];

const Dashboard = () => {
    const [initiatives, setInitiatives] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const syncTimeoutRef = useRef({});

    useEffect(() => {
        loadInitiatives();
    }, []);

    const loadInitiatives = async () => {
        try {
            setIsLoading(true);

            if (!sheetsService.isConfigured()) {
                setInitiatives([
                    { id: '1', name: 'Demo Initiative', status: 'Initial Planning', pm: 'Naama', ux: 'Tal', group: 'Zebra', techLead: 'John', developers: ['Alice', 'Bob'] },
                ]);
                setIsLoading(false);
                return;
            }

            const releases = await sheetsService.getAllReleases();
            setInitiatives(releases);
        } catch (err) {
            console.error("Failed to load initiatives:", err);
            setError("Failed to load initiatives. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced sync to sheet
    const debouncedSync = useCallback((initiativeId, field, value) => {
        if (syncTimeoutRef.current[initiativeId]) {
            clearTimeout(syncTimeoutRef.current[initiativeId]);
        }

        syncTimeoutRef.current[initiativeId] = setTimeout(async () => {
            try {
                if (!sheetsService.isConfigured()) return;

                const initiative = initiatives.find(i => i.id === initiativeId);
                if (!initiative) return;

                await sheetsService.updateInitiative(initiative.rowIndex, { [field]: value });
            } catch (err) {
                console.error('Failed to sync to sheet:', err);
            }
        }, 1000);
    }, [initiatives]);

    const handleFieldChange = (id, field, value) => {
        setInitiatives(prev => prev.map(init =>
            init.id === id ? { ...init, [field]: value } : init
        ));
        debouncedSync(id, field, value);
    };

    const handleCreateInitiative = async (name) => {
        try {
            await sheetsService.createInitiative(name);
            navigate(`/plan/${encodeURIComponent(name)}`);
        } catch (err) {
            console.error('Failed to create initiative:', err);
            throw err;
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-500 font-medium">Loading Initiatives...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <img src="https://sundaysky.com/wp-content/uploads/2022/11/Sundaysky-logo-02.png" alt="SundaySky" className="h-10" />
                    <div>
                        <h1 className="text-3xl font-bold text-ss-navy">Initiatives Dashboard</h1>
                        <p className="text-slate-500 mt-1">Manage and track all strategic initiatives.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-ss-primary hover:bg-ss-action text-white px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 font-medium transition-all"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Initiative</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-900 w-1/4">Initiative Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">PM</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">UX</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Group</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Tech Lead</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Developers</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {initiatives.map((init) => (
                                <tr key={init.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        <Link
                                            to={`/plan/${encodeURIComponent(init.id)}`}
                                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                            title={init.name}
                                        >
                                            {init.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={init.status}
                                            onChange={(e) => handleFieldChange(init.id, 'status', e.target.value)}
                                            className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide w-full text-center border-none focus:ring-2 focus:ring-blue-400 outline-none ${init.status === 'Initial Planning' || init.status === 'Release Planning' ? 'bg-blue-100 text-blue-800' :
                                                init.status === 'Development' ? 'bg-amber-100 text-amber-800' :
                                                    init.status === 'Released' ? 'bg-green-100 text-green-800' :
                                                        'bg-slate-100 text-slate-600'
                                                }`}
                                        >
                                            {STATUS_OPTIONS.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={init.pm || ''}
                                            onChange={(e) => handleFieldChange(init.id, 'pm', e.target.value)}
                                            className="bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none w-full text-slate-600"
                                        >
                                            <option value="">Select PM</option>
                                            {PM_OPTIONS.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={init.ux || ''}
                                            onChange={(e) => handleFieldChange(init.id, 'ux', e.target.value)}
                                            className="bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none w-full text-slate-600"
                                        >
                                            <option value="">Select UX</option>
                                            {UX_OPTIONS.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={init.group || ''}
                                            onChange={(e) => handleFieldChange(init.id, 'group', e.target.value)}
                                            className="bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none w-full text-slate-600"
                                        >
                                            <option value="">Select Group</option>
                                            {GROUP_OPTIONS.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            value={init.techLead || ''}
                                            onChange={(e) => handleFieldChange(init.id, 'techLead', e.target.value)}
                                            className="bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none w-full text-slate-600"
                                            placeholder="Lead"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                        <input
                                            value={Array.isArray(init.developers) ? init.developers.join(', ') : init.developers || ''}
                                            onChange={(e) => handleFieldChange(init.id, 'developers', e.target.value.split(',').map(d => d.trim()))}
                                            className="bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none w-full text-slate-600 truncate"
                                            placeholder="Devs..."
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <NewInitiativeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateInitiative}
            />
        </div>
    );
};

export default Dashboard;
