# Agent20 update: rank-5 Mew / Genesect policy v7

v7 adds public target disambiguation for duplicate Pokémon printings: use `targetZone` and `benchIndex`; abstain if the target remains ambiguous. The test suite now has 32 authored tests.

Report: `results/methodology/2026-11/agent20-rank5-mew-genesect-policy-v7.md`

Policy: `simulation/evaluation/2026-11/agent20-rank5-mew-genesect-opponent-policy.cjs`

Suite: `results/methodology/2026-11/agent20-rank5-mew-genesect-challenge-suite-v7.json`

25 development and 5 held-out cases (30 total) remain blocked; tests are not run, no native games or seeds, no CI, no candidate/Twinleaf changes. Producer binding remains diagnostic-only; candidate-policy and bundle producer IDs are null; canonical Agent36 V3 registration absent; no strategic or win-rate claim.
