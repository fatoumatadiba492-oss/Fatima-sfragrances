import React, { useState } from 'react';
import { Calendar, DollarSign, Plus, Receipt, Trash2 } from 'lucide-react';

const emptyRestock = {
    productId: '',
    quantity: '',
    unitPrice: '',
    expenseDate: new Date().toISOString().split('T')[0]
};

export default function ExpensesView({ stocks, expenses, onAddExpense, onDeleteExpense }) {
    const [formData, setFormData] = useState(emptyRestock);
    const [errorMessage, setErrorMessage] = useState('');
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalAmount = Number(formData.quantity || 0) * Number(formData.unitPrice || 0);

    const formatCurrency = (value) => `${Number(value || 0).toLocaleString('fr-FR')} CFA`;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        if (!formData.productId || !formData.quantity || !formData.unitPrice || !formData.expenseDate) {
            setErrorMessage('Veuillez renseigner le produit, la quantité, le prix unitaire et la date.');
            return;
        }
        const result = await onAddExpense({
            productId: Number(formData.productId),
            quantity: Number(formData.quantity),
            unitPrice: Number(formData.unitPrice),
            expenseDate: formData.expenseDate
        });
        if (result.success) setFormData(emptyRestock);
        else setErrorMessage(result.error);
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3">
                    <Receipt className="w-8 h-8" />
                    <div>
                        <h2 className="text-2xl font-bold">Réapprovisionnement</h2>
                        <p className="text-amber-100 mt-1">Enregistrez les achats de produits pour augmenter le stock</p>
                    </div>
                </div>
            </div>

            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Plus className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-gray-700">Ajouter un réapprovisionnement</h3>
                </div>
                {errorMessage && <p className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{errorMessage}</p>}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <select value={formData.productId} onChange={(event) => {
                        const product = stocks.find((stock) => stock.id === Number(event.target.value));
                        setFormData({ ...formData, productId: event.target.value, unitPrice: product?.purchasePrice || '' });
                    }} className="border-gray-300 rounded-lg border p-2.5 focus:ring-2 focus:ring-amber-500">
                        <option value="">Choisir un produit</option>
                        {stocks.map((stock) => <option key={stock.id} value={stock.id}>{stock.product}</option>)}
                    </select>
                    <input type="number" min="1" placeholder="Quantité ajoutée" value={formData.quantity} onChange={(event) => setFormData({ ...formData, quantity: event.target.value })} className="border-gray-300 rounded-lg border p-2.5 focus:ring-2 focus:ring-amber-500" />
                    <input type="number" min="0" placeholder="Prix achat unitaire (CFA)" value={formData.unitPrice} onChange={(event) => setFormData({ ...formData, unitPrice: event.target.value })} className="border-gray-300 rounded-lg border p-2.5 focus:ring-2 focus:ring-amber-500" />
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 font-semibold text-orange-700">Total : {formatCurrency(totalAmount)}</div>
                    <input type="date" value={formData.expenseDate} onChange={(event) => setFormData({ ...formData, expenseDate: event.target.value })} className="border-gray-300 rounded-lg border p-2.5 focus:ring-2 focus:ring-amber-500" />
                    <button type="submit" className="sm:col-span-2 lg:col-span-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                        <DollarSign className="w-4 h-4" /> Enregistrer le réapprovisionnement
                    </button>
                </form>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700">Historique des réapprovisionnements</h3>
                    <span className="text-sm font-semibold text-orange-700">Total : {formatCurrency(totalExpenses)}</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead><tr className="bg-gray-50 border-b border-gray-200">
                            <th className="p-3 text-xs font-semibold text-gray-600 uppercase">Produit</th>
                            <th className="p-3 text-xs font-semibold text-gray-600 uppercase text-center">Quantité</th>
                            <th className="p-3 text-xs font-semibold text-gray-600 uppercase text-center">Prix unitaire</th>
                            <th className="p-3 text-xs font-semibold text-gray-600 uppercase text-center">Total</th>
                            <th className="p-3 text-xs font-semibold text-gray-600 uppercase">Date</th>
                            <th className="p-3 text-xs font-semibold text-gray-600 uppercase text-center">Action</th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            {expenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-gray-50">
                                    <td className="p-3 font-medium text-gray-800">{expense.product}</td>
                                    <td className="p-3 text-center">{expense.quantity}</td>
                                    <td className="p-3 text-center">{formatCurrency(expense.unitPrice)}</td>
                                    <td className="p-3 text-center font-semibold text-red-600">{formatCurrency(expense.totalAmount)}</td>
                                    <td className="p-3 text-gray-500">{expense.date}</td>
                                    <td className="p-3 text-center"><button onClick={() => onDeleteExpense(expense.id)} className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600" title="Supprimer le réapprovisionnement"><Trash2 className="w-4 h-4" /></button></td>
                                </tr>
                            ))}
                            {expenses.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-gray-400"><Calendar className="w-8 h-8 mx-auto mb-2" />Aucun réapprovisionnement enregistré</td></tr>}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
