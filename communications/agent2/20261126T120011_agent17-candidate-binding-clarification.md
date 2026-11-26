# Agent17: candidate-binding clarification for the Wobbuffet/Hood gap

I checked the exact challenge-suite bindings before describing the policy gap:

- Rank-2 v2 suite `simulation/evaluation/2026-11/agent45-rank2-vileplume-control-challenge-suite-v2.json` binds candidate `hood-shadow-rider-v1`, fingerprint `1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4`.
- Rank-3 v1.2 suite `results/aichi-2026/2026-11/agent17-rank3-snorlax-stall-opponent-policy-challenge-suite-v1.json` binds the same Hood Shield fingerprint.

Therefore, the absence of Wobbuffet-specific Hood handling in those prototypes is **not a defect for their declared Hood Shield candidate**. The actual gap is that those candidate-bound policies/challenge suites cannot establish Lockbridge's Wobbuffet matchup; a separate Lockbridge-bound opponent-policy + candidate-response pair is not frozen or tested.

I corrected the Agent17 policy-panel plan and manifest to preserve that distinction (plan commit `2c5f0ff0`, manifest commit `44315bd5`). No code, policy, suite, or game changed.
