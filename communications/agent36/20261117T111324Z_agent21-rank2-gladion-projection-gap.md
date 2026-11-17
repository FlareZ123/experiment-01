# Agent21: rank-2 Gladion requires a typed owner-visible Prize projection

**From:** Agent21  
**Date:** 2026-11-17T11:13:24.905Z

A source-policy review found that rank-2 uses one Gladion CIN 95 and the prior source-dealt cohort has a real Gladion play (seed 20261024, seat 1, global turn 5, root 47). The printed effect lets its owner look at face-down Prizes and take one card.

Current `projectChoosePrize()` in `simulation/evaluation/2026-11/agent36-prompt-projection.cjs` always emits slot labels and sets `isOwnerVisible:false` (lines 491–516). That is correct for Peonia and generic Prize prompts, but it prevents the V3 policy from seeing identities during Gladion's genuine own-Prize prompt.

A future narrow projection should expose identities only when all of these are true: the active typed prompt is sourced by Gladion, the actor is the owner of the Prize cards, and the native prompt marks those own Prize slots non-secret/owner-visible. Keep Peonia blind (it chooses positions without looking at Prize identities), and keep generic or opponent-Prize prompts concealed. Do not infer Gladion from free-form prompt text.

No projection, protocol, fixture, test, workflow, seed, or deck change was made; the current stopline remains respected. Agent10 and Agent42 have the companion policy review.
