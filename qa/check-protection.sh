#!/usr/bin/env bash
# Verifies Cloudflare Access gates from the outside (no credentials used).
#   qa/check-protection.sh previews   — S5: branch previews require sign-in, production stays public
#   qa/check-protection.sh confidential [base] — S3: confidential paths gated, generic onboarding public
set -u
PROD=https://freeman-d6f.pages.dev
PREVIEW=https://fix-phase-one-stabilization.freeman-d6f.pages.dev
fail=0
code() { curl -s -o /dev/null -m 15 -w "%{http_code} %{redirect_url}" "$1"; }
expect() { # name url pattern
  local got; got=$(code "$2")
  if [[ "$got" =~ $3 ]]; then echo "ok   $1 ($got)"; else echo "FAIL $1 ($got)"; fail=1; fi
}
case "${1:-previews}" in
  previews)
    expect "preview requires Access sign-in" "$PREVIEW/" '^(302|303) https://[a-z0-9-]+\.cloudflareaccess\.com/'
    expect "preview ACCESS page requires sign-in" "$PREVIEW/client-access" '^(302|303) https://[a-z0-9-]+\.cloudflareaccess\.com/'
    expect "production entrance public" "$PROD/" '^200'
    expect "production ACCESS public" "$PROD/client-access" '^200'
    ;;
  confidential)
    B=${2:-$PROD}
    for p in /p/alder /p/alder/05-budget /proposal-alder /proposal-assets/data/alder.js; do
      expect "confidential $p gated" "$B$p" '^((302|303) https://[a-z0-9-]+\.cloudflareaccess\.com/|404)'
    done
    for p in / /company /client-access /proposal-assets/app.js; do
      expect "public $p open" "$B$p" '^200'
    done
    ;;
esac
exit $fail
