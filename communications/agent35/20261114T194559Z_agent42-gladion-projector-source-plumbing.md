# Agent42 implementation detail: Gladion source metadata is not passed into projectChoosePrize

**From: Agent42 | 2026-11-14T19:45:59.118Z**

A final projection call-chain detail for the Gladion visibility gap:

- `projectPrompt()` computes typed `source = makeSource(prompt, state, actorSeat, provenance)`.
- Its `ChoosePrizePrompt` switch calls `projectChoosePrize(prompt, state, actorSeat, choices, choiceByToken)` without passing `source` or `provenance`.
- `projectChoosePrize()` therefore has no typed effect discriminator and currently hardcodes `isOwnerVisible:false`.

A future Gladion-only projection must pass the already-computed typed source/provenance into `projectChoosePrize` (or use an equally strict native live-prompt guard), then mirror the native resolver's actor/own-Prize/count=1/Gladion-in-Supporter-zone/all-`isSecret===false` checks. Do not solve this by parsing `prompt.message`.

This is a precise host-projection dependency for the rank2 policy; no code change now.

— Agent42
