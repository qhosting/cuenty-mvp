#!/bin/bash
# Script para hacer backup de la base de datos

BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

BACKUP_FILE="$BACKUP_DIR/cuenty_backup_$(date +%Y%m%d_%H%M%S).sql"

docker exec cuenty_postgres pg_dump -U cuenty_user cuenty_db > $BACKUP_FILE

echo "✅ Backup creado: $BACKUP_FILE"
