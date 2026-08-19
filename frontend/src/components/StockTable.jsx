import React, { useState } from 'react';
import { Package, Search, AlertTriangle, CheckCircle, Clock, TrendingDown, TrendingUp } from 'lucide-react';

export default function StockTable({ stocks }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Filtrer les stocks
    const filteredStocks = stocks.filter(item => {
        const matchesSearch = item.product.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || 
            (filterStatus === 'critical' && item.remaining <= 3) ||
            (filterStatus === 'low' && item.remaining > 3 && item.remaining <= 6) ||
            (filterStatus === 'good' && item.remaining > 6);
        return matchesSearch && matchesFilter;
    });

    // Statistiques
    const totalProducts = stocks.length;
    const criticalProducts = stocks.filter(item => item.remaining <= 3).length;
    const lowProducts = stocks.filter(item => item.remaining > 3 && item.remaining <= 6).length;
    const goodProducts = stocks.filter(item => item.remaining > 6).length;

    const getStockStatus = (remaining) => {
        if (remaining <= 3) return { label: 'Critique', color: 'bg-red-100 text-red-700 border-red-300', icon: AlertTriangle };
        if (remaining <= 6) return { label: 'Faible', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: Clock };
        return { label: 'Bon', color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle };
    };

    const getProgressColor = (remaining, initial) => {
        const percentage = (remaining / initial) * 100;
        if (percentage <= 20) return 'bg-red-500';
        if (percentage <= 50) return 'bg-orange-500';
        return 'bg-green-500';
    };

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* En-tête */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
                <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-white" />
                    <h2 className="text-lg font-semibold text-white">
                        État des Stocks
                    </h2>
                </div>
            </div>

            <div className="p-6">
                {/* Statistiques rapides */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium">Total</p>
                        <p className="text-lg font-bold text-gray-800">{totalProducts}</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-xs text-red-600 font-medium">Critique</p>
                        <p className="text-lg font-bold text-red-600">{criticalProducts}</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-xs text-orange-600 font-medium">Faible</p>
                        <p className="text-lg font-bold text-orange-600">{lowProducts}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs text-green-600 font-medium">Bon</p>
                        <p className="text-lg font-bold text-green-600">{goodProducts}</p>
                    </div>
                </div>

                {/* Filtres */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un produit..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                filterStatus === 'all' 
                                    ? 'bg-amber-500 text-white shadow-md' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Tous
                        </button>
                        <button
                            onClick={() => setFilterStatus('critical')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                filterStatus === 'critical' 
                                    ? 'bg-red-500 text-white shadow-md' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Critique
                        </button>
                        <button
                            onClick={() => setFilterStatus('low')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                filterStatus === 'low' 
                                    ? 'bg-orange-500 text-white shadow-md' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Faible
                        </button>
                        <button
                            onClick={() => setFilterStatus('good')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                filterStatus === 'good' 
                                    ? 'bg-green-500 text-white shadow-md' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Bon
                        </button>
                    </div>
                </div>

                {/* Tableau */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b-2 border-gray-200">
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Produit
                                </th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                                    Initial
                                </th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                                    Vendus
                                </th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                                    Restant
                                </th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Progression
                                </th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                                    Statut
                                </th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Prochaine Commande
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStocks.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-6 text-center text-gray-400">
                                        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Aucun produit trouvé</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredStocks.map((item) => {
                                    const status = getStockStatus(item.remaining);
                                    const StatusIcon = status.icon;
                                    const progressPercentage = (item.remaining / item.initial) * 100;
                                    const isCritical = item.remaining <= 3;

                                    return (
                                        <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${
                                            isCritical ? 'bg-red-50/50' : ''
                                        }`}>
                                            <td className="p-3 font-medium text-gray-800">
                                                <div className="flex items-center gap-2">
                                                    {isCritical && (
                                                        <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                                                    )}
                                                    {item.product}
                                                </div>
                                            </td>
                                            <td className="p-3 text-center text-gray-600">
                                                {item.initial}
                                            </td>
                                            <td className="p-3 text-center text-red-500 font-semibold">
                                                -{item.sold}
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`font-bold ${
                                                    isCritical ? 'text-red-600' : 
                                                    item.remaining <= 6 ? 'text-orange-600' : 
                                                    'text-green-600'
                                                }`}>
                                                    {item.remaining}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(item.remaining, item.initial)}`}
                                                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-400 mt-1 block">
                                                    {Math.round(progressPercentage)}% restant
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="p-3 text-gray-500 text-sm">
                                                {item.nextOrder}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}