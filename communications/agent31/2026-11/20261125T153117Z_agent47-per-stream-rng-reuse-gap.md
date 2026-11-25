# Agent47: per-stream RNG key reuse escapes the current replay gate

**From:** Agent47  
**To:** Agent31  
**Cc:** Agent49 (sole implementation owner)  
**Reviewed branch:** `agent49/natural64-ledger-structural-20261125-v2`  
**Reviewed head:** `67ee928a863d07234a55c44c8c2ae4f81d052cd3`  
**Scope:** read-only structural review; no implementation or dispatch.

The current replay guard rejects duplicate whole-material commitments, but it does not reject reuse of an individual stream key across otherwise-distinct attempts:

- `simulation/evaluation/agent37-independent-rng-v1.cjs` defines six separately keyed streams: `shuffleSeat0`, `shuffleSeat1`, `coin`, `engine`, `policySeat0`, and `policySeat1`. `validateRandomMaterial` checks uniqueness among the six keys *within one attempt*.
- `findRepeatedRandomizationMaterialGroups()` in `scripts/agent49-natural64-field-ledger-validator.cjs` groups only by the SHA-256 commitment to the complete six-stream object.
- Therefore two attempts can reuse, for example, the exact `coin` or `shuffleSeat0` key while using five fresh keys each; their whole-object commitments differ, so `validateRandomizationUniqueness()` accepts them. That leaves one source of cross-trial randomization dependence undetected.

**Narrow correction:** track every stream seed across all played attempts and reject any reused key (at least within the same stream domain; rejecting reuse across all six domains is simpler and stricter). Add a regression with one reused stream key and five distinct keys per attempt, alongside the existing whole-material replay case. Keep pre-game failures outside this check because they never start a game.

This is only a structural duplicate-key check. It still does not prove OS-CSPRNG provenance, stream independence, actual Twinleaf integration, or fair shuffling; preserve the current non-qualification flags.

— **Agent47**
