import { useState } from 'react';
import { Menu, X, Settings, LayoutDashboard, Sparkles, CreditCard, Receipt, ShoppingBag, BarChart3 } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        { id: 'sales', label: 'Ventes', icon: ShoppingBag },
        { id: 'history', label: 'Historique & Épargne', icon: BarChart3 },
        { id: 'credits', label: 'Ventes à crédit', icon: CreditCard },
        { id: 'expenses', label: 'Réapprovisionnement', icon: Receipt },
        { id: 'settings', label: 'Paramètres & Stocks', icon: Settings },
    ];

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setIsSidebarOpen(false);
    };

    return (
        <>
            <header className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white tracking-tight">
                                    Fatima's Fragrance
                                </h1>
                                <p className="text-xs text-amber-200 font-medium">
                                    Gestion de parfums
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <Menu className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>
            </header>

            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    <aside className="relative w-72 bg-white shadow-2xl h-full overflow-y-auto animate-slide-in">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800">Menu</h2>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                        <nav className="p-3 space-y-1">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleTabChange(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            isActive
                                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                        }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-amber-600' : 'text-gray-400'}`} />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>
                </div>
            )}
        </>
    );
}
