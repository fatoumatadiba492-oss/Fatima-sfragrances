from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Product(db.Model):
    """Modèle pour les produits (parfums)"""
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    initial_stock = db.Column(db.Integer, nullable=False, default=0)
    purchase_price = db.Column(db.Float, nullable=False, default=0)
    sale_price = db.Column(db.Float, nullable=False, default=0)
    sold = db.Column(db.Integer, nullable=False, default=0)
    remaining_stock = db.Column(db.Integer, nullable=False, default=0)
    next_order_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relation avec les ventes
    sales = db.relationship('Sale', backref='product_ref', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'product': self.name,
            'initial': self.initial_stock,
            'purchasePrice': self.purchase_price,
            'salePrice': self.sale_price,
            'purchaseTotal': self.initial_stock * self.purchase_price,
            'potentialCA': self.initial_stock * self.sale_price,
            'sold': self.sold,
            'remaining': self.remaining_stock,
            'nextOrder': self.next_order_date.strftime('%Y-%m-%d') if self.next_order_date else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

class Sale(db.Model):
    """Modèle pour les ventes"""
    __tablename__ = 'sales'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    expense = db.Column(db.Float, nullable=False, default=0)
    net_amount = db.Column(db.Float, nullable=False)
    sale_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'product': self.product_ref.name if self.product_ref else 'Inconnu',
            'productId': self.product_id,
            'quantity': self.quantity,
            'amount': self.amount,
            'expense': self.expense,
            'net': self.net_amount,
            'date': self.sale_date.strftime('%Y-%m-%d'),
            'time': self.sale_date.strftime('%H:%M')
        }

class CreditSale(db.Model):
    """Modèle pour les ventes à crédit"""
    __tablename__ = 'credit_sales'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    customer_name = db.Column(db.String(120), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    credit_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    product_ref = db.relationship('Product', backref=db.backref('credit_sales', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'product': self.product_ref.name if self.product_ref else 'Inconnu',
            'productId': self.product_id,
            'customerName': self.customer_name,
            'quantity': self.quantity,
            'unitPrice': self.unit_price,
            'totalAmount': self.total_amount,
            'date': self.credit_date.strftime('%Y-%m-%d')
        }

class Expense(db.Model):
    """Modèle pour les dépenses de réapprovisionnement"""
    __tablename__ = 'expenses'

    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    expense_date = db.Column(db.Date, nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=True)
    quantity = db.Column(db.Integer, nullable=True)
    unit_price = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    product_ref = db.relationship('Product', backref=db.backref('restock_expenses', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'amount': self.amount,
            'product': self.product_ref.name if self.product_ref else self.description,
            'productId': self.product_id,
            'quantity': self.quantity,
            'unitPrice': self.unit_price,
            'totalAmount': self.amount,
            'date': self.expense_date.strftime('%Y-%m-%d')
        }

class Settings(db.Model):
    """Modèle pour les paramètres"""
    __tablename__ = 'settings'
    
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(50), unique=True, nullable=False)
    value = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(200))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'key': self.key,
            'value': self.value,
            'description': self.description
        }