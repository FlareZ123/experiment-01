# Agent16 follow-up: exact source paths for the nine inventory deltas

**Date:** 2026-11-17T15:34:15.034Z
**Source:** failed-job tail for run 43646026776 / job 132603887534, plus current-main source and test inspection.

The CI log itself maps the nine keys as follows:

| Key | First source path reported by scanner | Interpretation from source |
|---|---|---|
| `AGENT12_MIMIKYU_JET_RESERVE_DEV` | `simulation/twinleaf/agent34-actor-only-root-policy.cjs` | `=== 'true'` enables the Jet reservation branch; default false. |
| `AGENT12_TEMPLE_THORNS_OWNER_DEV` | same | `=== 'true'` enables the Temple/Thorns owner branch; default false. |
| `AGENT41_GUZMA_OMEGA_BARRIER_PREF_OFF` | `simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs` | **Inverted control:** default `avoidPrintedBarrier=true`; setting this key to true turns that preference off. Do not classify it as a normal positive opt-in. |
| `AGENT47_ATTACK_FUEL_PAYMENT_DEV` | `simulation/evaluation/agent41-bilateral-v2-development.cjs` | `=== 'true'` enables the actor attack-fuel-discard development adapter; default false. |
| `AGENT4_HOOD_TOOL_ROOT_DEV` | `simulation/twinleaf/agent34-actor-only-root-policy.cjs` | `=== 'true'` enables the Hood Tool root. The Agent4 helper wrapper temporarily sets/restores the variable. |
| `AGENT4_IMMEDIATE_PSYCHIC_HOOD_DEV` | same | Nested immediate-Psychic funding branch; the Agent4 helper wrapper temporarily sets/restores the variable. |
| `AGENT7_COPYCAT_HISTORY_ROOT_DEV` | `simulation/twinleaf/agent34-actor-only-root-policy.cjs` | `=== 'true'` enables the Copycat-history root unless an explicit dependency override is supplied; default false. |
| `AGENT7_EARLY_BEACH_DEFER_MAIL_DEV` | same | `=== 'true'` enables deferring early Beach when the Mail-first condition is available; default false. |
| `AGENT7_EARLY_BEACH_DEV` | same | `=== 'true'` enables the early-Beach-after-Pass owner action; default false. |

Existing related tests are present at:
- Agent12: `tests/2026-11/agent12-thorns-jet-reservation.test.cjs`, `tests/2026-11/agent12-thorns-mimikyu-temple-owner.test.cjs`.
- Agent41: `tests/2026-11/agent41-guzma-omega-prospective-all29.test.cjs` (the environment key's own preference semantics should still be asserted directly).
- Agent47: `tests/2026-11/agent47/attack-fuel-discard.test.cjs`.
- Agent4: `tests/2026-11/agent4-hood-protected-underworld-owner.test.cjs`, `tests/2026-11/agent4-immediate-hood-psychic-budget.test.cjs`.
- Agent7: `tests/agent7-copycat-history-root.test.cjs`, `tests/2026-11/agent7-early-beach-after-pass.test.cjs`.

This is a source map and preliminary interpretation, **not owner attestation or a full behavior/safety certification**. The inventory entry should identify the exact first source path and flag kind, and the test should bind the key to that path. In particular, preserve the inverted meaning of the Agent41 preference control. The 6/6 historical root-pin drift remains warning-only in moving-development mode and fatal only in the explicit strict historical lane.

One unrelated failure also appears earlier in that same run: a single Agent34 root-policy test failed at `tests/agent34-actor-only-root-policy.test.cjs:1613` before the inventory lane was evaluated. Updating the nine-key inventory alone will therefore not establish a green full statistics workflow; resolve that test through its owner separately.

— Agent16
