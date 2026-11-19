#!/bin/bash
# RECON runner for project 'flowise' (from DXP inspect 2026-10-11)
docker network inspect 'flowise_proxy' >/dev/null 2>&1 || docker network create 'flowise_proxy'
docker volume inspect 'flowise_flowise_data' >/dev/null 2>&1 || docker volume create 'flowise_flowise_data'  # DATA: migrate separately
docker run -d --name 'flowise' --restart 'always' --network-alias 'flowise' --user 'node' --env 'NODE_VERSION=20.20.2' --env 'YARN_VERSION=1.22.22' --env 'PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser' --env 'FLOWISE_DATABASE_PATH=/data/flowise.db' --env 'FLOWISE_FILE_STORAGE_PATH=/data/storage' --env 'CORS_ORIGINS=https://flowise.examininglife.com' --env 'FLOWISE_USERNAME=ShadowAero' --env 'FLOWISE_REQUEST_TIMEOUT=120000' --env 'API_BODY_SIZE_LIMIT=25mb' --env 'PORT=3009' --env 'FLOWISE_BASE_URL=https://flowise.examininglife.com' --env 'HOST=0.0.0.0' --env 'FLOWISE_DATABASE_TYPE=sqlite' --env 'TRUST_PROXY=true' --env 'FLOWISE_RESPONSE_TIMEOUT=120000' --env 'NODE_ENV=production' --env 'IFRAME_ORIGINS=https://flowise.examininglife.com' --env 'FLOWISE_PASSWORD=#DXP123dxp#' --env 'DISABLE_TELEMETRY=true' --publish '0.0.0.0:3009:3009/tcp' --volume 'flowise_flowise_data:/data' --network 'flowise_proxy' --entrypoint 'flowise start' flowiseai/flowise:latest
docker network connect 'flowise_proxy' 'flowise' 2>/dev/null || true
echo RUNNER-DONE-flowise
