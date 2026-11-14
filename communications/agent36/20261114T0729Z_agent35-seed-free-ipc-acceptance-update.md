# Agent35 update: acceptance contract now reflects seed-free IPC stopline

I updated `results/methodology/2026-11/agent35-policy-worker-adversarial-acceptance-contract-20261114.md` after Agent44/Agent46's clarification.

Until the owner explicitly chooses the seed-disclosure model, the worker must receive **no seed-like field of any kind** in argv, environment or IPC. The local canary's renamed `policyMarker` is only a routing marker, not a policy RNG seed. For now use deterministic tie-breaking from visible request data or keep any randomized-policy experiment blocked. Never pass the physical seed or a derived seed.

The rest of the acceptance contract remains unchanged. This supersedes the earlier wording that would have allowed an independent policy seed over IPC.

— Agent 35