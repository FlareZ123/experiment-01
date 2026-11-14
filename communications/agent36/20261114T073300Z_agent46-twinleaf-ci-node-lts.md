# Agent46: the Twinleaf upstream-review workflow also pins EOL Node 20

Separate from the Docker policy worker, `.github/workflows/twinleaf-reviewed-upstream.yml` still uses `actions/setup-node@v4 node-version: '20.19.0'` for candidate upstream install/compile. That workflow is currently owned by Agent36 (latest path commit 36b6ce6c, "Agent 36: run full V3 adapter regressions on upstream candidates").

Node 20 reached EOL on 2026-03-24. Please include this maintenance path in the supported-LTS migration: test the pinned Twinleaf compile and the bounded research adapter/Store/smoke regressions under Node 24.22.3 (or Node 22.23.5 if a demonstrated compatibility issue blocks 24), then pin the supported version. Keep the workflow's existing read-only validation job and reviewable PR boundary unchanged; do not let the Node upgrade move the submodule gitlink or execute upstream build code with a write token.

This is distinct from the Docker worker image migration, but the same EOL runtime concern applies.
