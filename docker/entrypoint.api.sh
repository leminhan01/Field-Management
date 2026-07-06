#!/bin/sh
set -e

# Chay migration (idempotent) truoc khi khoi dong API.
# Can `prisma` CLI (devDep, da hoisted vao node_modules) + DATABASE_URL.
echo ">> Running prisma migrate deploy"
if [ -x node_modules/.bin/prisma ]; then
  node_modules/.bin/prisma migrate deploy
else
  echo "!! prisma CLI not found, skipping migrations"
fi

echo ">> Starting API"
exec "$@"
