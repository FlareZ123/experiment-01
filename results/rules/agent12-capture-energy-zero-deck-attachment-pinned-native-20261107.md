# Capture Energy RCL: zero-deck Energy attachment quota corruption, pinned native evidence and opt-in repair

**Agent12 | 7 November 2026.** Evidence class: supplied printed card/rules, pinned Twinleaf code, constructed live-Store both-seat native controls and default-off research hook. **Zero source-dealt full games and zero qualified competitive games.**

## Paper rule and original field

[Capture Energy, Rebel Clash RCL #171](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/swsh2/171/) provides Colorless Energy and, *when attached from hand*, searches for a Basic Pokémon to Bench and shuffles. The supplied Advanced Player's Rulebook I.C permits one ordinary hand Energy attachment per turn, I.E checks empty-deck loss at the **beginning-of-turn draw**, I.H permits a restricted deck search to find zero, and II.A calls for resolving possible parts of an effect. After a player draws the last deck card, their deck may remain empty during the rest of the current turn. Attaching Capture Energy is still permitted; its secondary Basic deck search finds nothing.

The [authenticated 29 original Aichi card-name/count lists](../aichi-2026/full-decklists.json) contain **13 Capture Energy copies across seven source ranks**: rank2 Vileplume Control ×2, rank3 Snorlax Stall ×3, rank6 Iron Thorns ×2, rank7 Snorlax Stall ×2, rank15 Lopunny Vileplume ×1, rank24 Iron Thorns ×1, and rank29 Iron Thorns ×2. Missing original ranks23/25/28 cannot be treated as inspected. This establishes field relevance, **not frequency of the zero-deck state or actual effect on any match**.

## Why the pinned engine behaves differently

The pinned Twinleaf Git commit was `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

- `vendor/twinleaf/ptcg-server/src/game/store/reducers/play-card-reducer.ts` stamps `player.energyPlayedTurn = state.turn` before passing `AttachEnergyEffect` into `Store.reduceEffect`.
- `vendor/twinleaf/ptcg-server/src/game/store/store.ts` executes `propagateEffect`, which calls source card callbacks, **before** `playEnergyReducer` would physically attach the Energy from hand.
- `vendor/twinleaf/ptcg-server/src/sets/09-sword-and-shield/set-rebel-clash/capture-energy.ts` invokes `SEARCH_YOUR_DECK_FOR_POKEMON_AND_PUT_ONTO_BENCH` when active with open Bench slots.
- `vendor/twinleaf/ptcg-server/src/game/store/prefabs/prefabs.ts` calls `BLOCK_IF_DECK_EMPTY(player)` *before* a normal zero-to-one optional `ChooseCardsPrompt`. With a zero-card deck, this throws `GameError('NO_CARDS_IN_DECK')` while the current-turn Energy quota has already been stamped.

Consequently, an otherwise paper-legal Capture Energy hand attachment can be rejected without moving the card while still burning that turn's normal Energy allowance.

## Verified physical source, both native seats

[Constructed Store fixture](../../simulation/twinleaf/agent12-capture-energy-empty-deck-native.cjs) uses genuine printed pinned Capture Energy, real `PlayCardAction`, actual source physical hand/Active/Deck, turn3, open Bench and native `ResolvePromptAction`, on both physical seats. It constructs a local conditional board, **not a dealt original source 60 or a complete game**.

| Property | Zero own deck, original engine | One Basic in own deck, original engine |
| --- | --- | --- |
| Store action | Throws `NO_CARDS_IN_DECK` | Accepted |
| Energy remains in hand | Yes | No |
| Energy physically attached to Active | No | Yes |
| `energyPlayedTurn` | **3** | 3 |
| Native Basic actually put on Bench | No | Yes |
| Native search/shuffle/Wait prompts | None | All resolved |
| Qualified games | 0 | 0 |

Initial [CI 42329314804](https://github.com/FlareZ123/experiment-01/actions/runs/42329314804) **failed** because a first draft erroneously expected physical attachment before the error and omitted a native `ShuffleDeckPrompt` continuation. Correcting the test to actual pinned reducer order and genuine shuffle permutation led to [CI 42329516991](https://github.com/FlareZ123/experiment-01/actions/runs/42329516991), frozen checkout head `424b9fb4e69b2a4ddcdc60335b2f1cf8aedeb25e`, **SUCCESS: 4/4 pinned both-seat native cases**. The event's raw logs preserve both hand/attachment/turn-allowance snapshots and the Basic Bench/Shuffle/Wait prompt completions.

## Scoped research-owned paper correction

[Default-off reversible hook](../../simulation/twinleaf/agent12-capture-energy-empty-deck-paper-hook.cjs) temporarily wraps and restores `CaptureEnergy.prototype.reduceEffect` without modifying vendor code. It suppresses only the impossible optional search when the native callback receives an `AttachEnergyEffect` whose physical Energy is that exact Capture object **still in the player's own hand** and the owner has **zero cards left in deck** and **at least one open Bench slot**. A full Bench already makes the native printed secondary search a no-op, so the narrowed hook deliberately does not activate in that state. Main native Energy attachment remains untouched. It does not implement alternate-zone attachments or general game policy.

[Seven deterministic pure regressions](../../tests/agent12-capture-energy-empty-deck-paper-hook.test.cjs) verify the empty-own-deck skip, nonempty-deck delegation, nonhand rejection, wrong card object, unrelated effect class and unconditional wrapper restoration. All **7/7 pure cases passed** on exact remotely fetched CJS, and in pinned CI.

[Third CI 42329720687](https://github.com/FlareZ123/experiment-01/actions/runs/42329720687), checkout `4dd55a0f9d40d0ec242317b4094afb85f26781e3`, **SUCCESS** for the original six pure tests and [four true pinned both-seat Store repair controls](../../tests/agent12-capture-energy-empty-deck-paper-hook.native.test.cjs). Observed in each seat:

- Original native empty deck: Capture remains in hand, `NO_CARDS_IN_DECK` exception, no attached Energy, `energyPlayedTurn=3`.
- Hooked native empty deck: **no exception**, physical Capture attached, no search/Bench changes, `energyPlayedTurn=3` normally.
- Hooked one-Basic deck: original native `ChooseCardsPrompt` selected exact physical Basic, Bench moved, `ShuffleDeckPrompt` and `WaitPrompt` settled, with **zero hook skips**.

The existing manual `.github/workflows/agent12-bellelba-paper-payment-native.yml` carries these tests, and their original other native tests passed at the final run.

## Additional adversarial negative controls, 7 November

The narrowed opt-in hook now requires an **open Bench slot** as an additional exact activation condition. This agrees with native behavior for a **full Bench**, where Capture Energy's Basic search is bypassed correctly even if the owner's deck is empty. The [native fixture](../../simulation/twinleaf/agent12-capture-energy-empty-deck-native.cjs) also now supports a one-card deck containing only a non-Basic Energy, for which a valid `ChooseCardsPrompt` answer selects **zero** Pokémon and still shuffles normally.

Fourth independent [manual native CI 42330262745](https://github.com/FlareZ123/experiment-01/actions/runs/42330262745), checkout `13935c672f1973ee1127d6e3d9f51d0e4b550e97`, completed with **SUCCESS**: eight original native controls and seven pure hook regressions green, alongside all four patched live-native comparisons and existing other paper checks. Both owner physical seats passed four distinct constructed conditions: open Bench/zero deck throws incorrectly; full Bench/zero deck attaches legally in the original engine; open Bench/non-Basic-only deck attaches legally with a zero-selected search; open Bench/one Basic deck attaches and benches that Basic after real native search, shuffle and wait. The scoped correction leaves the latter three printed behaviors unchanged. No natural Aichi source game or qualified complete match is implied by the expanded test matrix.

## Research consequence

This finding identifies one credible pinned-native fidelity error affecting a printing used in seven of the 29 authenticated historical source lists. It is unmeasured whether actual original-source games encounter the zero-deck case or use the Energy at that moment. The repair has **not** been activated in v8 common-policy evaluation; no prior native result should be retroactively changed. Stewards should prospectively test the hook with actual source owner turn, hand card custody, remaining deck count, available Bench, real native Store result, opponent reply and official clock before choosing policy integration. All 32 original 60s, full-game completion, strong bilateral policies and qualified game evidence remain release prerequisites.

**This is a reproducible conditional engine-fidelity correction. It is no evidence that the 99.5% target has been reached.**
