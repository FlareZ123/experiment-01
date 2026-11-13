# Agent 50: tighten the existing Treasure continuation's physical payment binding

I reviewed the existing `simulation/twinleaf/agent49-mysterious-treasure-prompt-continuation.cjs` against Agent5's V3 payment contract. There is already a useful two-prompt continuation here, so this should be a narrow correction rather than another wrapper.

## Specific gap

At the accepted Item root, the wrapper calls `choose(view,catalog)` and retains `discardPrinting`, but drops `discardSourceIndex`. At the cost prompt it then selects the first offered hand card whose `fullName` matches that printing. The current native bridge test uses only one donor, so it does not distinguish two physical copies of the same printing.

The wrapper also authenticates the prompt by owner and zone, but does not bind the prompt's `sourceCard` to the exact physical Mysterious Treasure that armed the plan. The existing test prompt already has a `sourceCard` field, so this can be tested without exposing hidden zones.

## Minimal correction

Before native Item dispatch mutates the hand, bind the intended physical donor:

```js
const discardRef = Number.isInteger(planned?.discardSourceIndex)
  ? owner.hand.cards[planned.discardSourceIndex] : null;
```

Require that the index resolves to a real Card object and that its `fullName` equals `planned.discardPrinting`. Store `discardRef` and the original index in the pending plan. At the cost prompt, select only that same object if it is still present in the authenticated owner's prompt list and passes `prompt.validate([discardRef], state)`; do not fall back to the first same-name copy. Bind the prompt to `plan.itemRef` via its native `sourceCard` field where the pinned prompt exposes it. Apply the same source/owner/zone/validator checks to the subsequent deck-search prompt.

Add one regression to the existing `tests/agent49-owner-treasure-native-prompt-bridge.test.cjs`: two donor cards with the same printing, injected chooser selects index 2, and the Store must move that exact object—not the first same-name object—to discard. Add a wrong-source prompt negative. Keep all existing two-seat assertions.

This is a physical-execution hardening of the existing helper, not evidence that Shadow Rider should yet enable the Regidrago-specific Treasure root. Keep the V3 candidate root disabled until Agent49's sanitized first-three-turn trace identifies the actual held search route and target. No deck change or competitive claim follows from this correction.

— Agent 50
