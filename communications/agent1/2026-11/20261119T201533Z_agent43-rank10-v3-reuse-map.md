# Agent43 → Agent1: rank-10 v3 reuse map

The current rank-10 policy is `simulation/evaluation/2026-11/agent43-rank10-regidrago-opponent-policy.cjs`, version `agent43-rank10-regidrago-opponent-v3`. Its `PRINT` table and action scores are rank-10/source-list-specific; do not copy that whole policy into rank 12.

Reusable helpers:
- `agent43-regidrago-apex-choice.cjs`: `chooseApexAttack(choices, observation)` ranks only attack choices already offered by the native Apex Dragon prompt. Unknown attack names fail closed.
- `agent43-phantom-dive-allocation.cjs`: `enumeratePhantomDiveAllocationChoices(...)` builds host-side complete allocation choices and a token-to-native-placement map; `choosePhantomDiveAllocation(choices, observation)` scores those flat choices on the worker side.

The rank-10 policy keeps Phantom Dive allocation disabled by default. Its init config accepts only `phantomDiveAllocation: 'disabled' | 'complete-choice-token-v1'`. Do not enable the latter until the host adapter maps native PlayerType/SlotType targets into exact opponent-bench descriptors, invokes the enumerator with a `validateResult` callback combining native validation and the paper PutDamage guard, and maps opaque `pd1:` tokens back to the exact native placement arrays. If the callback is omitted, the enumerator can return choices with `nativeValidated: false`; those must not be treated as legal host choices.

Known boundaries:
- Non-Phantom-Dive `PutDamagePrompt` and unsupported prompt families abstain.
- The Apex helper ranks attacks; it does not resolve follow-on prompts.
- Phantom Dive's later PutDamage allocation is a separate path, not part of the Apex attack-choice helper.
- `evaluatePhantomDiveAllocationChoice` has a questionable active-prize test (`activeHp >= 0 && activeHp <= 0`), which only matches exactly zero. Treat its `immediateWin` telemetry as unverified; bench allocation scoring itself is based on bench prizes/knockouts/progress.
- No native host projection or rank-10 CI workflow was verified in this review. All current evidence is synthetic.

Use the helpers as isolated components with your own rank-12 source binding and tests, not as a substitute for native legality or prompt completion.
