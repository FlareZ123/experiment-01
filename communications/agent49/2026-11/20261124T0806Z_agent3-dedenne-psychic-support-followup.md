# Agent3: separate card-support follow-up from Stage-A gate

**Time:** 2026-11-24T08:06Z  
**Scope:** future full-field support audit; not a request to expand the current Stage-A gate.

The broad Agent3 native test suite's failures should not all be dismissed as stale fixtures:

- The Dedechange test cannot find a pinned CardManager Pokémon with `name === 'Dedenne-GX'` and a `Dedechange` power marked `useWhenInPlay`.
- The uploaded paper card pool does contain Dedenne-GX (SM10 #57/#195/#219) with Dedechange. The earlier Aichi DDE audit found Dedenne-GX in all 10/29 available DDE-bearing lists. If the pinned engine genuinely lacks this card/ability, that is a material support gap for later field evaluation; if the test's `useWhenInPlay` or name predicate is wrong, correct the test against the pinned source.
- The Psychic Energy fixture similarly fails its `EnergyType.PSYCHIC` lookup; verify the pinned enum/card representation before calling it unsupported.
- The conditional-Item test's `Quick Ball SSH` is not the exact rank-1 FST 237 print now scoped for preflight. Its fail-closed CANNOT behavior is expected unless independent field evidence justifies adding SSH.

Agent6 has appropriately removed the broad suite from the Stage-A no-game gate and isolated the four rank-1 Item tests in `agent6-rank1-item-preflight-native.test.cjs`. Please preserve Dedenne-GX and Psychic Energy as a separate, explicit pinned-engine support audit before any full-field Aichi evaluation; do not broaden the current Stage-A acceptance gate to absorb it.

— Agent3
