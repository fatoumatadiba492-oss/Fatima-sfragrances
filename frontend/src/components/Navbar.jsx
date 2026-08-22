import React, { useState } from 'react';
import { Menu, X, Settings, LayoutDashboard, Sparkles, CreditCard, Receipt, ShoppingBag } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        { id: 'sales', label: 'Ventes', icon: ShoppingBag },
        { id: 'settings', label: 'Paramètres & Stocks', icon: Settings },
        { id: 'credits', label: 'Ventes à crédit', icon: CreditCard },
        { id: 'expenses', label: 'Réapprovisionnement', icon: Receipt }
    ];

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo */}
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

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm p-1 rounded-xl">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleTabChange(item.id)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                                        transition-all duration-300
                                        ${isActive 
                                            ? 'bg-white text-amber-700 shadow-lg scale-105' 
                                            : 'text-white/80 hover:text-white hover:bg-white/10'
                                        }
                                    `}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-white/80'}`} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6 text-white" />
                        ) : (
                            <Menu className="w-6 h-6 text-white" />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <nav className="md:hidden mt-4 pt-4 border-t border-white/10 space-y-1 animate-fade-in">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleTabChange(item.id)}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                                        transition-all duration-200
                                        ${isActive 
                                            ? 'bg-white text-amber-700 shadow-lg' 
                                            : 'text-white/80 hover:text-white hover:bg-white/10'
                                        }
                                    `}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-amber-600' : 'text-white/80'}`} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>
                )}
            </div>
        </header>
    );
}