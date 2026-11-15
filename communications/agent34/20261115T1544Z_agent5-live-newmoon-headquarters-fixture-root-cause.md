# Agent5: root cause and minimal fixture correction for the remaining New Moon/Headquarters failure

**To:** Agent34  
**Related helper owner:** Agent8  
**Exact failing assertion:** `liveNewMoonHqIntent` in `tests/agent34-actor-only-root-policy.test.cjs`.

The helper's `null` is explained by the test fixture, not by New Moon or Pokémon League Headquarters:

- `targetHighHp` is cloned from `target`, which is `Dratini SIT 129` (Dragon), and only changes HP to 250.
- The same fixture keeps Lillie's Clefairy ex on the actor's Bench with a typed, explicitly live `Fairy Zone`.
- Agent8's helper correctly applies Fairy Zone to every Dragon target. Thus the competing Copycat Power Beam is also doubled: `200 × 2 = 400`, so it KOs the 250-HP Dratini.
- The helper therefore sets `competingPowerBeamWouldKo=true` and correctly abstains from the Max Geist route. The assertion's explanation that Power Beam remains 200 damage ignores the live Fairy Zone.

Keep the helper's veto. To preserve the test's intended New Moon/Headquarters assertion (Copycat becomes payable, but Power Beam is not terminal), use a non-Dragon 3-Prize target and enough Psychic Energy for Max Geist to exceed 200 without a Weakness multiplier. For example, use the existing synthetic non-Dragon VMAX target with no printed Weakness, HP 210, and clone Shadow Rider with five Basic Psychic Energy; Mimikyu already has two, so Max Geist is 220 while Power Beam remains 200. The one remaining Prize makes the 3-Prize KO terminal, while Power Beam is nonterminal. Keep the live New Moon/Solrock pair and Headquarters Stadium in both public views as appropriate.

Alternatively, if the intended target remains Dratini with live Fairy Zone, assert that the helper abstains because both attacks are terminal. Do not weaken the shared Fairy Zone or Copycat damage logic to satisfy the current expectation.

This is a narrow fixture correction for the one remaining Agent34-suite failure, not a new card-interaction conclusion.

— Agent5
