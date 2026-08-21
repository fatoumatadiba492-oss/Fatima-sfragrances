import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardMetrics from './components/DashboardMetrics';
import SaleForm from './components/SaleForm';
import StockTable from './components/StockTable';
import SettingsView from './components/SettingsView';
import CreditSalesView from './components/CreditSalesView';
import ExpensesView from './components/ExpensesView';
const BACKEND_URL = (import.meta.env.VITE_API_URL || 'https://fdiba23.pythonanywhere.com').replace(/\/$/, '');
const API_URL = `${BACKEND_URL}/api`;
const apiFetch = (url, options = {}) => fetch(url, {
    ...options,
    headers: {
        ...(localStorage.getItem('fatima-auth-token') ? { Authorization: `Bearer ${localStorage.getItem('fatima-auth-token')}` } : {}),
        ...(options.headers || {})
    }
});

export default function App() {
    const [isAuthorized, setIsAuthorized] = useState(() => Boolean(localStorage.getItem('fatima-auth-token')));
    const [accessCode, setAccessCode] = useState('');
    const [accessError, setAccessError] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sales, setSales] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [credits, setCredits] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Charger les données
    const loadData = async () => {
        setLoading(true);
        try {
            // Charger les produits
            const productsRes = await apiFetch(`${API_URL}/products`);
            if (!productsRes.ok) throw new Error('Erreur chargement produits');
            const productsData = await productsRes.json();
            setStocks(productsData);

            // Charger les ventes
            const salesRes = await apiFetch(`${API_URL}/sales`);
            if (!salesRes.ok) throw new Error('Erreur chargement ventes');
            const salesData = await salesRes.json();
            setSales(salesData);

            const creditsRes = await apiFetch(`${API_URL}/credits`);
            if (!creditsRes.ok) throw new Error('Erreur chargement crédits');
            const creditsData = await creditsRes.json();
            setCredits(creditsData);

            const expensesRes = await apiFetch(`${API_URL}/expenses`);
            if (!expensesRes.ok) throw new Error('Erreur chargement dépenses');
            const expensesData = await expensesRes.json();
            setExpenses(expensesData);

            setError('');
        } catch (err) {
            setError(err.message);
            showNotification('Erreur de chargement: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCredit = async (newCredit) => {
        try {
            const response = await apiFetch(`${API_URL}/credits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_name: newCredit.customerName,
                    items: newCredit.items,
                    credit_date: newCredit.creditDate
                })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erreur lors de l’ajout du crédit');
            }
            const savedCredits = await response.json();
            setCredits([...savedCredits, ...credits]);
            const productsRes = await apiFetch(`${API_URL}/products`);
            setStocks(await productsRes.json());
            showNotification('✅ Crédit enregistré avec succès !', 'success');
            return { success: true };
        } catch (err) {
            showNotification('❌ ' + err.message, 'error');
            return { success: false, error: err.message };
        }
    };

    const handleDeleteCredit = async (id) => {
        if (!window.confirm('Supprimer ce crédit et restaurer le stock ?')) return;
        try {
            const response = await apiFetch(`${API_URL}/credits/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Erreur lors de la suppression du crédit');
            setCredits(credits.filter((credit) => credit.id !== id));
            const productsRes = await apiFetch(`${API_URL}/products`);
            setStocks(await productsRes.json());
            showNotification('✅ Crédit supprimé !', 'success');
        } catch (err) {
            showNotification('❌ ' + err.message, 'error');
        }
    };

    const handleAddExpense = async (newExpense) => {
        try {
            const response = await apiFetch(`${API_URL}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: newExpense.productId,
                    quantity: newExpense.quantity,
                    unit_price: newExpense.unitPrice,
                    expense_date: newExpense.expenseDate
                })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erreur lors de l’ajout de la dépense');
            }
            const savedExpense = await response.json();
            setExpenses([savedExpense, ...expenses]);
            const productsRes = await apiFetch(`${API_URL}/products`);
            setStocks(await productsRes.json());
            showNotification('✅ Dépense enregistrée !', 'success');
            return { success: true };
        } catch (err) {
            showNotification('❌ ' + err.message, 'error');
            return { success: false, error: err.message };
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm('Supprimer cette dépense ?')) return;
        try {
            const response = await apiFetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Erreur lors de la suppression de la dépense');
            setExpenses(expenses.filter((expense) => expense.id !== id));
            showNotification('✅ Dépense supprimée !', 'success');
        } catch (err) {
            showNotification('❌ ' + err.message, 'error');
        }
    };

    useEffect(() => {
        if (isAuthorized) loadData();
    }, [isAuthorized]);

    const handleAccessSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: accessCode })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Code incorrect.');
            localStorage.setItem('fatima-auth-token', result.token);
            setIsAuthorized(true);
            setAccessError('');
        } catch (error) {
            setAccessError(error.message);
            setAccessCode('');
        }
    };

    // Notifications
    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
    };

    // Ajouter une vente
    const handleAddSale = async (newSale) => {
        try {
            const response = await apiFetch(`${API_URL}/sales`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: newSale.productId,
                    quantity: Number(newSale.quantity),
                    amount: Number(newSale.amount),
                    expense: Number(newSale.expense || 0)
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erreur lors de la vente');
            }

            const savedSale = await response.json();
            setSales([savedSale, ...sales]);
            
            // Recharger les stocks
            const productsRes = await apiFetch(`${API_URL}/products`);
            const productsData = await productsRes.json();
            setStocks(productsData);

            showNotification('✅ Vente enregistrée avec succès !', 'success');
            return { success: true };

        } catch (err) {
            showNotification('❌ ' + err.message, 'error');
            return { success: false, error: err.message };
        }
    };

    // Ajouter un produit
    const handleAddProduct = async (newProduct) => {
        try {
            const response = await apiFetch(`${API_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newProduct.product,
                    initial_stock: Number(newProduct.initial),
                    purchase_price: Number(newProduct.purchasePrice),
                    sale_price: Number(newProduct.salePrice),
                    next_order_date: newProduct.nextOrder
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erreur lors de l\'ajout');
            }

            const savedProduct = await response.json();
            setStocks([...stocks, savedProduct]);
            showNotification('✅ Produit ajouté avec succès !', 'success');
            return { success: true };

        } catch (err) {
            showNotification('❌ ' + err.message, 'error');
            return { success: false, error: err.message };
        }
    };

    // Supprimer un produit
    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

        try {
            const response = await apiFetch(`${API_URL}/products/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erreur lors de la suppression');
            }

            setStocks(stocks.filter(item => item.id !== id));
            showNotification('✅ Produit supprimé avec succès !', 'success');
            return { success: true };

        } catch (err) {
            showNotification('❌ ' + err.message, 'error');
            return { success: false, error: err.message };
        }
    };

    // Mettre à jour un produit
    const handleUpdateProduct = async (id, updatedData) => {
        try {
            const response = await apiFetch(`${API_URL}/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: updatedData.product,
                    initial_stock: Number(updatedData.initial),
                    purchase_price: Number(updatedData.purchasePrice),
                    sale_price: Number(updatedData.salePrice),
                    next_order_date: updatedData.nextOrder
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erreur lors de la mise à jour');
            }

            const updated = await response.json();
            setStocks(stocks.map(item => 
                item.id === id ? updated : item
            ));
            showNotification('✅ Produit mis à jour avec succès !', 'success');
            return { success: true };

        } catch (err) {
            showNotification('❌ ' + err.message, 'error');
            return { success: false, error: err.message };
        }
    };

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 px-4">
                <form onSubmit={handleAccessSubmit} className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg border border-amber-100 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Accès privé</h1>
                    <p className="mt-2 text-sm text-gray-500">Entre ton code secret pour accéder au site.</p>
                    <input
                        type="password"
                        value={accessCode}
                        onChange={(event) => setAccessCode(event.target.value)}
                        placeholder="Code secret"
                        autoFocus
                        className="mt-6 w-full border-gray-300 rounded-lg border p-3 text-center focus:ring-2 focus:ring-amber-500"
                    />
                    {accessError && <p className="mt-3 text-sm text-red-600">{accessError}</p>}
                    <button type="submit" className="mt-5 w-full bg-amber-500 text-white font-semibold py-3 rounded-lg hover:bg-amber-600">
                        Entrer
                    </button>
                </form>
            </div>
        );
    }

    // Chargement
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Chargement des données...</p>
                </div>
            </div>
        );
    }

    // Erreur
    if (error && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50">
                <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-red-200 max-w-md">
                    <div className="text-6xl mb-4">🔌</div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Erreur de connexion</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <p className="text-sm text-gray-400 mb-4">
                        Vérifie que le backend est lancé :<br/>
                        <code className="bg-gray-100 px-2 py-1 rounded">python app.py</code>
                    </p>
                    <button 
                        onClick={loadData}
                        className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                    >
                        🔄 Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
            {/* Notification */}
            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md animate-slide-up ${
                    notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                } text-white`}>
                    {notification.message}
                </div>
            )}

            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <main className="max-w-7xl mx-auto px-4 py-6">
                {activeTab === 'dashboard' ? (
                    <div className="space-y-6">
                        <DashboardMetrics sales={sales} stocks={stocks} expenses={expenses} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <SaleForm stocks={stocks} onAddSale={handleAddSale} />
                            <StockTable stocks={stocks} />
                        </div>
                    </div>
                ) : activeTab === 'settings' ? (
                    <SettingsView 
                        stocks={stocks} 
                        setStocks={setStocks}
                        onAddProduct={handleAddProduct}
                        onDeleteProduct={handleDeleteProduct}
                        onUpdateProduct={handleUpdateProduct}
                    />
                ) : activeTab === 'credits' ? (
                    <CreditSalesView
                        stocks={stocks}
                        credits={credits}
                        onAddCredit={handleAddCredit}
                        onDeleteCredit={handleDeleteCredit}
                    />
                ) : (
                    <ExpensesView
                        stocks={stocks}
                        expenses={expenses}
                        onAddExpense={handleAddExpense}
                        onDeleteExpense={handleDeleteExpense}
                    />
                )}
            </main>
        </div>
    );
}
