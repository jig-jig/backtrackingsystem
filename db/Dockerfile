FROM postgres:18-alpine

COPY db/restore.sh /docker-entrypoint-initdb.d/10-restore.sh
RUN chmod +x /docker-entrypoint-initdb.d/10-restore.sh
COPY backend/backtracking_db.sql /backtracking_db.dump