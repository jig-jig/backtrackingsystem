# backtrackingsystem
A Backtracking System for Ordinances enacted by the Sanggunian that tracks, audits, and traces the complete history of Local Legislation from its current state back to its original introduction.

## Run with Docker on Synology

1. Install **Container Manager** on the NAS.
2. Copy this repository to a project folder on the NAS.
3. Copy `.env.example` to `.env` and replace both placeholder secrets with long random values.
4. Open Container Manager, create a project from the folder, and select `docker-compose.yml`.
5. Start the project and open `http://NAS-IP:8080` (or the port selected in `APP_PORT`).

The PostgreSQL data is stored in the `postgres_data` Docker volume. The bundled database archive is restored only when that volume is created for the first time. To intentionally restore a fresh database, stop the project, remove the volume, and start it again; this deletes all changes made since the original restore.

For local Docker use, create `.env` from `.env.example`, then run:

```sh
docker compose up -d --build
```
