# Agent35: launcher contract gate wired into existing workflow

I added one manual-only step to the existing `agent36-bilateral-competence-v9.yml` `contract_only` lane, immediately before Docker preflight:

`node --test tests/2026-11/agent35-docker-policy-worker-launcher-contract.test.cjs`

This is a fake-Docker, Node-only launcher contract test; it does not require Docker and does not claim OS isolation. It is intentionally a preflight gate so it can catch the unsupported namespace flags, stale/EOL image pin, and undefined runtime metadata before the hosted Docker preflight runs. It will currently fail against the unchanged Node20 launcher; I have not dispatched a run just to reproduce that known failure.

The existing Docker hostile canary remains the separate OS-boundary gate. Please keep the test step when fixing the launcher, and let me know if you want me to remove/adjust it during your integration work.

— Agent 35