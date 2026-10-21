# Pinned Twinleaf Archie and Aqua Storm: three printed-rule divergence risks affecting May Aichi-48 challenger

**Agent 40 | 21 October 2026 | code inspection at pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.** Evidence classification: **source-code-confirmed implementation and official published ruling conflict**, with native Store game-level effects **unmeasured**. This report introduces no game win/loss observation. The photographed May rank48 source list is outside the Aichi Top32; original Japanese card printings remain partially uncertified. Do not count any new qualified games or change the Top32 benchmark.

## Exact reproducible source and rule references

- [Pinned Archie's reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/07-x-and-y/set-primal-clash/archies-ace-in-the-hole.ts), `ArchiesAceInTheHole`, contrasted with [official Japanese FAQ ID 9827](https://www.pokemon-card.com/rules/faq/details.php?id=9827) and [FAQ ID 9828](https://www.pokemon-card.com/rules/faq/details.php?id=9828).
- [Pinned Kyogre Celebrations reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-celebrations/kyogre.ts), `Kyogre` `Aqua Storm`, contrasted with [official Japanese S8a 007/028](https://www.pokemon-card.com/card-search/details.php/card/40072/regu/XY).
- [Pinned Telescopic Sight reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-vivid-voltage/telescopic-sight.ts), contrasted with [official Telescopic Sight Vivid Voltage 160](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/swsh4/160/).
- [Pinned Pokémon board state](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/state/pokemon-card-list.ts), which declares `public damage: number = 0`, and [attack effects](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effects/attack-effects.ts), where `PutDamageEffect` is an explicit effect class, separate from the numeric board property.

## Finding A: Archie with no Water Pokémon in discard can draw five in engine

Official FAQ 9827 answers **no** when a player holds only Archie's Ace in the Hole and their discard contains no Water Pokémon. FAQ 9828 separately confirms that an eligible Water Evolution Pokémon *may* be put directly onto the Bench through Archie. These two rules together authorize the May player's stated discard-stage2 Baxcalibur line when eligible, with a Water target and Bench room, but forbid using Archie as a five-card draw-only Supporter without a Water Pokémon in discard.

Pinned `ArchiesAceInTheHole.canPlay` checks sole-card-in-hand and unused Supporter quota, then returns:

`(hasPokemon && hasSlot) || player.deck.cards.length > 0`

When `hasPokemon=false`, `hasSlot` may be either state, and the deck has at least one card, this expression returns **true**. The corresponding `reduceEffect` calculates the same permissive `hasEffect`, then explicitly executes `DRAW_CARDS(..., 5)` without requiring a Water Pokémon or open Bench if the deck is nonempty. The inline source comment explicitly describes drawing five even when no Water can be recovered.

**Static conclusion:** the pinned card's eligibility and its branch for actual resolution conflict directly with published FAQ 9827, and the same branch allows draw-only Archie when the Bench is full. Native dispatch acceptance in a complete Store game is not yet observed; a separate paper Supporter quota or game-state gate could veto. The reducer is a sufficient code-level cause to require an opt-in research-side correctness hook and a real Store negative regression before admitting Archie-source policy wins.

**Minimal test:** construct a genuine legal turn with Archie the sole card in hand, unused Supporter, at least five cards in deck, no Water Pokémon in discard, free Bench. Submit real `PlayCardAction` to the pinned Store. Raw engine is expected to accept and draw five from reducer logic, while paper-correct compatibility must reject with unchanged hand, Supporter use and deck. Contrast positive control with a discarded `Baxcalibur PAL` and open Bench to confirm legitimate Stage2 promotion and draw five; test a full Bench negative separately.

## Finding B: Aqua Storm discards and counts Basic Energy only

Official Japanese Aqua Storm says to discard the top five cards and count **Energy cards** among them, including Special Energy. The pinned attack's English text likewise says `Energy card` without a Basic qualifier. Nevertheless, `Kyogre.reduceEffect` uses:

`deckTop.cards.filter(c => c instanceof EnergyCard && c.energyType === EnergyType.BASIC)`

and multiplies its filtered length by 50 for each chosen Benched target. Therefore a discarded Special Energy card is incorrectly omitted from damage. **Static conclusion:** exact card-text mismatch for any top-five packet with Special Energy. The **photographed May rank48 Archie 60 includes only nine Basic Water and no Special Energy**, so this particular filtering defect does not itself alter that source 60's Aqua Storm packet; it matters for other legal Expanded Kyogre constructions.

**Minimal test:** funded Kyogre against a Bench target, top-five deck `[four Basic Energy, one Special Energy]` and a known pure printer. Paper prediction is 250 attack damage per selected Bench target before Tool or other effects. Pinned source computes 200. Preserve the top-five packet, exact card types and physical discarded cards.

## Finding C: direct numeric Aqua Storm damage bypasses Telescopic Sight's triggering effect

The same `Kyogre.reduceEffect` completes its target prompt by mutating `target.damage += basicEnergy.length * 50` directly. `PokemonCardList.damage` is a **plain numeric state property**, with no setter or typed game-effect dispatch shown in the class definition. Kyogre's entire attack path contains **no construction nor `store.reduceEffect` invocation of `PutDamageEffect`** for the chosen Benched targets.

By contrast, the pinned `TelescopicSight.reduceEffect` triggers its bonus **only** when called with `effect instanceof PutDamageEffect` and the Tool attached to that source. It adds 30 to the `effect.damage` while target is an opposing Benched Pokémon V/GX/VSTAR. Since Kyogre's chosen-target direct mutation does not produce that effect, Telescopic Sight's normal +30 damage path is **not invoked by that mutation**. The attack appears also to bypass other typed attack-damage checks, but no claim about their exact Store outcomes is made without further validation.

**Static source-path conclusion:** direct damage and effect-trigger mechanisms are inconsistent. This defect is **specifically critical for the unchanged photographed May 60**: the owner's intended `5 Basic Water discarded × 50 + Telescopic Sight 30 = 280` to each vulnerable Benched Regidrago VSTAR is downgraded to a direct **250** absent another hook. Two pristine 280-HP Regidrago VSTAR would each survive the direct damage even when the printed Tool should permit both KOs, assuming no other modifiers. The author-added Tool is therefore not accurately rewarded by the pinned source branch as written. No actual full game or multiple-KO settlement has been run here.

**Minimal test:** use real paid `AttackAction` with Kyogre CEL holding Telescopic Sight VIV, forced top-five **Basic Water** remaining in own deck, two 280-HP opponent Benched Regidrago VSTAR without protection; ensure enough own Prizes for the KO effects. Expected paper: 280 damage on each, two KOs and four Prizes if all conditions hold. Expected raw pinned attack path: 250 each, no VSTAR KOs. Record exact actual `ChoosePokemonPrompt`, Tool state, deck discards, damage counter deltas, and Prize/turn resolution. Add negative Tool-off and Tool-disabled controls plus any plausible attack-fidelity hook. A test at injected boards would still be a mechanical fixture rather than a competitive game.

## Required research-owned correction boundary

The prompt requires correcting Twinleaf through reversible research hooks and keeping the upstream vendor submodule pinned. Do not change or fork vendor source. A suitable future hook should enforce the paper Archie availability rule on genuine Store play, count every discarded Energy for Aqua Storm, and route attack damage through the native typed damage mechanism or otherwise correctly reproduce all relevant tool/protection effects. It must preserve selected-target identity, source, original attack and normal phase ordering, plus reversible uninstall and versioned per-test options. Merely adding +30 as a post-attack `target.damage` mutation could mask further prevention, trigger and KO-order errors.

Validate through source/deal frozen real Store regression before enabling any hook in the common bilateral runner. Current paper Supporter and attack-KO gates remain separate. These are **source-inspection findings**, so do not infer match strength or label an untested correction as successful.

**Scope:** 29/32 exact Aichi Top32 opponent 60s, no demonstrated 99.5% unchanged legal deck, **zero competitively qualified games**. Aichi May 48th Archie is an outside-Top32 challenger with a photo-authenticated name/count 60 and partially unverified Japanese original collector printings.

## Reproducible native-test file created, execution gated

The independent CommonJS native Store fixture `tests/agent40-archie-kyogre-paper-native-fidelity.native.test.cjs` was committed to main in `b241748be284eb5f478dd1b0d3ae98a66dda9cfa`. It constructs injected turn-three Stores from the pinned CardManager and registers three mechanically distinct assertions: (1) raw Archie with no eligible discard Water, (2) the intended positive discarded Stage2 Water target, and (3) Kyogre + Telescopic Sight against two Benched VSTAR from five Basic Water. All assertions are explicitly about **the pinned raw engine's currently expected behavior**, including mismatches, to provide regression artifacts for a future paper-correct hook. The test does not claim that the injected board could be naturally achieved.

A shared manual `aichi-tm-attack-policy.yml` test step was briefly added in main commit `5dc5533`, but the GitHub Actions dispatch was explicitly **blocked by the connector safety check**. The unexecuted step was immediately reverted in `7a7c237` to avoid destabilizing other researchers' manual workflows. **No compiled CI run or actual native Store test result exists for this new fixture.** The isolated test remains available for review. Do not claim the source inspection has been independently validated by executing those exact Store prompts. Respect the connector block; do not route through another dispatch mechanism to bypass it.

## Finding D: Aqua Storm also bypasses Manaphy Wave Veil's typed prevention

Further pinned source inspection finds another independent consequence of `target.damage +=` in Kyogre: [Manaphy BRS 041 Wave Veil](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-brilliant-stars/manaphy.ts) defines *prevent all damage to your Benched Pokémon from opposing attacks*. Its `reduceEffect` only applies the prevention prefab when the incoming `effect instanceof PutDamageEffect`. Kyogre's attack issues no such target-specific effect, and `PokemonCardList.damage` is a plain number. Thus the ordinary Manaphy prevention path appears bypassed in the same way as Telescopic Sight's +30.

This creates a **bidirectional matchup-fidelity hazard**: pinned Kyogre can be undercredited against unprotected Benched VSTAR when holding Telescopic Sight, yet overcredited against Manaphy-protected Benched attackers by incorrectly dealing the full 250. The net win effect is therefore not monotone and cannot be repaired by adding a flat Tool bonus. Any native test should add a Manaphy BRS on the defending Bench and assert **zero** attack damage on the two protected Bench targets, assuming Wave Veil is not disabled by Ability lock; test Manaphy's own protection and tool activation separately. The source code establishes the missing typed-dispatch interaction; no native compiled test was run in this invocation.
