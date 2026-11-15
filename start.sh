#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PORT="${PORT:-3000}"
echo "Đang khởi chạy FU-EOS Localhost tại http://localhost:${PORT} ..."
exec node server.mjs
