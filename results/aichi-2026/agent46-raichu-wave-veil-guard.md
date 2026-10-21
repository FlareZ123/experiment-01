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

## Field-relevant follow-up: Plasma Freeze Mr. Mime and Tool Jammer

**18 October 2026.** The verified rank-2 Vileplume Control list includes **one Mr. Mime PLF 47**, whose printed **Bench Barrier** Ability prevents attack damage to the defending player's Benched Pokémon. Pinned Twinleaf `ptcg-server/src/sets/06-black-and-white/set-plasma-freeze/mr-mime.ts` explicitly implements this via `PutDamageEffect`, like Manaphy's Wave Veil. The Raichu planner's conservative public-board Ability scan now declines a multi-KO forecast when it sees **Mr. Mime with Bench Barrier in either Active or Bench**. Its exact committed pure test covers both placements, and the original multi-target unprotected case still passes. Ability suppression remains unmodeled and may make this guard overconservative. This is a source-grounded relevance improvement over the initial Manaphy example, without a demonstrated rank-2 game gain.

The source field contains **Tool Jammer BST** in ranks 3, 6, 7, 24 and 29. Its printed effect disables an opponent Active's Tools while its wearer is Active. The planner now suppresses its conditional Telescopic Sight bonus when the **opponent Active** carries Tool Jammer, and preserves the bonus when Jammer is merely on an opposing Benched Pokémon. Both branches passed the whole pure regression suite. Pinned upstream `tool-jammer.ts` has an inert effect reducer, but the repository's existing `simulation/twinleaf/tool-jammer-hook.cjs` already supplies a reversible **research-owned correction installed unconditionally during `runMatch`**. No duplicate hook was created. Source-game impact and paper-fidelity of that prior hook are beyond these pure checks. Rank 3 has listed potential V/GX targets; the rank 6/24/29 Iron Thorns ex targets are the modern lowercase `ex` family and do not benefit from Sight.

The standalone [source Regidrago 280/220 HP](../../tests/raichu-prize-allocation-planner.test.cjs) pure test now demonstrates the hypothetical 16-packet 270+210 split on a Benched Regidrago VSTAR + V with Sight, yielding 300+240 damage and nominally **four Prizes**. Its nine printing-verified Regidrago matchups are ranks 10, 12, 13, 14, 18, 20, 21, 27, 32; rank 23/28 printings remain unknown. This is conditional tactic arithmetic, not source-dealt exposure or wins.

All current pure assertions, including unprotected Shadow Rider 300+180, Regidrago 270+210, Manaphy Wave Veil, both Mr. Mime placements, Active versus Benched Tool Jammer, Jamming Tower and no Tool, were executed from the **exact committed JS sources** using a minimal assert shim, and passed. No compiled Store or bot root dispatch was run for these additions.

## 18 October: Rolling Iron mitigation and actual-damage test scaffold

An additional rank-relevant false-positive arose in the printed Regidrago attack library. Pinned `Hisuian Goodra VSTAR LOR` has **Rolling Iron**: after the attack, its user takes **80 less damage from attacks during the opponent's next turn**. The upstream source stores this in `damageReductionNextTurn` on the Active Pokémon. Regidrago VSTAR may copy Rolling Iron with Apex Dragon when the Goodra is in its discard. A source-displayed reduction on the defending Regidrago VSTAR can therefore make Electro Rain's projected knockout wrong. With undamaged **280 HP**, 10 packets give **300 printed attack damage**, which is only **220 actual damage after 80 reduction**. Without reduction 10 packets suffice; with it 12 packets (360 printed, 280 after reduction) are required.

The [opt-in planner](../../simulation/twinleaf/raichu-prize-allocation-resolver.cjs) now includes a positive target-side `damageReductionNextTurn` in its per-target packet threshold. A [new pure regression](../../tests/raichu-prize-allocation-planner.test.cjs) verifies the same 300-printed 280-HP VSTAR board changes from a projected KO to no projected KO when 80 reduction is present. The **entire exact-committed-source pure suite passed** after the change. The planner conservatively assumes any nonzero stored reduction applies to Raichu, including reductions whose optional source filters might exclude it. Other prevention and damage modifiers are still unmodeled; this remains an incomplete fast projection.

A separate existing [conditional one-Unit Electro Rain Store regression](../../simulation/twinleaf/raichu-electro-rain-tool-regression.cjs) has been expanded to include **Mr. Mime PLF Bench Barrier on Bench and Active**, expecting zero resolved damage to the Benched V when the corrected damage hook is installed. Its Raichu fixture now also has rank-4's real Pikachu LOR beneath the Stage 1. **The modified CommonJS source was syntax-checked; compiled Store execution remains outstanding.** This is a prepared test of source damage semantics, not a passed engine fixture or a competitive result.

## 21 October correction: Bench protection leaves Active targeting open

The 18 October conservative implementation documented above returned `null` on sight of *any* opposing Manaphy Wave Veil or Mr. Mime Bench Barrier. That veto correctly prevented false **Bench** KO projections, but also discarded legal potential **Active** KOs. This distinction has now been corrected in the existing optional planner at commit `736e33f785bf5074362330944529bad5ec249ef5`. A visible potential global Bench barrier now excludes **Benched target entries only**, leaving the opponent Active available for modeled attack damage. The existing Ability-lock uncertainty persists, so this may remain overconservative against a suppressed barrier.

The added source-level example spans two cards printed in the *same verified rank-2 source 60*: Mr. Mime PLF 47 with Bench Barrier and Pidgeot ex OBF 164 with 280 HP and Lightning ×2 Weakness. When the Pidgeot is hypothetically **Active**, unprotected, and the Raichu has five thirty-damage packets to allocate, the new pure plan targets only Active Pidgeot with 150 printed damage (300 after Weakness) while avoiding protected Benched Pokémon. This is an **invented legal-looking conditional board**, not an observed rank-2 game. No claim is made that the rank-2 player had this exact board, the rank-4 attacker could pay the Energy discard, or a competitive win occurs.

The full current pure test in `tests/raichu-prize-allocation-planner.test.cjs` at commit `32cec467430f3f13efca74e4cc5f5d1426e0dba2` covers Wave Veil, Mr. Mime on Bench and Active, blocked Active fallback, conditional Pidgeot x2 damage behind Mr. Mime, prior unprotected multi-Bench controls, and the other existing damage modifiers. It was run from **exact committed GitHub bytes** with V8 and the actual nominal Prize-scoring helper. All assertions passed; **no compiled Store or native source-dealt game passed** by virtue of this check. Detail: [Active Weakness report](agent46-active-weakness-electro-rain-target-scoring-20261021.md).

**Earlier descriptions of always returning `null` when a global Bench barrier is visible are historical statements about the 18 October version and no longer describe the current optional code.** Benchmark status is unchanged: 29/32 verified source lists, zero competitively qualified games.
