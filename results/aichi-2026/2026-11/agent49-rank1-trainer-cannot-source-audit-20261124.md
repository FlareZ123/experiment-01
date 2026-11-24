# Rank-1 Trainer legality and cloned-dispatch source audit

**Agent 49 · 2026-11-24**  
**Pinned Twinleaf:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
**Scope:** source-level triage for the post-response Stage-A `CANNOT_PLAY_THIS_CARD` diagnostic. This is not a card-interaction ruling beyond the cited pinned source, a new fixture result, or competitive evidence.

## Decision summary

1. **Generic `PlayCardAction` object consumption is not supported by the pinned source.** The action is a value object with only `type`, `id`, `handIndex`, and `target`; the reducer reads those fields. The existing Quick Ball regression snapshots all four fields across frontier admission and selected cloned-Store revalidation and passes. Repeating the same action instance is not, by itself, a credible explanation.
2. **The rank-1 Item frontier preflight is incomplete.** The pinned ActionEnumerator proposes every Item in hand without consulting `canPlay`. The adapter's Item rejection code deliberately does not swallow `CANNOT_PLAY_THIS_CARD`, but its exact-print preflight currently covers Battle VIP Pass, VS Seeker, Unfair Stamp, Field Blower, and Night Stretcher only. Four more rank-1 Items have native `CANNOT_PLAY_THIS_CARD` predicates and are not in that allowlist: **Mysterious Treasure, Quick Ball, Hisuian Heavy Ball, and Battle Compressor**. Their exact-print preflights should be added after Agent6's current test matrix confirms the source predicates.
3. **One existing preflight is weaker than its effect.** Twinleaf's `NightlyStretcher` implementation allows any Energy in `canPlay`, but its play effect requires a Pokémon or Basic Energy in the discard. Special-Energy-only discard can therefore pass the current preflight and still throw `CANNOT_PLAY_THIS_CARD`. This does not explain the rank-1 run: the published rank-1 60 contains 11 Basic Psychic Energy and no Special Energy.
4. **No pinned card source establishes a condition that should pass the first clone and fail the second when both clones receive equivalent state.** For the remaining candidates, the relevant legality predicates are deterministic and repeated by the effect. A second-only failure therefore points to a state-graph/identity discrepancy, not a generic action-object lifecycle. The most discriminating state families are marker references, Prize `isSecret`, Pokémon damage, discard card classes, and hand/deck identity/counts.
5. **The fastest actual attribution fix is already scaffolded.** `selectedCardIdentity()` exists but runs after cloned validation; move its capture to immediately after trusted-token resolution via a host-only callback that writes to the existing attempt record before dispatch. The public sanitizer's allowlist omits card family and failed-card identity; it exposes only generic action type and exact GameMessage, with selectedCardPublicPrinting reserved for successful dispatch. The private artifact has no recipient key yet, so do not emit plaintext; owner provisioning or owner-controlled local debugging is required.

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

Thus a discard containing only Special Energy is a false-positive for the existing `Night Stretcher SFA 61` preflight. Agent6's branch now uses the effect-equivalent research-side predicate (Pokémon present **or** Basic Energy present) and has a compiled-native regression for Special-Energy-only, Basic-Energy, and Pokémon cases. Do not duplicate that patch or modify upstream Twinleaf.

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
1. Raihan and Teammates: marker-name presence and marker collection; source-card identity is secondary for Raihan's stricter canPlay projection, not its effect's CANNOT guard.
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
- Raihan: the Raihan KO marker by name, Basic Energy in discard, and nonempty deck; also record marker source identity separately because canPlay is stricter than the play effect.
- Acerola: at least one damaged Pokémon.
- Iono: at least one of the legal own-hand/deck/opponent-hand resources.
- Carmine: nonempty deck.

Also test the negative boundary for each condition. For Items, explicit `canPlay === false` should be filtered by exact-print preflight; `true` and `undefined` must still reach native dispatch. Keep the Item `CANNOT_PLAY_THIS_CARD` rejection fatal for all unlisted prints.

The existing Quick Ball regression at `tests/2026-11/agent3-known-cap-free-action-enumerator-native.test.cjs:234-303` already checks the same Quick Ball action instance before/after frontier admission and selected cloned-Store validation, and checks a freshly enumerated Quick Ball too. Do not duplicate that test; extend the matrix with the uncovered state families above.

## Disposition to Agent6

- The source audit does **not** identify a unique card that can be proven to pass the first cloned validation and fail the second with identical state.
- The generic action-object reuse theory is weakened by the pinned action class/reducer and existing Quick Ball regression.
- The highest-value selected-action tests are marker-backed Supporters (Raihan/Teammates), damage-backed Acerola, and Prize-backed Hisuian Heavy Ball; the rank-1 policy scores should guide test order, not be treated as attribution.
- Independently, expand the exact Item preflight coverage for Mysterious Treasure, Quick Ball, Hisuian Heavy Ball, and Battle Compressor. The Night Stretcher predicate is already corrected and tested on Agent6's branch; merge it after the owner-approved gates. These prevent unrelated frontier aborts and should be landed under Agent6's current exact-head ownership/review process.
- Do not infer a card from message length, do not expose hidden hand contents in public receipts, and do not rerun the registered Stage-A fixture until the owner-approved exact-head diagnostic/test gate is complete.

## Prior work incorporated

- `results/aichi-2026/2026-11/agent30-stageA-deferred-frontier-legality-fix.md`: source-scoped Item preflight and the existing five-print allowlist.
- `results/aichi-2026/2026-11/agent35-rank1-battle-compressor-vs-seeker-response-access-20261117.md` and `agent35-rank1-bc-raihan-energy-feasibility-20261117.md`: rank-1 BC/VS/Teammates/Raihan response access. This audit does not repeat or alter those access probabilities.
- `communications/broadcast/2026-11/20261124T0234Z_agent3-native-gameerror-safe-projection.md`: exact `GameMessage` enum projection is required; 21-character length alone is not an error identity.


## Follow-up status — Agent6 branch already closes the Night Stretcher mismatch

After this audit was written, I inspected Agent6's advancing branch `agent6/gameerror-safe-diagnostic-20261124`:

- `43599bc2a1` changes `itemCanPlayInValidationStore` to use the effect-equivalent Pokémon-or-Basic-Energy discard predicate for Night Stretcher instead of trusting its broader `canPlay`.
- `34c2c343b9` adds a compiled-native regression against the pinned card effect: Special-Energy-only discard is rejected; Basic Energy and Pokémon are admitted and survive selected cloned-Store validation.

This is a good, bounded correction. **Do not duplicate the Night Stretcher patch or its test.** These commits are on Agent6's branch, not yet established here as mainline integration. The remaining unaddressed finding from this audit is the four rank-1 Items absent from the exact preflight allowlist: Mysterious Treasure FLI 113, Quick Ball FST 237, Hisuian Heavy Ball ASR 146, and Battle Compressor PHF 92. Their positive/negative boundary tests should be added only if Agent6's current exact-head matrix has not already covered them.


## Printing resolution confirmation

The rank-1 rows in `results/aichi-2026/full-decklists.json` carry explicit English printings, so the four missing Item entries are not guesses:

- Mysterious Treasure — FLI 113
- Quick Ball — FST 237
- Hisuian Heavy Ball — ASR 146
- Battle Compressor — PHF 92

The same frozen deck data records Night Stretcher as ASC 196 and Psychic Energy as MEE 13. The pinned V3 runner's `engineProxyPrintingForSourceRow` explicitly maps Night Stretcher ASC/196 to the approved SFA/61 engine implementation and Psychic Energy MEE/13 to SVE/5. Thus the rank-1 Night Stretcher action is the exact SFA/61 class already covered by Agent6's branch correction, and the opponent's Energy cards are Basic Psychic Energy. This confirms that the Special-Energy-only discrepancy is not present in the rank-1 list.


## Exact-card attribution without exposing the opponent's hand

A direct diagnostic improvement is already available in the repository:

- `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs:305-336` defines `selectedCardIdentity(action,state,actingSeat,cardActions)`. Its contract is explicit: resolve the physical card from the acting player's private hand for trace only; never put it in public state or policy input.
- The helper is currently called only at lines 1014–1017, after the decision-resolution `yield` returns to the outer native fixture generator.
- The selected root handler calls `dispatchSelectedNativeAction` at `simulation/evaluation/2026-11/agent36-v3-runner.cjs:2601-2606`. If cloned validation throws there, the `yield` never returns, so the later identity capture is skipped. The attempt record starts with `selectedCardIdentity:null` at line 843 and remains null on this failure path.

Call the existing helper immediately after `assertTrustedActionSelection` and before `dispatchSelectedNativeAction`, using the native action from `frontier.actionByToken`, `request.state`, `actorSeat`, and `native.cardActions`. Attach the result only to the encrypted/private trace or another owner-controlled internal diagnostic. Do not add `fullName`, set, number, or any hidden-hand identity to the worker request, public decision trace, public receipt, or sanitized artifact. Keep the current public-safe action type/family and exact GameMessage projection.

This is a more direct next-run attribution path than guessing among the card matrix. It does not require a second harness or a new fixture; it only moves an existing trace-only capture before the operation that can fail.


## Why a second-only failure needs a state/identity differential

The surrounding implementation removes several generic explanations:

- `agent49-native-fixture-game.cjs:142-164` creates a fresh validation RNG from the same normalized seed on every `withValidationRandom` call. Frontier admission and selected-action revalidation do not simply consume different positions in one drifting validation RNG stream.
- `agent36-native-action-frontier.cjs:402-467` uses a `seen` map, clones Card instances with their prototype, and copies own string/symbol property descriptors. The relevant pinned state fields are ordinary own properties: `CardList.isSecret`, `Marker.markers`, and `PokemonCardList.damage`. The `Marker` stores source Cards in its `markers` array and compares them by reference; the graph clone is designed to preserve those aliases.
- The live Store snapshotter at `agent49-native-fixture-game.cjs:10-78` records own-property values and object identities, not just a shallow public summary. The frontier and selected-validation boundaries assert the original Store remains unchanged.

These controls make RNG drift and generic live-state mutation weak explanations. They do not rule out every global singleton or a card-specific hidden dependency. The next useful diagnostic is therefore a *private selected-card identity captured before the throwing call*, paired with a minimal state-predicate projection for that card—not another generic action snapshot.


## Additional invariant worth carrying into the selected-validation call

There is one small gap in the current boundary checks:

- `agent36-native-action-frontier.cjs:513-515` captures `fullStateBefore` using a snapshotter with stable object IDs.
- Lines 562–565 prove the live Store was unchanged by enumeration/frontier validation.
- The returned frontier at lines 577–590 discards that baseline and snapshotter.
- `dispatchSelectedNativeAction` takes a *new* baseline at selection time and checks that the Store stays unchanged during the second clone, but it does not compare the live Store at selection time with the frontier-time snapshot.

The runner does not pass the live `state` to the policy worker, so an intervening mutation is not currently evidenced. Still, returning the existing snapshotter closure plus its baseline as host-only frontier metadata, then comparing it immediately before selected validation, would prove the frontier and selected clone saw the same live object graph. Keep this metadata out of `actionFrontier` and worker input. If the comparison fails, emit a dedicated state-divergence diagnostic instead of allowing a downstream card GameError to obscure the earlier mutation.


## Use the private action family to narrow the next test

The internal failure object carries `nativeActionFamily`, but it is **not public-safe**. The public sanitizer deliberately removes it:

- `agent2-v3-sanitized-diagnostic.cjs:219-232` emits the exact whitelisted `nativeGameMessage` and `nativeActionType`, but not `nativeActionFamily`.
- `tests/2026-11/agent2-v3-sanitized-diagnostic.test.cjs:348-354` explicitly asserts that `nativeActionFamily` is absent from both public fixture-failure and actor-decision-failure output.

Use the family only in owner-controlled local diagnostics or the encrypted private artifact after key provisioning. Do not expose whether a concealed card is an Item, Supporter, Tool, or Stadium in public output. The public-safe `nativeActionType` and exact GameMessage alone do not narrow the card family.

For an internal/private family value:

- **ITEM:** first check whether the selected card is one of the four un-preflighted rank-1 Items; if it is Night Stretcher, Agent6's current branch correction should cover the Special-Energy mismatch. Then compare the relevant hand/deck/prize/discard predicate across clones.
- **SUPPORTER:** prioritize Raihan/Teammates marker state, Acerola damage state, then Iono/Carmine hand/deck state. Invalid Supporter CANNOTs are expected frontier rejections, so a selected Supporter that fails only on the second clone is a clone/state differential.
- **TOOL or STADIUM:** the rank-1 Float Stone, Forest Seal Stone, Sky Field, and Dimension Valley implementations contain no card-specific `CANNOT_PLAY_THIS_CARD` branch in the pinned source audit. Inspect the generic target/reducer path or whether the internal family classification is wrong before inventing a card-specific rule.
- **ENERGY or POKEMON:** this Trainer/Tool/Stadium audit does not cover the selected action; use the internal action type/family to redirect source review rather than broadening this card list speculatively.

This keeps the public diagnostic useful without disclosing the hidden card name or even its Trainer family.

## Raihan marker nuance

Raihan's native `canPlay` checks the KO marker with the specific Raihan card as its source argument, but the actual play effect's `CANNOT_PLAY_THIS_CARD` guard checks the marker name without a source argument. The effect therefore requires marker-name presence, nonempty deck, and Basic Energy in discard; it does **not** require that this exact Raihan copy be the marker source. The Store's post-dispatch playability recalculation will omit this copy from `playableCardIds` if the source-specific predicate returns false (and catches per-card exceptions); the ActionEnumerator does not gate on `playableCardIds`. For the second-clone CANNOT question, compare marker-name presence first; source-card identity is a useful secondary diagnostic for the playability projection, not the effect's CANNOT guard.


## Why the four Item preflights matter beyond rank 1

A bounded frequency check over the **29 deck rows currently present** in `results/aichi-2026/full-decklists.json` (not a full Top-32 census; ranks 23, 25, and 28 are absent from this file) shows:

| Item | Decks containing it | Copies |
|---|---:|---:|
| Quick Ball FST 237 | 21 / 29 | 72 |
| Hisuian Heavy Ball ASR 146 | 20 / 29 | 25 |
| Battle Compressor PHF 92 | 17 / 29 | 33 |
| Mysterious Treasure FLI 113 | 10 / 29 | 37 |

These are not fringe rank-1-only cards. The four missing exact preflights affect a substantial share of the currently encoded opponent field, so they should be treated as shared frontier infrastructure once the Stage-A owner is ready to expand beyond the current rank-1 diagnostic. This count must not be described as 32-deck coverage; the missing-rank provenance work remains separate.


The pinned `play-card-reducer.ts:70-145` also reads `action.target` through `findPokemonTarget`, then passes the resolved `PokemonCardList` plus primitive slot/index values into Pokémon/Tool effects. It does not write to the action's target descriptor. The Quick Ball regression is a no-target case, but the reducer source does not suggest a targeted PlayCardAction mutation path either.


### Privacy regression to pair with the early capture

When wiring the earlier private capture, extend `tests/2026-11/agent2-v3-sanitized-diagnostic.test.cjs` with a failed/not-dispatched attempt containing a sentinel `selectedCardIdentity.fullName` (and set/number). Assert the sanitized artifact has no `selectedCardIdentity` property and its serialized JSON does not contain the sentinel. Also assert `selectedCardPublicPrinting` remains null unless dispatch succeeded. The current sanitizer uses an allowlist and the existing test already proves family redaction; this regression will lock the new field's privacy boundary.


## Minimal next-run diagnostic sequence

Once Agent6's exact-head contract-only and no-game gates are satisfied and the owner approves the registered fixture:

1. Capture the selected card identity in memory before cloned dispatch; retain it only in owner-controlled private diagnostics.
2. Compare the frontier-time full-state baseline with the live Store immediately before selected validation. If different, stop and identify the intervening mutation; do not dispatch against a stale frontier.
3. If unchanged, compare the selected card's exact native legality predicate projection in the first and second fresh clones (using the private identity to select only the relevant predicate).
4. If the predicate inputs are equal but dispatch still differs, repeat the same action/state/seed in a fresh Node process. A same-process-only difference points to static/global singleton state; a fresh-process difference points to clone/engine behavior.
5. Preserve the public sanitizer unchanged. No hidden card identity or family is needed in public output.

This sequence is narrower and more informative than rerunning the whole fixture or testing every Trainer in arbitrary order.


### Cleaner host-only callback alternative

Instead of importing the outer helper into the inner runner or mutating the thrown error, the outer generator can add a host-only callback to the yielded request, e.g. `captureSelectedCardIdentity(action)`. It closes over the existing `attemptRecord`, state, acting seat, and native card-action classes, and writes the helper's result directly to `attemptRecord.selectedCardIdentity`. The inner runner invokes it after trusted-token resolution and before cloned dispatch.

The worker call currently constructs its payload from explicit `observation`, `actionFrontier`, `eventReceipt`, and `policyContext` fields, so the callback need not be forwarded or serialized to the worker. Guard the callback internally so a trace-only capture failure cannot mask the native dispatch error. This avoids an error-property side channel and the outer-yield catch while using the existing `failureContext.record` reference.


The same Raihan source file's `reduceEffect(KnockOutEffect)` path locates each Raihan instance's card list/owner and adds `RAIHAN_MARKER` with that instance as marker source. Under normal event dispatch, every Raihan copy in the player's card zones should therefore receive its own source-specific marker. The looser name-only effect guard is not, by itself, evidence of a practical legality discrepancy; a mismatch would point to marker propagation or clone fidelity.
