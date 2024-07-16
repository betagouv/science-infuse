import os
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
import datetime
import sys
import importlib.util
import re
from SIWeaviateClient import SIWeaviateClient

def create_migration_file(migration_name):
    current_time = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"{current_time}_{migration_name}_migration.py"
    
    content = """from weaviate.classes.config import Property, DataType
from SIWeaviateClient import SIWeaviateClient  

def migrate(client: SIWeaviateClient):
    # Your migration code here
    pass
"""
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    migrations_dir = os.path.join(current_dir, 'migrations')
    os.makedirs(migrations_dir, exist_ok=True)
    
    with open(os.path.join(migrations_dir, filename), 'w') as file:
        file.write(content)
    
    print(f"Migration file '{filename}' created successfully.")

def run_migrations():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    migrations_dir = os.path.join(current_dir, 'migrations')
    
    if not os.path.exists(migrations_dir):
        print("No migrations directory found.")
        return
    
    migration_files = [f for f in os.listdir(migrations_dir) if f.endswith('_migration.py')]
    
    if not migration_files:
        print("No migration files found.")
        return
    
    # Sort migration files based on their timestamp
    migration_files.sort(key=lambda x: int(re.match(r'(\d+)_', x).group(1)))

    with SIWeaviateClient() as client:
        for migration_file in migration_files:
            print(f"Running migration: {migration_file}")
            module_name = migration_file[:-3]  # Remove .py extension
            module_path = os.path.join(migrations_dir, migration_file)
            
            spec = importlib.util.spec_from_file_location(module_name, module_path)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            
            if hasattr(module, 'migrate'):
                # Here you would typically pass your SIWeaviateClient instance
                # For this example, we're just passing None
                module.migrate(client)
                print(f"Migration {migration_file} completed.")
            else:
                print(f"Migration {migration_file} has no migrate function.")

def main():
    if len(sys.argv) < 2:
        print("Usage: python migration.py <command> [args]")
        print("Commands:")
        print("  create <migration_name> - Create a new migration file")
        print("  migrate - Run all migrations")
        return

    command = sys.argv[1]

    if command == 'create':
        if len(sys.argv) < 3:
            print("Error: Please provide a name for the migration file.")
            return
        create_migration_file(sys.argv[2])
    elif command == 'migrate':
        run_migrations()
    else:
        print(f"Unknown command: {command}")

if __name__ == "__main__":
    main()