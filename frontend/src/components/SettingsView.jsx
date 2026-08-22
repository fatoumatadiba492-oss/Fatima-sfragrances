import React, { useState } from 'react';
import { 
    Settings, Plus, Edit, Trash2, Save, X, 
    Package, TrendingUp, AlertCircle, CheckCircle
} from 'lucide-react';

export default function SettingsView({
    stocks,
    setStocks,
    onAddProduct,
    onDeleteProduct,
    onUpdateProduct,
    onResetAll
}) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        product: '',
        initial: '',
        purchasePrice: '',
        salePrice: '',
        nextOrder: ''
    });
    // Statistiques
    const totalProducts = stocks.length;
    const totalInitialStock = stocks.reduce((acc, curr) => acc + curr.initial, 0);
    const totalSold = stocks.reduce((acc, curr) => acc + curr.sold, 0);
    const totalRemaining = stocks.reduce((acc, curr) => acc + curr.remaining, 0);

    // Ajouter un produit
    const handleAddProductClick = async () => {
        if (!formData.product || !formData.initial || !formData.purchasePrice || !formData.salePrice || !formData.nextOrder) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        const result = await onAddProduct(formData);
        if (result.success) {
            setFormData({ product: '', initial: '', purchasePrice: '', salePrice: '', nextOrder: '' });
            setShowAddForm(false);
        }
    };

    // Supprimer un produit
    const handleDeleteProductClick = async (id) => {
        await onDeleteProduct(id);
    };

    // Modifier un produit
    const handleEditProductClick = (id) => {
        const product = stocks.find(item => item.id === id);
        setEditingId(id);
        setFormData({
            product: product.product,
            initial: product.initial,
            sold: product.sold || 0,
            purchasePrice: product.purchasePrice || '',
            salePrice: product.salePrice || '',
            nextOrder: product.nextOrder
        });
    };

    const handleSaveEditClick = async () => {
        const result = await onUpdateProduct(editingId, formData);
        if (result.success) {
            setEditingId(null);
            setFormData({ product: '', initial: '', purchasePrice: '', salePrice: '', nextOrder: '' });
        }
    };

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3">
                    <Settings className="w-8 h-8" />
                    <div>
                        <h2 className="text-2xl font-bold">Paramètres & Gestion</h2>
                        <p className="text-amber-100 mt-1">
                            Gérez vos produits, votre capital et vos réapprovisionnements
                        </p>
                    </div>
                </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <Package className="w-5 h-5 text-amber-500 mb-2" />
                    <p className="text-xs text-gray-500 font-medium">Total Produits</p>
                    <p className="text-xl font-bold text-gray-800">{totalProducts}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <TrendingUp className="w-5 h-5 text-blue-500 mb-2" />
                    <p className="text-xs text-gray-500 font-medium">Stock Initial</p>
                    <p className="text-xl font-bold text-gray-800">{totalInitialStock}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <AlertCircle className="w-5 h-5 text-red-500 mb-2" />
                    <p className="text-xs text-gray-500 font-medium">Vendus</p>
                    <p className="text-xl font-bold text-red-600">{totalSold}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <CheckCircle className="w-5 h-5 text-green-500 mb-2" />
                    <p className="text-xs text-gray-500 font-medium">Restants</p>
                    <p className="text-xl font-bold text-green-600">{totalRemaining}</p>
                </div>
            </div>

            {/* Gestion des produits */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-amber-500" />
                        <h3 className="font-semibold text-gray-700">Gestion des produits</h3>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">
                            {totalProducts} produits
                        </span>
                    </div>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Ajouter un produit
                    </button>
                </div>

                {/* Formulaire d'ajout */}
                {showAddForm && (
                    <div className="px-6 py-4 bg-amber-50 border-b border-amber-200">
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                            <input
                                type="text"
                                placeholder="Nom du parfum"
                                value={formData.product}
                                onChange={(e) => setFormData({...formData, product: e.target.value})}
                                className="border-gray-300 rounded-lg border p-2.5 focus:ring-2 focus:ring-amber-500"
                            />
                            <input
                                type="number"
                                placeholder="Stock initial"
                                value={formData.initial}
                                onChange={(e) => setFormData({...formData, initial: e.target.value})}
                                className="border-gray-300 rounded-lg border p-2.5 focus:ring-2 focus:ring-amber-500"
                            />
                            <input
                                type="number"
                                min="0"
                                placeholder="Prix achat unitaire"
                                value={formData.purchasePrice}
                                onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                                className="border-gray-300 rounded-lg border p-2.5 focus:ring-2 focus:ring-amber-500"
                            />
                            <input
                                type="number"
                                min="0"
                                placeholder="Prix vente unitaire"
                                value={formData.salePrice}
                                onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
                                className="border-gray-300 rounded-lg border p-2.5 focus:ring-2 focus:ring-amber-500"
                            />
                            <input
                                type="date"
                                value={formData.nextOrder}
                                onChange={(e) => setFormData({...formData, nextOrder: e.target.value})}
                                className="border-gray-300 rounded-lg border p-2.5 focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={handleAddProductClick}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Ajouter
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setFormData({ product: '', initial: '', purchasePrice: '', salePrice: '', nextOrder: '' });
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                )}

                {/* Liste des produits */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Produit</th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Initial</th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Prix achat</th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Prix vente</th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Capital stock</th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">CA potentiel</th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Vendus</th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Restant</th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Commande</th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stocks.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    {editingId === item.id ? (
                                        // Mode édition
                                        <>
                                            <td className="p-3">
                                                <input
                                                    type="text"
                                                    value={formData.product}
                                                    onChange={(e) => setFormData({...formData, product: e.target.value})}
                                                    className="w-full border-gray-300 rounded border p-1.5"
                                                />
                                            </td>
                                            <td className="p-3 text-center">
                                                <input
                                                    type="number"
                                                    value={formData.initial}
                                                    onChange={(e) => setFormData({...formData, initial: e.target.value})}
                                                    className="w-20 border-gray-300 rounded border p-1.5 text-center"
                                                />
                                            </td>
                                            <td className="p-3 text-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={formData.purchasePrice}
                                                    onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                                                    className="w-24 border-gray-300 rounded border p-1.5 text-center"
                                                />
                                            </td>
                                            <td className="p-3 text-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={formData.salePrice}
                                                    onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
                                                    className="w-24 border-gray-300 rounded border p-1.5 text-center"
                                                />
                                            </td>
                                            <td className="p-3 text-center text-gray-400">Calculé</td>
                                            <td className="p-3 text-center text-gray-400">Calculé</td>
                                            <td className="p-3 text-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={formData.sold}
                                                    onChange={(e) => setFormData({...formData, sold: e.target.value})}
                                                    className="w-16 border-gray-300 rounded border p-1.5 text-center"
                                                />
                                            </td>
                                            <td className="p-3 text-center font-bold text-blue-600">
                                                {Number(formData.initial || 0) - Number(formData.sold || 0)}
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="date"
                                                    value={formData.nextOrder}
                                                    onChange={(e) => setFormData({...formData, nextOrder: e.target.value})}
                                                    className="w-full border-gray-300 rounded border p-1.5"
                                                />
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={handleSaveEditClick}
                                                        className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(null);
                                                            setFormData({ product: '', initial: '', purchasePrice: '', salePrice: '', nextOrder: '' });
                                                        }}
                                                        className="p-1.5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        // Mode affichage
                                        <>
                                            <td className="p-3 font-medium">{item.product}</td>
                                            <td className="p-3 text-center text-gray-600">{item.initial}</td>
                                            <td className="p-3 text-center text-gray-600">{item.purchasePrice || 0} CFA</td>
                                            <td className="p-3 text-center text-gray-600">{item.salePrice || 0} CFA</td>
                                            <td className="p-3 text-center text-amber-700 font-semibold">{(item.purchaseTotal || 0).toLocaleString('fr-FR')} CFA</td>
                                            <td className="p-3 text-center text-green-700 font-semibold">{(item.potentialCA || 0).toLocaleString('fr-FR')} CFA</td>
                                            <td className="p-3 text-center text-red-500 font-semibold">{item.sold}</td>
                                            <td className={`p-3 text-center font-bold ${
                                                item.remaining <= 3 ? 'text-red-600' : 
                                                item.remaining <= 6 ? 'text-orange-600' : 
                                                'text-green-600'
                                            }`}>
                                                {item.remaining}
                                            </td>
                                            <td className="p-3 text-gray-500 text-sm">{item.nextOrder}</td>
                                            <td className="p-3 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEditProductClick(item.id)}
                                                        className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProductClick(item.id)}
                                                        className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            {stocks.length === 0 && (
                                <tr>
                                    <td colSpan="10" className="p-6 text-center text-gray-400">
                                        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Aucun produit enregistré</p>
                                        <p className="text-sm">Cliquez sur "Ajouter un produit" pour commencer</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Zone dangereuse - Reset */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-red-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-red-100 bg-red-50">
                    <h3 className="font-semibold text-red-700">Zone dangereuse</h3>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                        Supprimer <strong>toutes</strong> les données : ventes, crédits, réapprovisionnements, mouvements de caisse et produits. Cette action est irréversible.
                    </p>
                    <button
                        onClick={onResetAll}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                    >
                        Réinitialiser toutes les données
                    </button>
                </div>
            </div>
        </div>
    );
}