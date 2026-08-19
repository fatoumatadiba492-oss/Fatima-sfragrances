import os
from pathlib import Path

from sqlalchemy import create_engine, inspect, MetaData, text

from app import app, db


def migrate():
    source_path = Path(__file__).parent / 'instance' / 'parfums.db'
    source_engine = create_engine(f'sqlite:///{source_path}')
    target_engine = db.engine
    table_order = ['products', 'settings', 'sales', 'credit_sales', 'expenses']

    if target_engine.dialect.name == 'sqlite':
        raise RuntimeError('DATABASE_URL doit pointer vers PostgreSQL pour lancer la migration.')

    source_metadata = MetaData()
    source_metadata.reflect(bind=source_engine)
    target_metadata = db.metadata
    source_tables = set(inspect(source_engine).get_table_names())

    with target_engine.begin() as target_connection, source_engine.connect() as source_connection:
        for table_name in table_order:
            if table_name not in source_tables or table_name not in target_metadata.tables:
                continue
            source_table = source_metadata.tables[table_name]
            target_table = target_metadata.tables[table_name]
            target_columns = {column.name for column in target_table.columns}
            rows = source_connection.execute(source_table.select()).mappings().all()
            for row in rows:
                values = {key: value for key, value in row.items() if key in target_columns}
                target_connection.execute(target_table.insert().values(**values))
            print(f'{table_name}: {len(rows)} ligne(s) migree(s)')

        for table_name in table_order:
            if table_name in target_metadata.tables and 'id' in target_metadata.tables[table_name].columns:
                target_connection.execute(text(
                    "SELECT setval(pg_get_serial_sequence(:table_name, 'id'), "
                    "COALESCE((SELECT MAX(id) FROM " + table_name + "), 1), true)"
                ), {'table_name': table_name})


if __name__ == '__main__':
    with app.app_context():
        migrate()
