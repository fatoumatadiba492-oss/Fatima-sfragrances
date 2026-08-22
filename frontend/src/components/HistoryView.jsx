import { useState } from 'react';
import { BarChart3, Calendar, PiggyBank } from 'lucide-react';

export default function HistoryView({ sales, expenses, stocks }) {
    const [period, setPeriod] = useState('weekly');

    const formatCurrency = (value) => new Intl.NumberFormat('fr-FR').format(Math.round(value)) + ' CFA';

    const getProductPurchasePrice = (productName) => {
        const product = stocks.find(s => s.product === productName);
        return product?.purchasePrice || 0;
    };

    const groupSales = () => {
        const groups = {};
        sales.forEach(sale => {
            let key;
            const saleDate = new Date(sale.date);
            if (period === 'weekly') {
                const day = saleDate.getDay();
                const monday = new Date(saleDate);
                monday.setDate(saleDate.getDate() - (day === 0 ? 6 : day - 1));
                key = monday.toISOString().split('T')[0];
            } else if (period === 'monthly') {
                key = sale.date.substring(0, 7);
            } else {
                key = sale.date.substring(0, 4);
            }

            if (!groups[key]) {
                groups[key] = { sales: [], expenses: 0, clients: new Set() };
            }
            groups[key].sales.push(sale);
            groups[key].clients.add(sale.date + sale.time);
        });

        expenses.forEach(expense => {
            let key;
            const expDate = new Date(expense.date);
            if (period === 'weekly') {
                const day = expDate.getDay();
                const monday = new Date(expDate);
                monday.setDate(expDate.getDate() - (day === 0 ? 6 : day - 1));
                key = monday.toISOString().split('T')[0];
            } else if (period === 'monthly') {
                key = expense.date.substring(0, 7);
            } else {
                key = expense.date.substring(0, 4);
            }
            if (groups[key]) {
                groups[key].expenses += expense.amount;
            }
        });

        return Object.entries(groups)
            .map(([key, data]) => {
                const totalVentes = data.sales.reduce((sum, s) => sum + s.amount, 0);
                const totalExpenses = data.expenses;
                const beneficeNet = totalVentes - totalExpenses;
                const epargne = data.sales.reduce((sum, s) => {
                    const purchasePrice = getProductPurchasePrice(s.product);
                    const profitPerUnit = (s.amount / s.quantity) - purchasePrice;
                    return sum + (profitPerUnit > 0 ? (profitPerUnit * s.quantity) / 2 : 0);
                }, 0);

                return {
                    period: key,
                    clients: data.clients.size,
                    totalVentes,
                    totalExpenses,
                    beneficeNet,
                    epargne
                };
            })
            .sort((a, b) => b.period.localeCompare(a.period));
    };

    const formatPeriodLabel = (key) => {
        if (period === 'weekly') {
            const start = new Date(key);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            return `${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
        } else if (period === 'monthly') {
            const [year, month] = key.split('-');
            const date = new Date(year, month - 1);
            return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        }
        return key;
    };

    const grouped = groupSales();
    const totalEpargne = grouped.reduce((sum, g) => sum + g.epargne, 0);

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3">
                    <BarChart3 className="w-8 h-8" />
                    <div>
                        <h2 className="text-2xl font-bold">Historique & Épargne</h2>
                        <p className="text-amber-100 mt-1">Résumé de votre activité et épargne obligatoire</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <PiggyBank className="w-6 h-6 text-green-600" />
                    <h3 className="font-bold text-gray-800 text-lg">Épargne totale</h3>
                </div>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(totalEpargne)}</p>
                <p className="text-sm text-gray-500 mt-1">50% du bénéfice par produit vendu mis de côté</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-amber-500" />
                        <h3 className="font-semibold text-gray-700">Résumé par période</h3>
                    </div>
                    <div className="flex gap-2">
                        {[
                            { id: 'weekly', label: 'Semaine' },
                            { id: 'monthly', label: 'Mois' },
                            { id: 'yearly', label: 'Année' }
                        ].map(p => (
                            <button
                                key={p.id}
                                onClick={() => setPeriod(p.id)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                    period === p.id
                                        ? 'bg-amber-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b-2 border-gray-200">
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase">Période</th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase text-center">Clients</th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase text-right">Total Ventes</th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase text-right">Dépenses</th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase text-right">Bénéfice Net</th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase text-right">Épargne</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {grouped.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400">Aucune donnée pour cette période</td>
                                </tr>
                            ) : (
                                grouped.map((row) => (
                                    <tr key={row.period} className="hover:bg-gray-50">
                                        <td className="p-3 font-medium text-gray-800">{formatPeriodLabel(row.period)}</td>
                                        <td className="p-3 text-center text-gray-700">{row.clients}</td>
                                        <td className="p-3 text-right text-gray-700">{formatCurrency(row.totalVentes)}</td>
                                        <td className="p-3 text-right text-red-500">{formatCurrency(row.totalExpenses)}</td>
                                        <td className="p-3 text-right font-semibold text-green-600">{formatCurrency(row.beneficeNet)}</td>
                                        <td className="p-3 text-right font-semibold text-blue-600">{formatCurrency(row.epargne)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
