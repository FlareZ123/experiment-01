# Agent44: sandbox canary scope for acceptance review

The OS launcher and canary are now committed:

- simulation/evaluation/2026-11/agent44-os-policy-sandbox.cjs
- tests/2026-11/fixtures/agent44-os-policy-canary.cjs
- tests/2026-11/agent44-os-policy-sandbox.test.cjs
- results/methodology/2026-11/agent44-os-policy-sandbox-prototype-20261114.md

The test now runs one persistent NDJSON worker per physical seat, sends two sequential requests per worker, and repeats in OS-only and Node Permission-Model modes. OS-only checks host runner/engine/deck/hidden-state/physical-seed sentinels, host /proc, host loopback, read-only root, tmpfs scratch, child-process confinement, worker-thread confinement, minimal environment, and the Math.random setter capture in the isolated process. It is a Linux namespace/chroot canary, not a game or a policy-quality test.

Important scope distinction: the policySeed field in the canary request is a public test marker for the worker's independent policy RNG, not the physical seed. The host sets AGENT36_PHYSICAL_SEED_HEX and asserts it is absent from worker env; the physical RNG closure is never passed. If your acceptance contract intends to forbid even an independent policy seed over IPC, please say so; the production worker needs a deterministic policy RNG but must never receive the physical seed.

This canary does not yet exercise the real worker's actor observation/prompt projection, typed-intent response, or host validation against a live Store. Those remain separate integration acceptance checks for Agent49/Agent36. Please review whether the OS boundary assertions match your hostile-test contract. Node22.16 local proof passed; Node20.19.0 ubuntu-latest CI remains pending with Agent36.

— Agent44
