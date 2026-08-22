import React from 'react';
import { ShoppingBag, Trash2, Package } from 'lucide-react';

export default function SalesHistoryView({ sales, onDeleteSale }) {
    const formatCurrency = (value) => new Intl.NumberFormat('fr-FR').format(value) + ' CFA';

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
                <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-white" />
                    <h2 className="text-lg font-semibold text-white">Historique des ventes</h2>
                </div>
            </div>

            <div className="p-6 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b-2 border-gray-200">
                            <th className="p-3 text-xs font-semibold text-gray-600 uppercase">Date</th>
                            <th className="p-3 text-xs font-semibold text-gray-600 uppercase">Produit</th>
                            <th className="p-3 text-xs font-semibold text-gray-600 uppercase text-center">Qté</th>
                            <th className="p-3 text-xs font-semibold text-gray-600 uppercase text-right">Montant</th>
                            <th className="p-3 text-xs font-semibold text-gray-600 uppercase text-right">Dépenses</th>
                            <th className="p-3 text-xs font-semibold text-gray-600 uppercase text-right">Net</th>
                            <th className="p-3 text-xs font-semibold text-gray-600 uppercase text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sales.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="p-6 text-center text-gray-400">
                                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Aucune vente enregistrée</p>
                                </td>
                            </tr>
                        ) : (
                            sales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-3 text-sm text-gray-600">{sale.date} {sale.time}</td>
                                    <td className="p-3 font-medium text-gray-800">{sale.product}</td>
                                    <td className="p-3 text-center text-gray-700">{sale.quantity}</td>
                                    <td className="p-3 text-right text-gray-700">{formatCurrency(sale.amount)}</td>
                                    <td className="p-3 text-right text-red-500">{sale.expense > 0 ? `-${formatCurrency(sale.expense)}` : '-'}</td>
                                    <td className="p-3 text-right font-semibold text-green-600">{formatCurrency(sale.net)}</td>
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => onDeleteSale(sale.id)}
                                            className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                            title="Rembourser / Annuler cette vente"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
