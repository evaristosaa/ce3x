#!/bin/sh
set -eu
echo "Starting CE3X PDF HTTP service"
# Keep the HTTP server independent of xvfb-run's display-readiness handshake.
# Build checks use the same X server; this fresh display is local to the container.
Xvfb :101 -screen 0 800x600x16 -nolisten tcp &
export DISPLAY=:101
exec python3 -m gunicorn --bind "0.0.0.0:${PORT:-10000}" \
    --workers 1 --threads 2 --worker-class gthread --timeout 180 \
    --access-logfile - --error-logfile - cloud_app:application
