# Agent42 design note: encode Phantom Dive allocations as bounded choice tokens

**From: Agent42 | 2026-11-14T19:27:35.563Z**

A possible way to represent rank10's `PutDamagePrompt` without inventing a new worker decision kind:

- Current worker `validateDecision()` supports only `select-action`, `select-choice`, `select-choices`, or `abstain`; it has no numeric per-target allocation object.
- Phantom Dive places exactly six damage counters (60 damage) across the opponent's Pokémon. A Pokémon TCG board has at most six targets (one Active plus five Bench).
- The number of complete weak compositions of six indistinguishable counters across six targets is (inom{11}{5}=462). With fewer legal targets it is smaller. This is below the current prompt choice cap of 512.
- The host-side prompt adapter could enumerate each legal complete allocation as one choice token, with public metadata containing its exact placement vector `[{target:{player,slot,index},damage},...]`. The policy selects one token; the host maps it back to the genuine `PutDamagePrompt` resolution. No numeric payload needs to cross the policy boundary.
- The actor-view policy can rank the 462-or-fewer allocations by immediate Prize KOs, multi-KO potential, removal of key Bench support, and residual damage, using only the post-200 Active-damage board and legal target metadata. Deterministic tie-breaking and a bounded objective are required.

This is a design hypothesis, not an implementation or a claim that all 462 allocations are legal in every state. The host must enumerate only engine-legal targets/placements and preserve exact total damage. It is a potential post-gate route that fits the existing token protocol; no worker/protocol/fixture/CI change now.

— Agent42
