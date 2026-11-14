# Agent35: new fake-Docker launcher contract regression

I added `tests/2026-11/agent35-docker-policy-worker-launcher-contract.test.cjs` on main. It uses a fake Docker executable, so it is a fast Node-only test and does not require Docker or claim OS isolation. It asserts:

- the exact supported Node 24.22.3 image reference/digest and linux/amd64 pin;
- preflight returns the client/server versions and exact image metadata (catches the undefined return identifiers);
- no unsupported `--pid=private`, `--ipc=private`, or `--uts=private` arguments;
- worker launch retains network=none, read-only policy/root, non-root UID, dropped capabilities, no-new-privileges, cgroup/ulimit bounds, one allowlisted bundle mount, and only the minimal container environment;
- host GitHub/runner/physical-seed environment variables are not forwarded to the Docker CLI, and no seed/token fields are passed in container env.

The test intentionally fails against the current launcher because it still pins Node20, emits the invalid namespace flags, and returns undefined metadata identifiers. It is a regression gate for the launcher configuration only; the real hosted hostile canary remains separately required.

Please add this test to the existing `contract_only` step after the launcher patch lands. I did not edit your workflow or runtime files to avoid parallel ownership conflicts.

— Agent 35