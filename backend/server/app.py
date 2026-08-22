from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
from models import db, Product, Sale, CreditSale, Expense, Settings
from datetime import datetime, date
import os
from sqlalchemy import inspect, text
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

# Création de l'application
app = Flask(__name__)
app.config.from_object(Config)

# Initialisation des extensions
CORS(
    app,
    resources={r'/api/*': {'origins': '*'}},
    allow_headers=['Content-Type', 'Authorization'],
    methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
)
db.init_app(app)
token_serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])

# Création des tables
with app.app_context():
    db.create_all()

    # Ajouter les prix aux bases SQLite existantes.
    product_columns = {column['name'] for column in inspect(db.engine).get_columns('products')}
    for column_name in ('purchase_price', 'sale_price'):
        if column_name not in product_columns:
            db.session.execute(text(
                f'ALTER TABLE products ADD COLUMN {column_name} FLOAT NOT NULL DEFAULT 0'
            ))
    expense_columns = {column['name'] for column in inspect(db.engine).get_columns('expenses')}
    for column_name, column_type in (
        ('product_id', 'INTEGER'),
        ('quantity', 'INTEGER'),
        ('unit_price', 'FLOAT')
    ):
        if column_name not in expense_columns:
            db.session.execute(text(
                f'ALTER TABLE expenses ADD COLUMN {column_name} {column_type}'
            ))
    db.session.commit()
    
    # Ajouter des paramètres par défaut si vide
    if not Settings.query.first():
        default_settings = [
            Settings(key='start_capital', value='100000', description='Capital de départ en CFA'),
            Settings(key='profit_margin', value='30', description='Marge bénéficiaire en %'),
            Settings(key='business_name', value='Fatima\'s Fragrance', description='Nom de l\'entreprise')
        ]
        db.session.add_all(default_settings)
        db.session.commit()

# ==================== ROUTES ====================

@app.route('/', methods=['GET'])
def home():
    """Page d'accueil publique du backend"""
    return jsonify({
        'status': 'ok',
        'message': 'Backend Fatima\'s Fragrance opérationnel',
        'api': '/api/health'
    }), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérification de l'état du serveur"""
    return jsonify({'status': 'ok', 'message': 'Backend opérationnel'}), 200

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    if not app.config['ADMIN_PASSWORD']:
        return jsonify({'error': 'ADMIN_PASSWORD non configuré sur le backend'}), 500
    if data.get('password') != app.config['ADMIN_PASSWORD']:
        return jsonify({'error': 'Code incorrect'}), 401
    return jsonify({'token': token_serializer.dumps({'authenticated': True})}), 200

@app.before_request
def protect_api_routes():
    """Protège les données métier avec un jeton signé par le backend."""
    if request.method == 'OPTIONS':
        return
    if request.path.startswith('/api/') and request.path not in ('/api/health', '/api/auth/login'):
        authorization = request.headers.get('Authorization', '')
        if not authorization.startswith('Bearer '):
            return jsonify({'error': 'Accès non autorisé'}), 401
        try:
            token_serializer.loads(authorization[7:], max_age=86400)
        except (BadSignature, SignatureExpired):
            return jsonify({'error': 'Session expirée ou invalide'}), 401

# ---------- ROUTES PRODUITS ----------

@app.route('/api/products', methods=['GET'])
def get_products():
    """Récupérer tous les produits"""
    products = Product.query.all()
    return jsonify([p.to_dict() for p in products]), 200

@app.route('/api/products', methods=['POST'])
def create_product():
    """Créer un nouveau produit"""
    data = request.get_json()
    
    # Validation
    if not data.get('name') or not data.get('initial_stock'):
        return jsonify({'error': 'Nom et stock initial requis'}), 400
    if data.get('purchase_price') is None or data.get('sale_price') is None:
        return jsonify({'error': "Prix d'achat et prix de vente requis"}), 400
    
    # Vérifier si le produit existe déjà
    existing = Product.query.filter_by(name=data['name']).first()
    if existing:
        return jsonify({'error': 'Ce produit existe déjà'}), 400
    
    product = Product(
        name=data['name'],
        initial_stock=int(data['initial_stock']),
        purchase_price=float(data['purchase_price']),
        sale_price=float(data['sale_price']),
        remaining_stock=int(data['initial_stock']),
        sold=0,
        next_order_date=datetime.strptime(data.get('next_order_date', date.today().isoformat()), '%Y-%m-%d').date()
    )
    
    db.session.add(product)
    db.session.commit()
    
    return jsonify(product.to_dict()), 201

@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    """Mettre à jour un produit"""
    product = Product.query.get_or_404(product_id)
    data = request.get_json()
    
    if 'name' in data:
        product.name = data['name']
    if 'sold' in data:
        product.sold = int(data['sold'])
    if 'initial_stock' in data:
        product.initial_stock = int(data['initial_stock'])
        product.remaining_stock = product.initial_stock - product.sold
    if 'purchase_price' in data:
        product.purchase_price = float(data['purchase_price'])
    if 'sale_price' in data:
        product.sale_price = float(data['sale_price'])
    if 'next_order_date' in data:
        product.next_order_date = datetime.strptime(data['next_order_date'], '%Y-%m-%d').date()

    db.session.commit()
    return jsonify(product.to_dict()), 200

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Supprimer un produit et ses données associées"""
    product = Product.query.get_or_404(product_id)
    purchase_total = product.initial_stock * product.purchase_price
    Sale.query.filter_by(product_id=product_id).delete()
    CreditSale.query.filter_by(product_id=product_id).delete()
    Expense.query.filter_by(product_id=product_id).delete()
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Produit supprimé', 'purchaseTotal': purchase_total}), 200

# ---------- ROUTES VENTES ----------

@app.route('/api/sales', methods=['GET'])
def get_sales():
    """Récupérer toutes les ventes"""
    sales = Sale.query.order_by(Sale.sale_date.desc()).all()
    return jsonify([s.to_dict() for s in sales]), 200

@app.route('/api/sales', methods=['POST'])
def create_sale():
    """Enregistrer une nouvelle vente"""
    data = request.get_json()
    
    # Validation
    required = ['product_id', 'quantity', 'amount']
    if not all(k in data for k in required):
        return jsonify({'error': 'Champs requis manquants'}), 400
    
    # Vérifier le produit
    product = Product.query.get(data['product_id'])
    if not product:
        return jsonify({'error': 'Produit non trouvé'}), 404
    
    # Vérifier le stock
    quantity = int(data['quantity'])
    if quantity > product.remaining_stock:
        return jsonify({'error': f'Stock insuffisant. Restant: {product.remaining_stock}'}), 400
    
    # Créer la vente
    amount = float(data['amount'])
    expense = float(data.get('expense', 0))
    net_amount = amount - expense
    
    sale = Sale(
        product_id=product.id,
        quantity=quantity,
        amount=amount,
        expense=expense,
        net_amount=net_amount
    )
    
    # Mettre à jour le stock
    product.sold += quantity
    product.remaining_stock -= quantity
    
    db.session.add(sale)
    db.session.commit()
    
    return jsonify(sale.to_dict()), 201

@app.route('/api/sales/<int:sale_id>', methods=['DELETE'])
def delete_sale(sale_id):
    """Supprimer une vente (annuler)"""
    sale = Sale.query.get_or_404(sale_id)
    
    # Restaurer le stock
    product = Product.query.get(sale.product_id)
    if product:
        product.sold -= sale.quantity
        product.remaining_stock += sale.quantity
    
    db.session.delete(sale)
    db.session.commit()
    
    return jsonify({'message': 'Vente annulée'}), 200

@app.route('/api/sales/<int:sale_id>', methods=['PUT'])
def update_sale(sale_id):
    """Modifier une vente (quantité, montant)"""
    sale = Sale.query.get_or_404(sale_id)
    data = request.get_json() or {}
    product = Product.query.get(sale.product_id)

    new_quantity = int(data.get('quantity', sale.quantity))
    new_amount = float(data.get('amount', sale.amount))
    new_expense = float(data.get('expense', sale.expense))

    diff = sale.quantity - new_quantity
    if product:
        if diff < 0 and abs(diff) > product.remaining_stock:
            return jsonify({'error': f'Stock insuffisant. Restant: {product.remaining_stock}'}), 400
        product.remaining_stock += diff
        product.sold -= diff

    sale.quantity = new_quantity
    sale.amount = new_amount
    sale.expense = new_expense
    sale.net_amount = new_amount - new_expense

    db.session.commit()
    return jsonify(sale.to_dict()), 200

# ---------- ROUTES VENTES À CRÉDIT ----------

@app.route('/api/credits', methods=['GET'])
def get_credits():
    credits = CreditSale.query.order_by(CreditSale.credit_date.desc(), CreditSale.id.desc()).all()
    return jsonify([credit.to_dict() for credit in credits]), 200

@app.route('/api/credits', methods=['POST'])
def create_credit():
    data = request.get_json() or {}
    customer_name = str(data.get('customer_name', '')).strip()
    credit_date = data.get('credit_date')
    items = data.get('items')
    if not items and data.get('product_id'):
        items = [{
            'product_id': data.get('product_id'),
            'quantity': data.get('quantity'),
            'unit_price': data.get('unit_price')
        }]
    if not customer_name or not credit_date or not items:
        return jsonify({'error': 'Client, date et au moins un produit requis'}), 400

    parsed_items = []
    quantities_by_product = {}
    for item in items:
        product = Product.query.get(item.get('product_id'))
        quantity = int(item.get('quantity', 0))
        unit_price = float(item.get('unit_price', -1))
        if not product:
            return jsonify({'error': 'Produit non trouvé'}), 404
        if quantity <= 0 or unit_price < 0:
            return jsonify({'error': 'Quantité ou prix invalide'}), 400
        quantities_by_product[product.id] = quantities_by_product.get(product.id, 0) + quantity
        parsed_items.append((product, quantity, unit_price))

    for product, quantity in ((Product.query.get(product_id), quantity) for product_id, quantity in quantities_by_product.items()):
        if quantity > product.remaining_stock:
            return jsonify({'error': f'Stock insuffisant pour {product.name}. Restant: {product.remaining_stock}'}), 400

    saved_credits = []
    credit_day = datetime.strptime(credit_date, '%Y-%m-%d').date()
    for product, quantity, unit_price in parsed_items:
        credit = CreditSale(
            product_id=product.id,
            customer_name=customer_name,
            quantity=quantity,
            unit_price=unit_price,
            total_amount=quantity * unit_price,
            credit_date=credit_day
        )
        product.sold += quantity
        product.remaining_stock -= quantity
        db.session.add(credit)
        saved_credits.append(credit)
    db.session.commit()
    return jsonify([credit.to_dict() for credit in saved_credits]), 201

@app.route('/api/credits/<int:credit_id>', methods=['DELETE'])
def delete_credit(credit_id):
    credit = CreditSale.query.get_or_404(credit_id)
    product = Product.query.get(credit.product_id)
    if product:
        product.sold -= credit.quantity
        product.remaining_stock += credit.quantity
    db.session.delete(credit)
    db.session.commit()
    return jsonify({'message': 'Crédit supprimé et stock restauré'}), 200

# ---------- ROUTES DÉPENSES ----------

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    expenses = Expense.query.order_by(Expense.expense_date.desc(), Expense.id.desc()).all()
    return jsonify([expense.to_dict() for expense in expenses]), 200

@app.route('/api/expenses', methods=['POST'])
def create_expense():
    data = request.get_json() or {}
    required = ('product_id', 'quantity', 'unit_price', 'expense_date')
    if any(data.get(field) in (None, '') for field in required):
        return jsonify({'error': 'Produit, quantité, prix unitaire et date requis'}), 400
    product = Product.query.get(data['product_id'])
    if not product:
        return jsonify({'error': 'Produit non trouvé'}), 404
    quantity = int(data['quantity'])
    unit_price = float(data['unit_price'])
    if quantity <= 0 or unit_price <= 0:
        return jsonify({'error': 'Quantité ou prix unitaire invalide'}), 400
    amount = quantity * unit_price
    restock_date = datetime.strptime(data['expense_date'], '%Y-%m-%d').date()
    was_out_of_stock = product.remaining_stock == 0
    expense = Expense(
        description=f'Restock de {product.name}',
        amount=amount,
        expense_date=restock_date,
        product_id=product.id,
        quantity=quantity,
        unit_price=unit_price
    )
    product.remaining_stock += quantity
    product.initial_stock = product.remaining_stock
    product.sold = 0
    product.purchase_price = unit_price
    if was_out_of_stock:
        product.next_order_date = restock_date
    db.session.add(expense)
    db.session.commit()
    return jsonify(expense.to_dict()), 201

@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    expense = Expense.query.get_or_404(expense_id)
    if expense.product_id and expense.quantity:
        product = Product.query.get(expense.product_id)
        if product:
            if product.remaining_stock < expense.quantity:
                return jsonify({'error': f'Impossible de supprimer : des articles de ce réapprovisionnement ont déjà été vendus. Stock restant ({product.remaining_stock}) < quantité réapprovisionnée ({expense.quantity})'}), 400
            product.remaining_stock -= expense.quantity
            product.initial_stock = product.remaining_stock
            product.sold = 0
    db.session.delete(expense)
    db.session.commit()
    return jsonify({'message': 'Dépense supprimée'}), 200

@app.route('/api/sales/dashboard', methods=['GET'])
def get_dashboard_stats():
    """Récupérer les statistiques du dashboard"""
    sales = Sale.query.all()
    products = Product.query.all()
    
    # Calculs
    total_ca = sum(s.amount for s in sales)
    total_net = sum(s.net_amount for s in sales)
    total_sold = sum(s.quantity for s in sales)
    
    # Ventes du jour
    today = date.today()
    today_sales = [s for s in sales if s.sale_date.date() == today]
    today_ca = sum(s.amount for s in today_sales)
    today_net = sum(s.net_amount for s in today_sales)
    
    # Produits actifs
    active_products = len([p for p in products if p.remaining_stock > 0])
    
    # Alertes stock
    low_stock = [p for p in products if p.remaining_stock <= 3]
    
    return jsonify({
        'totalCA': total_ca,
        'totalNet': total_net,
        'totalFlacons': total_sold,
        'activeProducts': active_products,
        'todayCA': today_ca,
        'todayNet': today_net,
        'lowStock': len(low_stock),
        'lowStockItems': [p.name for p in low_stock]
    }), 200

# ---------- ROUTES PARAMÈTRES ----------

@app.route('/api/settings', methods=['GET'])
def get_settings():
    """Récupérer tous les paramètres"""
    settings = Settings.query.all()
    return jsonify([s.to_dict() for s in settings]), 200

@app.route('/api/settings/<string:key>', methods=['PUT'])
def update_setting(key):
    """Mettre à jour un paramètre"""
    setting = Settings.query.filter_by(key=key).first_or_404()
    data = request.get_json()
    
    if 'value' in data:
        setting.value = str(data['value'])
    if 'description' in data:
        setting.description = data['description']
    
    db.session.commit()
    return jsonify(setting.to_dict()), 200

# ==================== DÉMARRAGE ====================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)