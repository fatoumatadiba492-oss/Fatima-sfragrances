import { useState, useEffect } from 'react';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Trash2, Plus, AlertCircle } from 'lucide-react';

export default function CashView({ apiFetch, apiUrl }) {
    const [movements, setMovements] = useState([]);
    const [balance, setBalance] = useState(null);
    const [formData, setFormData] = useState({
        type: 'exit',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [error, setError] = useState('');

    const formatCurrency = (value) => new Intl.NumberFormat('fr-FR').format(Math.round(value)) + ' CFA';

    const loadData = async () => {
        const [movRes, balRes] = await Promise.all([
            apiFetch(`${apiUrl}/cash`),
            apiFetch(`${apiUrl}/cash/balance`)
        ]);
        if (movRes.ok) setMovements(await movRes.json());
        if (balRes.ok) setBalance(await balRes.json());
    };

    useEffect(() => { loadData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.amount || !formData.description || !formData.date) {
            setError('Tous les champs sont requis');
            return;
        }
        const res = await apiFetch(`${apiUrl}/cash`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            setFormData({ type: 'exit', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
            loadData();
        } else {
            const data = await res.json();
            setError(data.error || 'Erreur');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce mouvement ?')) return;
        const res = await apiFetch(`${apiUrl}/cash/${id}`, { method: 'DELETE' });
        if (res.ok) loadData();
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3">
                    <Wallet className="w-8 h-8" />
                    <div>
                        <h2 className="text-2xl font-bold">Gestion de Caisse</h2>
                        <p className="text-amber-100 mt-1">Suivi des entrées et sorties de trésorerie</p>
                    </div>
                </div>
            </div>

            {balance && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 font-medium">Ventes encaissées</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(balance.salesTotal)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 font-medium">Entrées de caisse</p>
                        <p className="text-lg font-bold text-blue-600">+{formatCurrency(balance.entries)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 font-medium">Sorties de caisse</p>
                        <p className="text-lg font-bold text-red-600">-{formatCurrency(balance.exits)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 font-medium">Réapprovisionnements</p>
                        <p className="text-lg font-bold text-orange-600">-{formatCurrency(balance.expensesTotal)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-amber-300">
                        <p className="text-xs text-amber-700 font-medium">Solde de caisse</p>
                        <p className={`text-xl font-bold ${balance.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {formatCurrency(balance.balance)}
                        </p>
                    </div>
                </div>
            )}

            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Plus className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-gray-700">Nouveau mouvement</h3>
                </div>
                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                                className="w-full border-gray-300 rounded-lg border p-2.5 focus:ring-2 focus:ring-amber-500"
                            >
                                <option value="exit">Sortie de caisse</option>
                                <option value="entry">Entrée de caisse</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Montant (CFA)</label>
                            <input
                                type="number"
                                min="1"
                                placeholder="Ex: 3500"
                                value={formData.amount}
                                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                className="w-full border-gray-300 rounded-lg border p-2.5 focus:ring-2 focus:ring-amber-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                            <input
                                type="text"
                                placeholder="Ex: Retrait personnel, Transport..."
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full border-gray-300 rounded-lg border p-2.5 focus:ring-2 focus:ring-amber-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                className="w-full border-gray-300 rounded-lg border p-2.5 focus:ring-2 focus:ring-amber-500"
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-semibold">
                        <Plus className="w-4 h-4" />
                        Enregistrer le mouvement
                    </button>
                </form>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-700">Historique des mouvements</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b-2 border-gray-200">
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase">Date</th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase">Type</th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase">Description</th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase text-right">Montant</th>
                                <th className="p-3 text-xs font-semibold text-gray-600 uppercase text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {movements.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Aucun mouvement enregistré</td></tr>
                            ) : (
                                movements.map((m) => (
                                    <tr key={m.id} className="hover:bg-gray-50">
                                        <td className="p-3 text-sm text-gray-600">{m.date}</td>
                                        <td className="p-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                m.type === 'entry' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {m.type === 'entry' ? <ArrowUpCircle className="w-3 h-3" /> : <ArrowDownCircle className="w-3 h-3" />}
                                                {m.type === 'entry' ? 'Entrée' : 'Sortie'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-800">{m.description}</td>
                                        <td className={`p-3 text-right font-semibold ${m.type === 'entry' ? 'text-green-600' : 'text-red-600'}`}>
                                            {m.type === 'entry' ? '+' : '-'}{formatCurrency(m.amount)}
                                        </td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => handleDelete(m.id)} className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600" title="Supprimer">
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
        </div>
    );
}
