import React, { useEffect, useState } from 'react';
import { Package, PlusCircle, AlertCircle, CheckCircle } from 'lucide-react';

export default function SaleForm({ stocks, onAddSale }) {
    const [newSale, setNewSale] = useState({ 
        productId: stocks[0]?.id || '', 
        quantity: '', 
        unitPrice: stocks[0]?.salePrice || '',
        expense: '' 
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Trouver le produit sélectionné
    const selectedProduct = stocks.find(s => s.id === Number(newSale.productId));
    const currentStock = selectedProduct?.remaining || 0;
    const totalAmount = Number(newSale.quantity || 0) * Number(newSale.unitPrice || 0);

    useEffect(() => {
        if (stocks[0] && !newSale.productId) {
            setNewSale((sale) => ({ ...sale, productId: stocks[0].id, unitPrice: stocks[0].salePrice || '' }));
        }
    }, [stocks, newSale.productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const quantity = Number(newSale.quantity);
        if (!quantity || quantity <= 0) {
            setErrorMessage('Veuillez entrer une quantité valide');
            setTimeout(() => setErrorMessage(''), 3000);
            return;
        }

        if (quantity > currentStock) {
            setErrorMessage(`Stock insuffisant ! Il reste ${currentStock} flacons`);
            setTimeout(() => setErrorMessage(''), 3000);
            return;
        }

        if (!newSale.unitPrice || Number(newSale.unitPrice) <= 0) {
            setErrorMessage('Veuillez entrer un prix unitaire valide');
            setTimeout(() => setErrorMessage(''), 3000);
            return;
        }

        // Soumettre la vente
        const result = await onAddSale({
            productId: Number(newSale.productId),
            quantity: newSale.quantity,
            amount: totalAmount,
            expense: newSale.expense || 0
        });

        if (result.success) {
            setSuccessMessage(`✅ Vente de ${quantity} flacon(s) enregistrée !`);
            setTimeout(() => setSuccessMessage(''), 3000);
            // Réinitialiser le formulaire
            setNewSale({ 
                productId: stocks[0]?.id || '', 
                quantity: '', 
                unitPrice: stocks[0]?.salePrice || '',
                expense: '' 
            });
        } else {
            setErrorMessage(result.error);
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* En-tête avec dégradé */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
                <div className="flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-white" />
                    <h2 className="text-lg font-semibold text-white">
                        Enregistrer une vente
                    </h2>
                </div>
            </div>

            <div className="p-6">
                {/* Messages */}
                {successMessage && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm animate-fade-in">
                        <CheckCircle className="w-4 h-4" />
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm animate-fade-in">
                        <AlertCircle className="w-4 h-4" />
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Stock restant */}
                    {selectedProduct && (
                        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-amber-600" />
                                <span className="text-sm font-medium text-amber-800">
                                    Stock disponible
                                </span>
                            </div>
                            <span className={`text-sm font-bold ${
                                currentStock <= 3 ? 'text-red-600' : 
                                currentStock <= 5 ? 'text-orange-600' : 
                                'text-green-600'
                            }`}>
                                {currentStock} flacons
                            </span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Gamme de parfum
                            </label>
                            <select 
                                value={newSale.productId}
                                onChange={(e) => {
                                    const product = stocks.find((stock) => stock.id === Number(e.target.value));
                                    setNewSale({...newSale, productId: e.target.value, unitPrice: product?.salePrice || ''});
                                }}
                                className="w-full border-gray-300 rounded-lg border p-2.5 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                            >
                                {stocks.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.product} ({s.remaining} restants)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Quantité vendue
                            </label>
                            <input 
                                type="number" 
                                min="1" 
                                max={currentStock}
                                placeholder="Ex: 2"
                                value={newSale.quantity}
                                onChange={(e) => setNewSale({...newSale, quantity: e.target.value})}
                                className="w-full border-gray-300 rounded-lg border p-2.5 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Prix unitaire appliqué (CFA)
                            </label>
                            <input 
                                type="number" 
                                placeholder="Prix normal ou prix réduit"
                                value={newSale.unitPrice}
                                onChange={(e) => setNewSale({...newSale, unitPrice: e.target.value})}
                                className="w-full border-gray-300 rounded-lg border p-2.5 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Prix total encaissé (CFA)
                            </label>
                            <div className="w-full border border-amber-200 bg-amber-50 rounded-lg p-2.5 font-semibold text-orange-700">
                                {totalAmount.toLocaleString('fr-FR')} CFA
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Dépenses / Transport (CFA)
                            </label>
                            <input 
                                type="number" 
                                placeholder="Ex: 200"
                                value={newSale.expense}
                                onChange={(e) => setNewSale({...newSale, expense: e.target.value})}
                                className="w-full border-gray-300 rounded-lg border p-2.5 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Valider la vente
                    </button>
                </form>
            </div>
        </section>
    );
}