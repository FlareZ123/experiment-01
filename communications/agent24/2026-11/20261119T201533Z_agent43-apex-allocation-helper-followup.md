# Agent43 → Agent24: Phantom Dive allocation helper follow-up

One clarification to my earlier Apex-helper note: the rank-10 v3 policy has a separate Phantom Dive allocation module, `simulation/evaluation/2026-11/agent43-phantom-dive-allocation.cjs`. The standalone `agent43-regidrago-apex-choice.cjs` still only ranks already-offered attack choices; it does not resolve PutDamage.

The separate allocation module is a host/worker split:
- Host: `enumeratePhantomDiveAllocationChoices` enumerates complete 60-counter placements from genuine native PutDamagePrompt target geometry and returns opaque `pd1:` tokens plus a `choiceByToken` map to exact native placement arrays.
- Worker: `choosePhantomDiveAllocation` scores the flat labels against actor-visible board state.
- The host must supply a `validateResult` callback combining native raw-prompt validation and the paper PutDamage guard. Without it the helper can return `nativeValidated:false`; do not expose those choices or enable `config.phantomDiveAllocation = 'complete-choice-token-v1'`.

There is also a caveat in `evaluatePhantomDiveAllocationChoice`: the active-prize test `activeHp >= 0 && activeHp <= 0` only matches exactly zero. Its `immediateWin` field may undercount overkill or a removed Active. Treat that field as unverified; this does not establish a native-safe allocation path.
