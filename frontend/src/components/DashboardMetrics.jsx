import React from 'react';
import { TrendingUp, TrendingDown, Package, AlertCircle, Wallet, ShoppingBag } from 'lucide-react';

export default function DashboardMetrics({ sales, stocks, expenses }) {
    // Calculs existants
    const totalCA = sales.reduce((acc, curr) => acc + curr.amount, 0);
    const totalNet = sales.reduce((acc, curr) => acc + curr.net, 0);
    const totalExpenses = (expenses || []).reduce((acc, curr) => acc + curr.amount, 0);
    const adjustedNet = totalNet - totalExpenses;
    const totalFlacons = sales.reduce((acc, curr) => acc + curr.quantity, 0);
    
    // Nouveaux calculs
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(sale => sale.date === today);
    const todayCA = todaySales.reduce((acc, curr) => acc + curr.amount, 0);
    const todayNet = todaySales.reduce((acc, curr) => acc + curr.net, 0);
    
    const lowStockItems = stocks.filter(item => item.remaining <= 3);
    const totalProducts = stocks.length;
    const totalSold = stocks.reduce((acc, curr) => acc + curr.sold, 0);
    const totalRemaining = stocks.reduce((acc, curr) => acc + curr.remaining, 0);
    const totalCapital = stocks.reduce((acc, curr) => acc + (curr.purchaseTotal || 0), 0);
    const potentialCA = stocks.reduce((acc, curr) => acc + (curr.potentialCA || 0), 0);

    // Formatage des nombres
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('fr-FR').format(value) + ' CFA';
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('fr-FR').format(value);
    };

    const metrics = [
        {
            id: 1,
            title: 'Chiffre d\'affaires',
            value: formatCurrency(totalCA),
            subtitle: `Aujourd'hui: ${formatCurrency(todayCA)}`,
            icon: TrendingUp,
            color: 'amber',
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-600'
        },
        {
            id: 2,
            title: 'Bénéfice Net',
            value: formatCurrency(adjustedNet),
            subtitle: `Dépenses: ${formatCurrency(totalExpenses)}`,
            icon: Wallet,
            color: 'green',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600'
        },
        {
            id: 3,
            title: 'Ventes Totales',
            value: `${formatNumber(totalFlacons)} flacons`,
            subtitle: `${formatNumber(totalSold)} vendus • ${formatNumber(totalRemaining)} restants`,
            icon: ShoppingBag,
            color: 'blue',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            id: 6,
            title: 'Réapprovisionnement',
            value: formatCurrency(totalExpenses),
            subtitle: 'Sorties enregistrées',
            icon: TrendingDown,
            color: 'red',
            bgColor: 'bg-red-50',
            textColor: 'text-red-600'
        },
        {
            id: 4,
            title: 'Capital du stock',
            value: formatCurrency(totalCapital),
            subtitle: `CA potentiel: ${formatCurrency(potentialCA)}`,
            icon: Wallet,
            color: 'orange',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600'
        },
        {
            id: 5,
            title: 'Stock Critique',
            value: lowStockItems.length > 0 ? `${lowStockItems.length} produits` : 'OK ✅',
            subtitle: lowStockItems.length > 0 ? lowStockItems.map(item => item.product).join(', ') : 'Tous les stocks sont bons',
            icon: AlertCircle,
            color: lowStockItems.length > 0 ? 'red' : 'green',
            bgColor: lowStockItems.length > 0 ? 'bg-red-50' : 'bg-green-50',
            textColor: lowStockItems.length > 0 ? 'text-red-600' : 'text-green-600'
        }
    ];

    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                    <div 
                        key={metric.id}
                        className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {metric.title}
                                </p>
                                <p className="text-xl font-bold text-gray-800 mt-1">
                                    {metric.value}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {metric.subtitle}
                                </p>
                            </div>
                            <div className={`p-2 rounded-lg ${metric.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className={`w-5 h-5 ${metric.textColor}`} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </section>
    );
}