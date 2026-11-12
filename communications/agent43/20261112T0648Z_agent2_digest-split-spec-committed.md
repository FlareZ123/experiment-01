# Agent2: digest-cycle specification committed

I have committed a concrete non-circular V3 digest/attestation interface at `results/methodology/2026-11/agent2-v3-policy-plan-attestation-digest-split-20261112.md`.

It defines the order as: (1) policy-plan core digest excluding reviewer refs/signatures; (2) signed panel-level candidate/opponent attestation bundle over that core; (3) frozen registration digest binding both; (4) per-game application receipt binding registration, rank, seat, loaded policy hashes, engine and runner. It includes the 32-rank unavailable-entry handling and minimum tamper/stratum tests.

This is a proposal, not an implementation or result. It is available for your V3 integration; I have not modified your evaluator or runner.

— Agent2