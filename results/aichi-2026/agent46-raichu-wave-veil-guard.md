# Agent 46: conservative Wave Veil veto for Electro Rain Prize projection

**18 October 2026.** Source inspection plus independently executed **pure-policy regression**; the new compiled Store regression has **not** been run. The change is confined to the pre-existing optional Raichu target planner. No qualified game or win-rate result.

## Falsified assumption

The [previous Agent 46 planner](agent46-raichu-prize-allocation-policy.md) scored a fixed, six-Energy/16-Lightning-unit Electro Rain as a **five-Prize** projected 300+180 attack on Benched Shadow Rider Calyrex VMAX and V with Telescopic Sight. That is only valid when the attack's damage actually reaches both targets.

Pinned Twinleaf source `ptcg-server/src/sets/09-sword-and-shield/set-brilliant-stars/manaphy.ts` defines Manaphy's **Wave Veil**: it prevents all damage done to the defender's Benched Pokémon by opposing attacks. It uses the engine's `PREVENT_DAMAGE_TO_YOUR_BENCHED_POKEMON_FROM_OPPONENT_ATTACKS` prefab for `PutDamageEffect`. The uploaded Advanced Player's Rulebook, section C-16, confirms that damage-prevention effects can reduce final attack damage to zero. Agent 46's existing Electro Rain correction deliberately produces `PutDamageEffect` rather than a counters effect.

Before this change, adding Manaphy BRS with Wave Veil to the same opponent Bench **did not alter** the pure planner's `[300,180]` damage allocation or five-Prize forecast. This demonstrates a false-positive projection conditional on Wave Veil being active. This is not an observed win, a real decision in a source-dealt game, or a compiled-engine reproduction.

## Patch and focused check

- `simulation/twinleaf/raichu-prize-allocation-resolver.cjs` now scans the publicly visible opponent's Active and Bench for a Manaphy with a `Wave Veil` power. If present, it **declines the special Prize-maximizing plan** (`null`) and delegates to the existing generic damage resolver. It does **not** assert that the generic resolver makes a strong choice.
- `tests/raichu-prize-allocation-planner.test.cjs` adds a third opposing Benched Pokémon, an explicit 70-HP Manaphy BRS with Wave Veil. It asserts that the previously predicted multi-Bench win is no longer projected.
- The exact committed `planElectroRainDamage`, `nominalKnockoutPrizes`, and complete pure test were executed in a JavaScript evaluation harness using the pinned helper's arithmetic and a minimal standard-assert shim. **All assertions passed**. In the unprotected control the planner still returned `[[BENCH,0,300],[BENCH,1,180]]`; in the protected case it returned `null`. This independently verifies the pure branch only. The compiled engine, bot fallback and live Ability-lock interactions are untested.
- Previous no-Sight, Jamming Tower, off-archetype and inadequate-budget test cases remain passing in that pure harness.

## Intentional conservative boundary

A visible Manaphy might have its Ability suppressed by a live lock. The planner deliberately *does not* infer such suppression from incomplete local state. This can reject an otherwise good protected-looking five-Prize line when Wave Veil is actually disabled. There are also other Bench protections, attack prevention and damage modifiers absent from this narrow detector, so this patch is no general damage-fidelity certificate.

The 29 published Aichi Top-32 full lists contain **no card named Manaphy**, so the documented guard is an important generalized failure-mode correction, **not** evidence of improved coverage for a verified published matchup. The three unpublished lists (ranks 23/25/28) remain unknown. Actual-source opportunity frequency for this guard is unmeasured.

## Next gate

Run the already-existing manual-only Raichu compiled Store test through a permitted route and add a conditioned Manaphy board with and without an independently verified Ability lock. Check actual root prompt choice, resolved damage, Prize movement, fallback, engine semantics and unchanged behavior on no-protection controls before treating the policy as credible opponent play. Preserve the distinction between opt-in **policy validity** and **competitive performance**.

**Benchmark unchanged:** 29/32 exact source lists; zero independently qualified competitive games; the 99.5% objective has not been demonstrated.
