# Pinned Twinleaf Wally permits an illegal Exeggutor evolution onto unrelated Pokémon-EX

**Agent 18 | 2 November 2026 | compiled pinned native 2-seat physical-effect counterexample | no qualified matches**

## Paper rule

Wally ROS94 (Japanese ミツル XY6) allows searching for an evolution of one of your Pokémon, **excluding Pokémon-EX**, and evolving even on the first own turn or on the turn that Pokémon entered play. An Exeggcute VIV4 can legally receive Exeggutor PLF5. An unrelated **Mewtwo-EX BKT** is Pokémon-EX and has the wrong evolutionary name, so **no legal Pokémon TCG effect of Wally permits Exeggutor to evolve it**. Sources: included `resources/cards/en/xy6.json`, [official Japanese original Wally card](https://www.pokemon-card.com/card-search/details.php/card/31632/), and the supplied 2025 Advanced Player Rulebook, evolution and card text precedence. The modern rule that the first-moving player cannot normally play Wally as a Supporter on the first turn still applies, as specifically clarified by [Wally's updated rulings](https://bulbapedia.bulbagarden.net/wiki/Wally_%28Emerald_Break_89%29).

## Exact pinned code defect

At pinned Twinleaf Git submodule commit **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**, [`wally.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/07-x-and-y/set-roaring-skies/wally.ts) uses this blocked-target condition:

```ts
if (card.name !== evolution.evolvesFrom && !card.hasTag(CardTag.POKEMON_EX)) {
  blocked2.push(target);
}
```

The conjunction leaves **every Pokémon-EX unblocked**, regardless of name, because the second operand is false. The native [`ChoosePokemonPrompt.validate`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prompts/choose-pokemon-prompt.ts) only checks the supplied blocked list and slot presence. The actual [`Store.reducePrompt`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/store.ts) does not enforce evolution-name legality at that prompt. Therefore paper-incompatible recipient selection can flow to Wally's `MOVE_CARDS` effect.

## Compiled physical witness, not inferred from source inspection

The [native reproducible test](../../tests/agent18-native-wally-prompt-target.test.cjs) uses the exact compiled source classes `Wally ROS`, `Exeggcute VIV`, `Exeggutor PLF`, and `Mewtwo-EX BKT`. Both the source and defender are actual Store player objects, and source receives the genuine first-turn-going-second `Wally` PlayCardAction, real ChooseCardsPrompt selecting the physical Exeggutor, followed by ChoosePokemonPrompt.

[GitHub Actions run 41397982154](https://github.com/FlareZ123/experiment-01/actions/runs/41397982154) **SUCCESS** at selected checkout `11068bf633d752007cd4ffa14ee6dcbcaf8e6f32`; the native Wally subtest itself is **1/1 PASS**. The test makes these observations at **both** source physical seat 0 and seat 1:

| Native Wally target | Prompt validates? | Actual Store result |
| --- | --- | --- |
| Exeggcute VIV (correct Basic) | Yes | Exeggutor PLF becomes its Stage1, legal positive control |
| Mewtwo-EX BKT (unrelated old Pokémon-EX) | **Yes, erroneously** | **Exeggutor PLF physically stacked onto unrelated Mewtwo-EX**, paper-illegal |

The event is repeated across four staged independent Store scenarios: two legal controls and two paper-illegal selections, one each physical seat. The test logs `AGENT18_WALLY_NATIVE_PROMPT` with target, selection, seat and actual physical outcome. The scenario is conditioned, lacks natural full 60s, and does **not** create any valid game result or win-rate estimate. Previous intermediate runs stopped later on unrelated Shuffle/CoinFlip prompts; the successful final focused test terminates as soon as the physical Wally evolution has been witnessed, avoiding conflation of unrelated checkup prompts with the evolution effect.

## Research-owned correction boundary

Added a **default-off, reversible** [Wally recipient paper guard](../../simulation/twinleaf/agent18-wally-target-paper-guard.cjs) that temporarily intercepts native Store `ResolvePromptAction` only for `ChoosePokemonPrompt` stamped with source `Wally ROS`, and rejects any Pokémon-EX recipient or a recipient already blocked by the native prompt. The hook performs no opponent hidden-zone or deck-order lookup and restores the exact original Store.prototype.dispatch descriptor even if a callback fails. Pure [guard regression tests](../../tests/agent18-wally-target-paper-guard.test.cjs) cover scoped accept/deny, unrelated effects and restoration. The guard is research-owned and does **not** modify the upstream submodule.

The guarded native both-seat comparison has been added to the same existing manual Blockade workflow but its newest compiled confirmation is **pending** at report creation. Keep the verified uncontrolled illegal-selection witness distinct from guard-effect claims until that run passes. This is a narrow targeted correction for Wally; all other possible native evolution issues require independent audits.

## Why this matters to fixed-deck optimization

The current [Exeggutor/Vileplume v2 original-derived 60](agent18-exeggutor-vileplume-native-v2.json) contains **zero Wally**. This defect does **not** invalidate the documented untutored Wally probability calculation directly, which assumed legal Exeggcute evolutions and no simulator. It **would** contaminate the assessment of a future Wally-added Exeggutor 60 or any original-source player whose Wally prompt could target Pokémon-EX. A naive native setup or win audit might accept illegal Stage1 board creation as an advantage.

A qualified policy experiment must pin the exact Store and hook, make real owner-visible selections, verify every root/prompt/payment/effect/rng step, and retain rejected illegal actions and incomplete games in the unconditional denominator. The guard is **not integrated into the shared common-policy release** yet; do not infer competitive qualification or field performance from this fixture.

**Competitive-qualified games: zero. No demonstrated 99.5% field win rate.**
