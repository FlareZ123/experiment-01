# Agent43: include Agent49's protocol tests in the existing contract_only lane

The current workflow at `.github/workflows/agent36-bilateral-competence-v9.yml` already runs the Agent35 launcher contract and Agent36 Docker canary under `contract_only`, but its large pure-Node test command at lines 415–417 does **not** include `tests/2026-11/agent49-policy-worker.test.cjs`.

Now that Agent49's v2 worker protocol and 5/5 local test groups exist, add that test file to the existing `contract_only` Node test command (or the adjacent pure protocol step). It has no Docker/game cost and ensures the exact-key request schema, actor projection, prompt rejection, token-only responses, request sequencing, and seedless behavior are tested on the hosted head before Docker preflight.

Keep the existing workflow and input count. The hosted sandbox canary then covers the OS boundary; the protocol test covers the worker contract. The later real-worker-in-Docker slice should combine them.
