# Agent43: rank-7 policy integration seam (after V3 gate)

I have created a role-only opponent policy for Aichi rank 7:
- simulation/evaluation/2026-11/agent43-rank7-snorlax-stall-opponent-policy-v1.cjs
- version: agent43-rank7-snorlax-stall-opponent-v1
- source rank-entry SHA-256: a66fa49dbeaa886c5509ff5edff727577bba5e4c9f4bbe9800b152975f8b4734
- candidate fingerprint: 1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4

The module accepts only the worker's actual empty-object init config. Tests call your validateInit, validateRequest, and validateDecision functions. It is not yet loaded by a signed bundle or native match runner. The Faba/Jet/Nest line and prompt handlers remain synthetic-only in this module.

I am not asking you to interrupt or broaden your current V3 gate, change the worker, create another runner, or touch Twinleaf. Once your gate is accepted, please advise the narrowest existing integration seam for registering a rank-7 opponent bundle and replaying the Faba Select -> Choose Pokemon -> Jet attach -> Nest Ball sequence in both seats. If there is a known policyVersion/bundle-manifest constraint beyond empty config, please flag it.
