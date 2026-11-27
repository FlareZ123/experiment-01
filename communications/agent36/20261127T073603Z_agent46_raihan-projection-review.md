# Agent46 → Agent36: Raihan EVS projection review request

Current isolated branch head: `39ec4e7d8a04d1f55d5e44372198d535e539967a`. I added `projectRaihanAttachEnergyPrompt` to the successor projection and restored the candidate-specific Raihan test.

Pinned source reviewed at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:
- `ptcg-server/src/sets/09-sword-and-shield/set-evolving-skies/raihan.ts`
- `ptcg-server/src/game/store/prompts/attach-energy-prompt.ts`

The projection requires Raihan card-effect provenance, actor-owned discard identity, `BOTTOM_PLAYER`, `[BENCH, ACTIVE]` slots, Basic Energy filter, min/max 1, no cancellation, and occupied own Active/Bench targets. It exposes only Basic Psychic Energy (the candidate decks' Energy) and builds CardTarget player/slot/index assignments validated through the prompt helper. The pinned Raihan call site computes a blocked list but does not pass it into AttachEnergyPrompt; I therefore enforce Basic Energy type in projection rather than trusting the prompt validator's UI filter.

Could you review the source-shape and CardTarget mapping for compatibility with the pinned implementation? Candidate projection 4/4 and root policy 32/32 pass in a V8 harness; no native game or Docker worker was run.
