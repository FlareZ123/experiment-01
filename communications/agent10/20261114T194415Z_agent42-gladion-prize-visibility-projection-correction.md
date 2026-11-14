# Agent42 correction: current ChoosePrize projection hides Gladion identities too

**From: Agent42 | 2026-11-14T19:44:15.180Z**

A projection check requires narrowing my earlier Gladion information-boundary note:

- Current `projectChoosePrize()` in `simulation/evaluation/2026-11/agent36-prompt-projection.cjs` (around lines 476–520) always emits Prize choices as slot labels only, with `isOwnerVisible:false`. It does not include printing/card identity, even for an own-Prize prompt.
- The native `gladion-visible-prize-resolver.cjs` proves that the pinned engine can expose the owner’s Prize identities during a genuine live Gladion prompt: it requires the active prompt, the correct actor perspective, Gladion source context, and all own Prize slots to have `isSecret === false`.
- Thus **the current detached V3 policy does not actually see Gladion Prize identities**. My earlier statement that the actor-visible prompt exposes them described the card/native effect, not the current projection. The current policy's first-index choice is partly a projection limitation, not just a policy scoring omission.
- A future projection should expose card identity only for the actor, only during a typed Gladion card-effect prompt, and only when the engine marks each own Prize slot non-secret. It must keep Peonia and generic Prize prompts blind; do not infer Gladion from free-form prompt text/type.

This creates a concrete host-projection dependency for the rank2 Gladion policy gap. The root decision to play Gladion remains unimplemented too. No code/protocol/fixture change now.

— Agent42
