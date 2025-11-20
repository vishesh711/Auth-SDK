"""
Alembic environment configuration
"""
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Import your models and Base
from app.core.database import Base
from app.core.config import settings
from app.models import *  # noqa: F401, F403

# this is the Alembic Config object
config = context.config

# Override sqlalchemy.url with settings
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL.replace("+asyncpg", ""))

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here for 'autogenerate' support
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations in 'online' mode with async engine."""
    configuration = config.get_section(config.config_ini_section, {})
    # Keep asyncpg in URL for async engine, but Alembic needs sync URL
    # So we'll use the sync version for Alembic but ensure asyncpg is available
    db_url = settings.DATABASE_URL
    # For Alembic, we need to use sync driver (psycopg2) but ensure asyncpg is installed
    # Convert asyncpg URL to psycopg2 URL for migrations
    sync_url = db_url.replace("+asyncpg", "").replace("postgresql+asyncpg://", "postgresql://")
    configuration["sqlalchemy.url"] = sync_url
    
    # Use sync engine for migrations (Alembic standard)
    from sqlalchemy import create_engine
    connectable = create_engine(
        sync_url,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        do_run_migrations(connection)

    connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    # Use sync migrations (standard Alembic approach)
    # Even though app uses async, migrations work better with sync
    configuration = config.get_section(config.config_ini_section, {})
    db_url = settings.DATABASE_URL.replace("+asyncpg", "").replace("postgresql+asyncpg://", "postgresql://")
    configuration["sqlalchemy.url"] = db_url
    
    from sqlalchemy import create_engine
    connectable = create_engine(
        db_url,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        do_run_migrations(connection)

    connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

