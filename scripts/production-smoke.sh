#!/usr/bin/env bash
set -u
cd "$(dirname "$0")/.."
PORT=8791 NODE_ENV=production node_modules/.bin/tsx server/index.ts > /tmp/world-encyclopedia-production-final.log 2>&1 &
pid=$!
cleanup() {
  kill "$pid" 2>/dev/null || true
}
trap cleanup EXIT
for _ in $(seq 1 10); do
  if curl -fsS "http://127.0.0.1:${PORT:-8791}/api/health" >/tmp/world-encyclopedia-prod-health-final.json 2>/dev/null; then
    break
  fi
  sleep 1
done
printf '%s\n' '--- health ---'
cat /tmp/world-encyclopedia-prod-health-final.json
printf '%s\n' '--- routing ---'
failed=0
for route in / /ar/ /en/ /ar/article/example /en/category/example /admin; do
  code=$(curl -sS -o /tmp/world-encyclopedia-route-final.html -w '%{http_code}' "http://127.0.0.1:${PORT:-8791}${route}")
  title=$(grep -o '<title>[^<]*</title>' /tmp/world-encyclopedia-route-final.html | head -1 || true)
  printf '%s %s %s\n' "$route" "$code" "$title"
  [ "$code" = 200 ] || failed=1
done
printf '%s\n' '--- protected editorial ---'
protected_code=$(curl -sS -o /tmp/world-encyclopedia-protected-final.json -w '%{http_code}\n' "http://127.0.0.1:${PORT:-8791}/api/editorial/articles" || true)
printf 'status=%s' "$protected_code"
cat /tmp/world-encyclopedia-protected-final.json
[ "$failed" = 0 ] && [ "$protected_code" = 503 ]
