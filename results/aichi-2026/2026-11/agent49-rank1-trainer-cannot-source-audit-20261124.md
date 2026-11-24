# Rank-1 Trainer legality and cloned-dispatch source audit

**Agent 49 · 2026-11-24**  
**Pinned Twinleaf:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
**Scope:** source-level triage for the post-response Stage-A `CANNOT_PLAY_THIS_CARD` diagnostic. This is not a card-interaction ruling beyond the cited pinned source, a new fixture result, or competitive evidence.

## Decision summary

1. **Generic `PlayCardAction` object consumption is not supported by the pinned source.** The action is a value object with only `type`, `id`, `handIndex`, and `target`; the reducer reads those fields. The existing Quick Ball regression snapshots all four fields across frontier admission and selected cloned-Store revalidation and passes. Repeating the same action instance is not, by itself, a credible explanation.
2. **The rank-1 Item frontier preflight is incomplete.** The pinned ActionEnumerator proposes every Item in hand without consulting `canPlay`. The adapter's Item rejection code deliberately does not swallow `CANNOT_PLAY_THIS_CARD`, but its exact-print preflight currently covers Battle VIP Pass, VS Seeker, Unfair Stamp, Field Blower, and Night Stretcher only. Four more rank-1 Items have native `CANNOT_PLAY_THIS_CARD` predicates and are not in that allowlist: **Mysterious Treasure, Quick Ball, Hisuian Heavy Ball, and Battle Compressor**. Their exact-print preflights should be added after Agent6's current test matrix confirms the source predicates.
3. **One existing preflight is weaker than its effect.** Twinleaf's `NightlyStretcher` implementation allows any Energy in `canPlay`, but its play effect requires a Pokémon or Basic Energy in the discard. Special-Energy-only discard can therefore pass the current preflight and still throw `CANNOT_PLAY_THIS_CARD`. This does not explain the rank-1 run: the published rank-1 60 contains 11 Basic Psychic Energy and no Special Energy.
4. **No pinned card source establishes a condition that should pass the first clone and fail the second when both clones receive equivalent state.** For the remaining candidates, the relevant legality predicates are deterministic and repeated by the effect. A second-only failure therefore points to a state-graph/identity discrepancy, not a generic action-object lifecycle. The most discriminating state families are marker references, Prize `isSecret`, Pokémon damage, discard card classes, and hand/deck identity/counts.

## Exact rank-1 package

The repository's complete rank-1 list is 60 cards in `results/aichi-2026/full-decklists.json`. Relevant Trainers, Tools, and Stadiums:

| Card | Copies | Native source-level `CANNOT_PLAY_THIS_CARD` condition |
|---|---:|---|
| Mysterious Treasure | 4 | Requires another card in hand and a nonempty deck |
| Fog Crystal | 4 | No card-specific `CANNOT_PLAY_THIS_CARD` branch found |
| VS Seeker | 3 | Requires a Supporter in discard |
| Quick Ball | 1 | Requires another card in hand and a nonempty deck |
| Hisuian Heavy Ball | 1 | Requires at least one face-down Prize |
| Battle Compressor | 1 | Requires a nonempty deck |
| Field Blower | 1 | Requires a Stadium or Pokémon Tool in play |
| Night Stretcher | 1 | Requires a Pokémon or Basic Energy in discard |
| Unfair Stamp | 1 | Requires the opponent-KO marker and a nonempty deck |
| Teammates | 1 | Requires the opponent-KO marker and a nonempty deck |
| Raihan | 1 | Requires the opponent-KO marker, a nonempty deck, and a Basic Energy in discard |
| Acerola | 1 | Requires at least one damaged Pokémon |
| Iono | 1 | Requires another card in own hand, own deck cards, or opponent hand cards |
| Carmine | 1 | Requires a nonempty deck |
| Lillie's Determination | 2 | No card-specific `CANNOT_PLAY_THIS_CARD` branch found |
| Guzma | 1 | No card-specific `CANNOT_PLAY_THIS_CARD` branch found |
| Tulip | 1 | No card-specific `CANNOT_PLAY_THIS_CARD` branch found |
| Float Stone | 1 | No card-specific `CANNOT_PLAY_THIS_CARD` branch found |
| Forest Seal Stone | 1 | No card-specific `CANNOT_PLAY_THIS_CARD` branch found |
| Sky Field | 2 | No card-specific `CANNOT_PLAY_THIS_CARD` branch found |
| Dimension Valley | 1 | No card-specific `CANNOT_PLAY_THIS_CARD` branch found |

The same pinned `play-card-reducer.ts` has one generic Supporter-only `CANNOT_PLAY_THIS_CARD` case: a non-first-turn Supporter cannot be played on turn 1. The current failure's exact turn should be retained in the diagnostic; this generic restriction is not a Tool/Stadium rule.

The rank-1 Energy line is 11 Psychic Energy (MEE 13), all Basic. That matters for the Night Stretcher discrepancy below.

## Frontier mechanics and why the missing Items matter

Pinned Twinleaf `ptcg-server/src/advanced-bot/action-enumerator.ts`:

- `enumerate` calls Item, Stadium, and Supporter enumeration at lines 24–26.
- `playItemActions` at lines 148–160 adds every Item `TrainerCard` in hand.
- `playSupporterActions` at lines 188–205 adds every Supporter if the Supporter-use gate is clear.
- Neither method checks card-specific `canPlay`.

The research adapter repeats this uncapped behavior in `simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs:143-165`.

The current `agent36-native-action-frontier.cjs:263-301` preflights only exact Item prints for Battle VIP Pass, VS Seeker, Unfair Stamp, Field Blower, and Night Stretcher. Its rejection code at lines 365–381 accepts only `BLOCKED_BY_EFFECT` for generic Items; `CANNOT_PLAY_THIS_CARD` remains fatal. Therefore an unplayable, un-preflighted Item can abort the *frontier build* even if the policy would never select it.

The four missing rank-1 Items are not speculative:
- Mysterious Treasure's effect rejects when there is no other hand card or the deck is empty.
- Quick Ball has the same hand/deck boundary.
- Hisuian Heavy Ball rejects when no Prize remains face-down.
- Battle Compressor rejects when the deck is empty.

Each has a corresponding native `canPlay` predicate. Add exact-print entries for FLI 113, FST 237, ASR 146, and PHF 92 (using the actual resolved engine printing fields), and test both explicit-false and valid states. Do not broaden this into accepting arbitrary Item GameErrors.

This is a **frontier completeness** issue, not an attribution of the current post-worker failure: if one of these Items were invalid during initial admission, the current fail-closed Item code would abort before the worker response.

## The one preflight/effect mismatch: Night Stretcher

Pinned source: `ptcg-server/src/sets/10-scarlet-and-violet/set-shrouded-fable/nightly-stretcher.ts`.

- `canPlay` returns true if discard contains a Pokémon **or any Energy**.
- The actual play effect collects Pokémon and Energy cards whose `energyType` is `BASIC`, then throws `CANNOT_PLAY_THIS_CARD` if both collections are empty.

Thus a discard containing only Special Energy is a false-positive for the existing `Night Stretcher SFA 61` preflight. If this preflight remains, its research-side predicate should be effect-equivalent: Pokémon present **or** Basic Energy present. Do not patch upstream Twinleaf.

For this benchmark list, all 11 Energy cards are Basic Psychic Energy, so any Energy in rank 1's discard satisfies the effect. This discrepancy is a general integration hardening item, not a plausible explanation for this rank-1 failure.

## Candidate ranking for the selected-action investigation

The rank-1 opponent policy at `simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs:379-446` provides a useful *selection-priority* ordering. These are policy scores, not evidence of which hidden card was selected:

| Card | Policy score / gate | Source legality state to compare across clones |
|---|---:|---|
| Acerola | 175; Pale Moon context and damaged active Latias | `PokemonCardList.damage` / damage counters |
| Raihan | 155; prior-opponent-turn KO and Psychic Energy in discard | `player.marker` membership and marker source-card identity; deck length; Basic Energy class |
| Unfair Stamp | 142; KO/hand/prize heuristic | KO marker and deck length (also already preflighted) |
| Field Blower | 140; Path-lock context and Underworld Door board | Stadium slot and attached Tool lists (also already preflighted) |
| Teammates | 138; prior-opponent-turn KO | KO marker and deck length |
| Mysterious Treasure | 132; board/target conditions | Hand-card identity/count and deck length |
| Battle Compressor | 118; Tulip or VS Seeker in hand, low Psychic discard | Deck length |
| Quick Ball | 102; board/target conditions and hand length > 1 | Hand-card identity/count and deck length; existing Quick Ball case passes |
| VS Seeker | 100; Psychic discard or prior KO | Discard Supporter class/identity (also already preflighted) |
| Night Stretcher | 96; Psychic Energy in discard and none in hand | Discard Pokémon / Basic Energy class |
| Iono | 90; small own hand or large opposing hand | Own hand, own deck, opponent hand counts and card identity |
| Carmine | 82; own hand <= 4 | Deck length |

Tulip scores 160 but its card implementation does not throw `CANNOT_PLAY_THIS_CARD`; it is a useful negative control. Lillie's Determination and Guzma likewise have no card-specific `CANNOT_PLAY_THIS_CARD` branch in their implementations. Hisuian Heavy Ball is not given a dedicated policy score, but it should still be included in the native matrix because the frontier attempts all Items, not only the policy's eventual choice.

**Clone-fidelity priority (not policy priority):**
1. Raihan and Teammates: marker object, marker key, and source-card reference identity.
2. Hisuian Heavy Ball: per-Prize `isSecret` flags; its effect flips Prize secrecy before the prompt.
3. Acerola: damage counters on active/bench Pokémon.
4. Night Stretcher: `EnergyCard` prototype and Basic-vs-Special `energyType`.
5. Field Blower / Unfair Stamp / VS Seeker: Stadium/Tool, marker, and discard-card state.
6. Mysterious Treasure / Quick Ball / Iono: hand array identity and `this` exclusion.
7. Battle Compressor / Carmine: deck array and length.

## Concrete native regression matrix

For each listed card, use a real pinned native card instance and a legal positive state, then:

1. Build the uncapped frontier from the original Store.
2. Assert the card's action is admitted and retain the exact native action instance/token.
3. Record a *minimal predicate projection* before the first cloned dispatch: hand count and card identity at the action index; deck length; discard card constructors and energy types; marker names plus source-card identity; Prize `isSecret` count; Pokémon damage; Stadium identity; Tool attachments.
4. Dispatch through `dispatchSelectedNativeAction` on a second fresh clone with the same action instance.
5. Compare the two predicate projections. Also repeat with a newly enumerated action from the same unchanged live Store.
6. Assert the full live Store graph, pending prompts, and prompt-group IDs are unchanged by both clone validations.

Use valid positive fixtures:
- Mysterious Treasure / Quick Ball: another discardable hand card, nonempty deck, and an eligible target where relevant.
- Hisuian Heavy Ball: at least one face-down Prize, with a Pokémon in the Prize set.
- Battle Compressor: nonempty deck.
- VS Seeker: a real Supporter in discard.
- Field Blower: a Stadium or attached Tool in play.
- Night Stretcher: a Pokémon or Basic Energy in discard; add a separate Special-Energy-only negative/control case to expose the preflight mismatch.
- Unfair Stamp: the correct KO marker and nonempty deck.
- Teammates: the Teammates KO marker and nonempty deck.
- Raihan: the Raihan KO marker, Basic Energy in discard, and nonempty deck; preserve the marker's source card as the same object referenced by the relevant zone.
- Acerola: at least one damaged Pokémon.
- Iono: at least one of the legal own-hand/deck/opponent-hand resources.
- Carmine: nonempty deck.

Also test the negative boundary for each condition. For Items, explicit `canPlay === false` should be filtered by exact-print preflight; `true` and `undefined` must still reach native dispatch. Keep the Item `CANNOT_PLAY_THIS_CARD` rejection fatal for all unlisted prints.

The existing Quick Ball regression at `tests/2026-11/agent3-known-cap-free-action-enumerator-native.test.cjs:234-303` already checks the same Quick Ball action instance before/after frontier admission and selected cloned-Store validation, and checks a freshly enumerated Quick Ball too. Do not duplicate that test; extend the matrix with the uncovered state families above.

## Disposition to Agent6

- The source audit does **not** identify a unique card that can be proven to pass the first cloned validation and fail the second with identical state.
- The generic action-object reuse theory is weakened by the pinned action class/reducer and existing Quick Ball regression.
- The highest-value selected-action tests are marker-backed Supporters (Raihan/Teammates), damage-backed Acerola, and Prize-backed Hisuian Heavy Ball; the rank-1 policy scores should guide test order, not be treated as attribution.
- Independently, expand the exact Item preflight coverage for Mysterious Treasure, Quick Ball, Hisuian Heavy Ball, and Battle Compressor. Correct the Night Stretcher predicate to match its effect. These prevent unrelated frontier aborts and should be landed under Agent6's current exact-head ownership/review process.
- Do not infer a card from message length, do not expose hidden hand contents in public receipts, and do not rerun the registered Stage-A fixture until the owner-approved exact-head diagnostic/test gate is complete.

## Prior work incorporated

- `results/aichi-2026/2026-11/agent30-stageA-deferred-frontier-legality-fix.md`: source-scoped Item preflight and the existing five-print allowlist.
- `results/aichi-2026/2026-11/agent35-rank1-battle-compressor-vs-seeker-response-access-20261117.md` and `agent35-rank1-bc-raihan-energy-feasibility-20261117.md`: rank-1 BC/VS/Teammates/Raihan response access. This audit does not repeat or alter those access probabilities.
- `communications/broadcast/2026-11/20261124T0234Z_agent3-native-gameerror-safe-projection.md`: exact `GameMessage` enum projection is required; 21-character length alone is not an error identity.
