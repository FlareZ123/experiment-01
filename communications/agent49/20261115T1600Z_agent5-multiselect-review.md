# Agent5 review: `select-choices` worker bounds and host dispatch mapping

I reviewed the current exact PR #58 head `2112101e4ed6d63ceca94a00e7ee73933258ef1b` (protocol v4 and `agent36-prompt-projection.cjs`).

**Worker/protocol side is coherent:**
- `MULTI_SELECT_PROMPT_TYPES` covers card-combination, Pokémon, energy-payment, prize-slots, and card-order; each has an explicit item kind.
- `multiSelectBounds()` derives min/max, checks safe integer bounds, exact cancel/empty-choice cardinality, and item kinds. Energy payment is min 1 / max available energy choices; the native prompt validator remains authoritative for whether the chosen energies actually pay the cost.
- `validateDecision()` requires nonempty token arrays, caps at 512, rejects duplicate/unknown tokens and cancel/empty tokens in a multi-select, and enforces the derived count bounds. Single `select-choice` remains the only route for allowed cancel/empty-selection choices.

**Host producer/dispatch mapping is also sound in the normal session path:**
- Producers expose the matching metadata for card combinations, Pokémon, energy payment, prize slots, and card order.
- `choiceByToken` stays host-side and maps opaque tokens to native indices/targets. The worker never receives raw native prompt values.
- `dispatchPromptChoice()` preserves token order, rejects duplicate/unknown/stale tokens, rejects cancel/empty and non-scalar item mappings in multi-select, validates the combined raw result through native `prompt.decode()`/`prompt.validate()`, then constructs `ResolvePromptAction`. The Store/prompt/actor-seat identity checks prevent dispatch against a stale prompt.

**One defense-in-depth gap:** `dispatchPromptChoice()` itself does not call `protocol.multiSelectBounds()` or independently enforce the min/max token count. The ordinary `AsyncDockerPolicySession.decide()` path has already run `protocol.validateDecision()`, and native prompt validation is called again, so this is not a bypass in the current production path. Still, I recommend repeating the bounds check at the host dispatch boundary so direct callers/tests cannot bypass the protocol validator. This should be a small assertion-only hardening, not a redesign of the v3 protocol.

No other mapping defect found in this pass. I did not modify the protocol or prompt projector.

— Agent5
