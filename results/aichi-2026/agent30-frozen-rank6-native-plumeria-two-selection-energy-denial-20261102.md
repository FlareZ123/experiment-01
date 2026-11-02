# Original rank6 Plumeria: real two-card native selection and an opponent Energy removal in the first frozen bilateral canary

**Agent30 | 2 November 2026 | source-action developmental witness, broad paper cost unqualified.** Read original raw [Agent20 frozen rank6 native CI 41463121456](https://github.com/FlareZ123/experiment-01/actions/runs/41463121456), [artifact 13150042319](https://github.com/FlareZ123/experiment-01/actions/runs/41463121456/artifacts/13150042319), exact selected runner commit `c448a9126645ef7bf2bc36f4a93ffad725118e8b` and pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Specific registered original-source trial: `6:1:B:new-moon-lockbreaker-v1` seed **1207371343**, original rank6 **Iron Thorns ex source physical seat A**, challenger New Moon physical seat B.

## One actual native source Supporter line

This single natural-source game had original Iron Thorns ex Active and one Capture Energy on it, facing a New Moon Unown Active with **two Psychic Energy** at its completed global-turn-seven `Hidden Power` attack. It then executed:

| Root ordinal | Native global turn | Real owner/action | Direct observation |
| ---: | ---: | --- | --- |
| 53 | 7 | Opponent B: `Hidden Power` | Before/after attack public board retains 2 Psychic Energy on Active Unown |
| 57 | 8 | Source A: `PlayCardAction Plumeria` | Real source-hand Supporter root |
| 58 | 8 | Source A: `ChooseCardsPrompt` | `nativePromptMin=2, nativePromptMax=2`, two selected card names **Cynthia & Caitlin CEC** and **Enhanced Hammer TWM**; prompt `sourceZone=unclassified`, `sourcePlayerSlot=-1`, source zone contains seven cards |
| 59 | 8 | Source A: `ChoosePokemonPrompt` | Native opponent-Pokémon targeting prompt, actual choice not exposed in public root ledger |
| 60 | 8 | Source A: `ChooseCardsPrompt` | One selected **Psychic Energy MEE**, native `min=1,max=1`, prompt source-zone also unclassified |
| 61 | 8 | Source A: `PassTurnAction` | Ends the source's turn |
| 64 | 9 | Opponent B: `Hidden Power` | Public board now shows **one Psychic Energy** on the same Active Unown; no intervening B attach root in the trace |

The native archive provides an actual source action, a **two-card named payment selection**, targeted one-card Energy choice, and a later **public opponent attached-Energy count reduction of exactly one** in the expected temporal position. The source had no attack on that turn, but performed a resource-denial Supporter line. This is evidence that the selected real shared policy can sometimes resolve original rank6 control plays without switching to a separate scripted-only fixture.

## Precise paper evidence boundary

The native owner-hand `Guzma & Hala` payment prompts in other source arms were classified `sourceZone=hand, sourcePlayerSlot=1`. **Plumeria's actual prompt is different:** `sourceZone=unclassified, sourcePlayerSlot=-1` even though its root actor is original source seat A. Its payment objects might be selected from an engine temporary hand zone, but this JSON does not independently prove that both selected physical payment cards were resident in the original owner's hand immediately before use or that they moved to original owner's discard pile. The submitted two-card **count** is paper-compatible, while its actual physical custody remains unverified. We also lack a dedicated real Store positive/negative Plumeria short-payment contract in the selected source guard portfolio.

Consequently the narrow conclusion is **NATIVE_TWO_CARD_SELECTION_AND_ENERGY_REMOVAL_OBSERVED; PHYSICAL_PAYMENT_CUSTODY_UNVERIFIED**. Do not equate `nativeAccepted` or an unclassified prompt zone with complete printed validity. Other source arms in this four-arm release did not play Plumeria. The earlier independent static hypothesis of a potential short-payment exploit is neither proved nor triggered by this actual two-card selection.

## Reproduction fields

From `rawNativeResult.rows` choose registered ID `6:1:B:new-moon-lockbreaker-v1`. Use `rootActionLedger` at ordinals 53, 57–61, 64 and `nativePromptChoices.events` ordinal58 and60, with `sourceSeat=0` and corresponding `initiatingRootActionOrdinal=57`. Cross-check `candidateAttackSettlement.attacks` `turnBefore=7` and `turnBefore=9`, `publicBoardBefore[1].active.energyCards`; result is 2 Psychic then 1 Psychic with the same active name `Unown`. Check that `rootActionLedger` has no B `PlayCardAction` attaching Energy between 57 and64.

No win-rate claim. All four release arms remain competitively unqualified. The complete Aichi original roster remains 29/32 authenticated.

## Pinned native Plumeria reducer clarifies the unclassified temporary source zone

Read-only source inspection of the exact pinned upstream `ptcg-server/src/sets/08-sun-and-moon/set-burning-shadows/plumeria.ts` explains why this genuine two-card prompt was marked `sourceZone:'unclassified',sourcePlayerSlot:-1` by the generic observer. The reducer:

1. Takes `player=effect.player` (the current owner), checks `player.hand.cards.filter(c=>c!==effect.trainerCard).length >=2` and an opponent with attached Energy, then moves Plumeria itself from `player.hand` to `player.supporter`.
2. Constructs a **new temporary CardList** called `handTemp` and populates it using **the exact card object references from `player.hand.cards`**, filtering out `self`: `handTemp.cards=player.hand.cards.filter(c=>c!==self)`.
3. Offers `new ChooseCardsPrompt(player,...,handTemp,{}, {min:2,max:2,allowCancel:false})`, so the observer cannot identify the prompt's source `CardList` as owner hand by reference, hence `unclassified` is expected even in a legitimate payment selection.
4. Assigns `cardsInHand=selected||[]` in the callback; after prompt resume, if `cardsInHand.length===0` it returns without effect. Otherwise it calls `MOVE_CARDS(store,state,player.hand,player.discard,{cards:cardsInHand,sourceCard:self})` **before** targeting an opponent Pokémon and moving selected Energy into `opponent.discard`.
5. The pinned engine `MOVE_CARDS` handler uses `CardList.moveCardsTo` with an object-reference lookup in the original source zone, splices each present reference, and pushes it into the destination, so actual owner-hand membership at movement time is the decisive dynamic invariant.

This code path provides a **static conditional source→payment→target sequence** that is consistent with the live two-card selection and subsequent observed 2→1 attached-Energy reduction. The model remains incomplete for paper certification because the archived game has no exact owner-hand/discard post-payment physical identity receipt. **Specific short-payment risk**: Plumeria checks `cardsInHand.length===0`, rather than requiring exactly two after the prompt callback. If an engine prompt validator ever admitted a one-card `selected` array, this reducer would move one selected object and still proceed to target Energy. The source's `ChooseCardsPrompt min=max2` is expected to prevent this, but runtime acceptance or rejection under invalid array input has not been independently tested here. Treat this as an exact code-level *hypothesis*, with a one-card negative native Store dispatch test needed before calling it an exploitable paper rule violation.

Do not treat `unclassified` as evidence that the native source player selected cards they did not own, and do not treat static reducer intent as direct physical post-resolution proof. The two-card live original-source action remains in developmental, paper-unqualified territory.

### Shared prompt validator cross-check

The pinned `ptcg-server/src/game/store/prompts/choose-cards-prompt.ts` exports `chooseCardsSelectionValid` and its `ChooseCardsPrompt.validate` calls it. The shared implementation **explicitly rejects `result.length < options.min` and `result.length > options.max`** (lines 51–57), and also rejects selected objects absent from the offered `cards` list (lines 125–129). This is direct static evidence that one-card selection against a Plumeria `min=max=2` prompt **fails the prompt's own validator**. The reducer's weaker `cardsInHand.length===0` postcondition is a defense-in-depth gap, but **cannot be described as an exploitable Store underpayment** without a native dispatch path that bypasses or corrupts prompt validation. The already-observed original Plumeria source action selected two objects, exactly matching the validator's cardinality. Preserve this distinction.
