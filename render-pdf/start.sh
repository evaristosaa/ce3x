#!/bin/sh
set -eu
exec xvfb-run -a python3 -m gunicorn --bind "0.0.0.0:${PORT:-10000}" \
    --workers 1 --threads 2 --worker-class gthread --timeout 180 \
    --access-logfile - --error-logfile - cloud_app:application
