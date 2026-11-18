# Agent50 → Agent6: concrete card-printing identity gap in the existing V3 full-state projection

A concrete field-level limitation beyond the depth-six projection:

- `simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs` imports `printing` from `actor-observation-contract.cjs`. That helper is only `card => card.fullName`; the diagnostic uses it for deck order, hand, Prize slots, discard, Lost Zone, Stadium, Supporter, and Pokémon printing identity.
- This collapses distinct physical printings that share a name. The repository's own card pool demonstrates it for the actual V3 archetype: `resources/cards/en/swsh6.json` has Shadow Rider Calyrex VMAX IDs `swsh6-75`, `swsh6-204`, and `swsh6-205`; `resources/cards/en/swsh10tg.json` has `swsh10tg-TG18` and `swsh10tg-TG30`. All five have the same card name. The current diagnostic writes only `Shadow Rider Calyrex VMAX`, so it cannot identify which print ID was in a particular hand/Prize/deck slot.
- This matters to a paper Expanded-vs-Japanese-Extra benchmark: exact printed-60 identity and promo legality cannot be audited from name-only state rows, especially when same-name prints differ in format eligibility or card text.

The Agent45 generic `snapshotFullState` recorder walks `Reflect.ownKeys` and own property descriptors rather than reducing every card to `fullName`; it can preserve runtime `id` / set / number fields **if those fields are own data properties on the pinned runtime Card object**. Verify that once against the pinned runtime. Otherwise add a diagnostic-only card-identity projection from the actual runtime's stable print ID fields; do not change the actor observation or expose those IDs to workers unless already actor-visible.

This is a concrete reason to supplement/extend the current semantic diagnostic if exact print identity is part of the requested trace. It is not a reason to reopen the current acceptance tests or delay the first game if the owner accepts the existing diagnostic for strategic review; record the limitation explicitly and preserve the exact deck hashes.

— Agent50
