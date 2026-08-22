import { useState } from 'react';
import { CreditCard, Plus, Trash2, AlertCircle, X, CheckCircle } from 'lucide-react';

const newItem = { productId: '', quantity: '', unitPrice: '' };
const initialForm = {
    customerName: '',
    creditDate: new Date().toISOString().split('T')[0],
    items: [{ ...newItem }]
};

export default function CreditSalesView({ stocks, credits, onAddCredit, onDeleteCredit, onPayCredit }) {
    const [formData, setFormData] = useState(initialForm);
    const [errorMessage, setErrorMessage] = useState('');

    const formatCurrency = (value) => `${Number(value || 0).toLocaleString('fr-FR')} CFA`;
    const totalAmount = formData.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);

    const updateItem = (index, changes) => {
        setFormData((current) => ({
            ...current,
            items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...changes } : item)
        }));
    };

    const handleProductChange = (index, productId) => {
        const product = stocks.find((stock) => stock.id === Number(productId));
        updateItem(index, { productId, unitPrice: product?.salePrice || '' });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        if (!formData.customerName || !formData.creditDate || formData.items.some((item) => !item.productId || !item.quantity || !item.unitPrice)) {
            setErrorMessage('Veuillez renseigner le client, la date et tous les produits.');
            return;
        }
        for (const item of formData.items) {
            const product = stocks.find((stock) => stock.id === Number(item.productId));
            if (Number(item.quantity) <= 0 || Number(item.unitPrice) < 0) {
                setErrorMessage('Quantité ou prix invalide.');
                return;
            }
            if (product && Number(item.quantity) > product.remaining) {
                setErrorMessage(`Stock insuffisant pour ${product.product} : il reste ${product.remaining} unité(s).`);
                return;
            }
        }

        const result = await onAddCredit({
            customerName: formData.customerName,
            creditDate: formData.creditDate,
            items: formData.items.map((item) => ({
                product_id: Number(item.productId),
                quantity: Number(item.quantity),
                unit_price: Number(item.unitPrice)
            }))
        });
        if (result.success) setFormData(initialForm);
        else setErrorMessage(result.error);
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3">
                    <CreditCard className="w-8 h-8" />
                    <div>
                        <h2 className="text-2xl font-bold">Ventes à crédit</h2>
                        <p className="text-amber-100 mt-1">Un client peut prendre plusieurs produits sur le même crédit</p>
                    </div>
                </div>
            </div>

            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4"><Plus className="w-5 h-5 text-amber-500" /><h3 className="font-semibold text-gray-700">Nouveau crédit client</h3></div>
                {errorMessage && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm"><AlertCircle className="w-4 h-4" />{errorMessage}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input type="text" placeholder="Nom du client" value={formData.customerName} onChange={(event) => setFormData({ ...formData, customerName: event.target.value })} className="border-gray-300 rounded-lg border p-2.5 focus:ring-2 focus:ring-amber-500" />
                        <input type="date" value={formData.creditDate} onChange={(event) => setFormData({ ...formData, creditDate: event.target.value })} className="border-gray-300 rounded-lg border p-2.5 focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div className="space-y-3">
                        {formData.items.map((item, index) => {
                            const lineTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
                            return <div key={index} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center bg-amber-50 p-3 rounded-lg border border-amber-100">
                                <select value={item.productId} onChange={(event) => handleProductChange(index, event.target.value)} className="border-gray-300 rounded-lg border p-2.5 focus:ring-2 focus:ring-amber-500">
                                    <option value="">Choisir un produit</option>
                                    {stocks.filter(stock => stock.remaining > 0).map((stock) => <option key={stock.id} value={stock.id}>{stock.product} ({stock.remaining} restant(s))</option>)}
                                </select>
                                <input type="number" min="1" placeholder="Quantité" value={item.quantity} onChange={(event) => updateItem(index, { quantity: event.target.value })} className="border-gray-300 rounded-lg border p-2.5 focus:ring-2 focus:ring-amber-500" />
                                <input type="number" min="0" placeholder="Prix unitaire" value={item.unitPrice} onChange={(event) => updateItem(index, { unitPrice: event.target.value })} className="border-gray-300 rounded-lg border p-2.5 focus:ring-2 focus:ring-amber-500" />
                                <div className="font-semibold text-orange-700">Total : {formatCurrency(lineTotal)}</div>
                                <button type="button" onClick={() => setFormData({ ...formData, items: formData.items.filter((_, itemIndex) => itemIndex !== index) })} disabled={formData.items.length === 1} className="justify-self-end p-2 text-red-500 hover:bg-red-100 rounded-lg disabled:opacity-30" title="Retirer le produit"><X className="w-4 h-4" /></button>
                            </div>;
                        })}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <button type="button" onClick={() => setFormData({ ...formData, items: [...formData.items, { ...newItem }] })} className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"><Plus className="w-4 h-4" />Ajouter un produit</button>
                        <div className="font-bold text-orange-700">Total du crédit : {formatCurrency(totalAmount)}</div>
                    </div>
                    <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600"><CreditCard className="w-4 h-4" />Enregistrer le crédit</button>
                </form>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"><h3 className="font-semibold text-gray-700">Clients à crédit</h3><span className="text-sm font-semibold text-orange-700">Total à recouvrer : {formatCurrency(credits.reduce((sum, credit) => sum + credit.totalAmount, 0))}</span></div>
                <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead><tr className="bg-gray-50 border-b border-gray-200"><th className="p-3 text-xs font-semibold text-gray-600 uppercase">Client</th><th className="p-3 text-xs font-semibold text-gray-600 uppercase">Produit</th><th className="p-3 text-xs font-semibold text-gray-600 uppercase text-center">Quantité</th><th className="p-3 text-xs font-semibold text-gray-600 uppercase text-center">Prix unitaire</th><th className="p-3 text-xs font-semibold text-gray-600 uppercase text-center">Prix total</th><th className="p-3 text-xs font-semibold text-gray-600 uppercase">Date</th><th className="p-3 text-xs font-semibold text-gray-600 uppercase text-center">Action</th></tr></thead><tbody className="divide-y divide-gray-100">
                    {credits.map((credit) => <tr key={credit.id} className="hover:bg-gray-50"><td className="p-3 font-medium text-gray-800">{credit.customerName}</td><td className="p-3 text-gray-600">{credit.product}</td><td className="p-3 text-center">{credit.quantity}</td><td className="p-3 text-center">{formatCurrency(credit.unitPrice)}</td><td className="p-3 text-center font-semibold text-orange-700">{formatCurrency(credit.totalAmount)}</td><td className="p-3 text-gray-500">{credit.date}</td><td className="p-3 text-center"><div className="flex justify-center gap-2"><button onClick={() => onPayCredit(credit.id)} className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600" title="Marquer comme payé"><CheckCircle className="w-4 h-4" /></button><button onClick={() => onDeleteCredit(credit.id)} className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600" title="Supprimer le crédit"><Trash2 className="w-4 h-4" /></button></div></td></tr>)}
                    {credits.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-gray-400">Aucun crédit enregistré</td></tr>}
                </tbody></table></div>
            </section>
        </div>
    );
}
