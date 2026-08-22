import { useState } from 'react';
import { ShoppingBag, Trash2, Edit, Save, X, Package } from 'lucide-react';

export default function SalesHistoryView({ sales, stocks, onDeleteSale, onUpdateSale }) {
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ quantity: '', amount: '', expense: '' });

    const formatCurrency = (value) => new Intl.NumberFormat('fr-FR').format(value) + ' CFA';

    const startEdit = (sale) => {
        const product = stocks.find(s => s.product === sale.product);
        const unitPrice = product?.salePrice || (sale.quantity > 0 ? sale.amount / sale.quantity : 0);
        setEditingId(sale.id);
        setEditData({
            quantity: sale.quantity,
            unitPrice,
            amount: Math.round(sale.quantity * unitPrice),
            expense: sale.expense || 0
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({ quantity: '', unitPrice: 0, amount: '', expense: '' });
    };

    const submitEdit = async (id) => {
        const result = await onUpdateSale(id, {
            quantity: Number(editData.quantity),
            amount: Number(editData.amount),
            expense: Number(editData.expense || 0)
        });
        if (result.success) {
            setEditingId(null);
        }
    };

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
                            <th className="p-3 text-xs font-semibold text-gray-600 uppercase text-center">Actions</th>
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
                                    {editingId === sale.id ? (
                                        <>
                                            <td className="p-3 text-center">
                                                {(() => {
                                                    const product = stocks.find(s => s.product === sale.product);
                                                    const maxQty = sale.quantity + (product?.remaining || 0);
                                                    return (
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={maxQty}
                                                            value={editData.quantity}
                                                            onChange={(e) => {
                                                                const val = Math.min(Number(e.target.value) || 0, maxQty);
                                                                const qty = val > 0 ? val : Number(e.target.value) || 0;
                                                                setEditData(prev => ({
                                                                    ...prev,
                                                                    quantity: val > 0 ? val : e.target.value,
                                                                    amount: Math.round(qty * prev.unitPrice)
                                                                }));
                                                            }}
                                                            className="w-16 border border-amber-400 rounded px-2 py-1 text-center bg-amber-50"
                                                        />
                                                    );
                                                })()}
                                            </td>
                                            <td className="p-3 text-right font-semibold text-gray-700">
                                                {formatCurrency(editData.amount)}
                                                <div className="text-xs text-gray-400">{formatCurrency(editData.unitPrice)}/unité</div>
                                            </td>
                                            <td className="p-3 text-right">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={editData.expense}
                                                    onChange={(e) => setEditData(prev => ({...prev, expense: e.target.value}))}
                                                    className="w-20 border border-gray-300 rounded px-2 py-1 text-right"
                                                />
                                            </td>
                                            <td className="p-3 text-right font-semibold text-green-600">
                                                {formatCurrency(Number(editData.amount || 0) - Number(editData.expense || 0))}
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => submitEdit(sale.id)}
                                                        className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                                        title="Enregistrer"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="p-1.5 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
                                                        title="Annuler"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="p-3 text-center text-gray-700">{sale.quantity}</td>
                                            <td className="p-3 text-right text-gray-700">{formatCurrency(sale.amount)}</td>
                                            <td className="p-3 text-right text-red-500">{sale.expense > 0 ? `-${formatCurrency(sale.expense)}` : '-'}</td>
                                            <td className="p-3 text-right font-semibold text-green-600">{formatCurrency(sale.net)}</td>
                                            <td className="p-3 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => startEdit(sale)}
                                                        className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                        title="Modifier cette vente"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onDeleteSale(sale.id)}
                                                        className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                        title="Rembourser / Annuler cette vente"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
