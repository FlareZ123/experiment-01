# Special Red Card: official Japanese empty-hand ruling versus pinned Twinleaf source path

**Agent 44 | 7 November 2026 | independent paper FAQ + static pinned-source control-flow review. No native Store experiment or competitive games.**

## Attribution and genuinely new question

The **official zero-opponent-hand paper restriction is already established** in [Agent3's 2 November original Japanese-print and source-rules analysis](../legality/agent3-aichi-postevent-english-japanese-and-same-name-source-prints-20261102.md) and its [direct message to Agent13](../../communications/agent13/20261102T2227Z_agent3_specialredcard_japanese_m4_zero-hand-ruling.md). Agent4's subsequent [3 November six-attempt native M4 Prize-prerequisite paper screen](../aichi-2026/2026-11/agent4-jp-m4-original-paper-prize-native-diff-20261103.md) already certifies one real owner-held row where the **different, public opposing-Prize requirement** failed. This report claims no new card ruling and no new original-60 chronology anomaly.

**Incremental question investigated here:** Does the **specific pinned Twinleaf M4 SpecialRedCard class** enforce the previously known zero-hand prohibition through its `canPlay` and native `reduceEffect` paths? A static code review suggests a discrepancy. The necessary next evidence is a **real same-root Store-acceptance fixture**, because static inspection alone is insufficient to establish native behavior.

## Paper criterion and the original benchmark

- The [official Japanese Pokémon TCG FAQ for Special Red Card](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%B9%E3%83%9A%E3%82%B7%E3%83%A3%E3%83%AB%E3%83%AC%E3%83%83%E3%83%89%E3%82%AB%E3%83%BC%E3%83%89&regulation_faq_main_item1=all) asks if the Item can be played while the opponent has **zero cards in hand** and explicitly answers **no** (`いいえ、できません。`).
- The [official Japanese M4 072 card](https://www.pokemon-card.com/card-search/details.php/card/50156/regu/all) restricts use to an opponent with three or fewer Prizes, then instructs putting their shuffled hand on the bottom of the deck and drawing three cards.
- `M4` *Ninja Spinner* released [13 March 2026](https://www.pokemon-card.com/ex/m4/), so it was available for the **10 May 2026** Aichi benchmark.
- The repository's original rank-5 Mew Genesect source contains **two Special Red Card** and rank-26 Meloetta Donk source contains **one**, currently annotated with post-event English equivalent `CRI 82`. See [Agent44 source crosswalk](../aichi-2026/agent44-postevent-nonenergy-english-printing-crosswalk-20261107.md).

## Reproducible pinned native-source inspection

Pinned Twinleaf Git submodule: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

1. [SpecialRedCard class](../../vendor/twinleaf/ptcg-server/src/sets/11-mega-evolution/set-chaos-rising/special-red-card.ts): `canPlay` rejects only if opponent's Prize count exceeds 3. It has **no check for empty opponent hand**. Its `reduceEffect` similarly rejects only Prizes above 3, and guards the opponent's hand move/draw with `if (cardsInHand > 0)`; at zero hand it returns `state` without applying its action.
2. [Pinned PlayCard reducer](../../vendor/twinleaf/ptcg-server/src/game/store/reducers/play-card-reducer.ts) constructs a `PlayItemEffect` from the player's hand and reduces it. The Item branch in [play-trainer-effect](../../vendor/twinleaf/ptcg-server/src/game/store/effect-reducers/play-trainer-effect.ts) moves the played Trainer to `supporter`, processes `TrainerEffect` and performs cleanup to discard after the effect.
3. **Static-source-predicted failure state**: active player holds Special Red Card; opponent has 0 cards in hand and 3 Prizes, no Item lock; player announces the Item. The inspected class would apply zero Special Red Card effect while the common Item cleanup may still discard the Item. This violates the explicit official FAQ if the native Store accepts this action.

### Evidence classifications

- **Official paper prohibition against playing Special Red Card into an empty opponent hand: established**, by the Japanese authoritative FAQ.
- **Pinned special-card class missing this check: established**, by cited source inspection.
- **End-to-end native Store acceptance of the paper-invalid zero-hand play: independently established on both seats**, by the six-fixture real pinned Store run linked above. No natural original-deal incidence or full-game qualification has been established.
- **Competitive impact: unmeasured**. This could create an unlawful resource-burning line or alter bots' available choices, but no occurrence is proven in archived source root traces.

## Genuine pinned Store reproduction (7 November; confirmed)

The initially hypothesized failure is **now reproduced through actual compiled, pinned native Store dispatch** in both physical seats. The fixture was committed under [`tests/agent44-specialredcard-emptyhand-native.sft.cjs`](../../tests/agent44-specialredcard-emptyhand-native.sft.cjs) and executed through the existing shared [Twinleaf smoke CI run 42324987267](https://github.com/FlareZ123/experiment-01/actions/runs/42324987267), commit `7878f5e28c4ca9327d75005e1f52cad54c89065b`, job `128258085227`. The dedicated **"Diagnose official Japanese M4 Special Red Card zero-hand native Store gate"** step succeeded **6/6 diagnostic fixtures** at 2026-11-07T01:41:16Z. The overall legacy smoke workflow was red due a separate `smoke_check_22` (Canceling Cologne repeat rule) failure. This does not affect the independently successful M4 step.

| Physical actor seat | Opponent Prizes | Opponent hand | Native `canPlay` | Actual native Store `PlayCardAction` | Item custody after | Opponent hand after | Paper status |
| --- | ---: | ---: | --- | --- | --- | ---: | --- |
| 0 | 3 | **0** | **true** | **accepted** | discarded | 0 | **invalid** |
| 1 | 3 | **0** | **true** | **accepted** | discarded | 0 | **invalid** |
| 0 and 1 | 3 | 1 | true | accepted | discarded | 3 | allowed |
| 0 and 1 | 4 | 1 | false | rejected, `CANNOT_PLAY_THIS_CARD` | still in owner's hand | 1 | prohibited |

Every fixture used the exact native `Special Red Card M4` class (`set='CRI'`, `setNumber='82'`, original Japanese card identity encoded as `fullName='Special Red Card M4'`), two-seat native `Store.dispatch(new PlayCardAction(...))`, source card object in the acting hand, actual `CardList`-backed opposing hand/deck, no Item lock and a public opponent Prize count. The staged 0-hand/3-Prize fixture **physically discarded a card without moving or drawing any opposing cards**, which paper rules explicitly prohibit. Both positive and independent 4-Prize negative controls establish this is the missing hand criterion specifically. The fixture is **not an authentic original-deal frequency study**; no match was played, no competitive game was qualified.

The default-off, research-owned prototype [reversible paper hook](../../simulation/twinleaf/agent44-special-red-card-empty-hand-hook.cjs) was committed after this native witness. It patches both `canPlay` and `reduceEffect` on the one exact native class, restoring original methods when explicitly asked, and does not edit the upstream Twinleaf submodule. A same-fixture **original / corrected / restored** two-seat regression was appended to the SFT. Its second shared smoke workflow [run 42325470944](https://github.com/FlareZ123/experiment-01/actions/runs/42325470944), commit `85caa7a6b1477b8bd85d076fba6383954eeb684a`, **passed the dedicated native M4 step (8/8 subtests)** at 2026-11-07T01:44:31Z. Both physical seats produced logged original/corrected/restored receipts: with 3 opposing Prizes and **0 opponent hand**, baseline `canPlay=true`, Store accepted and discarded Item; with the opt-in hook, `canPlay=false`, Store rejected `CANNOT_PLAY_THIS_CARD` and left Item in its owner's hand; after restoration, original acceptance returned. Within the same installed hook, valid 3-Prize/1-hand play still resolved the opponent's new hand of three, and 4-Prize/1-hand remained prohibited. All receipts were collected from real pinned Store dispatches on staged boards; no full opponent source match or performance was tested. The overall smoke job remains red from the separate existing `smoke_check_22` failure (Canceling Cologne), while the dedicated `smoke_check_39` native paper-hook regression is green.

## Additional scoped source-code concern: missing hand shuffle before deck-bottom move

The **separate** paper instruction says to **shuffle** the opponent's hand and put those cards on the bottom of their deck before the three-card draw. The pinned `SpecialRedCard.reduceEffect` first moves the entire ordered opponent hand to a `CardList`, then moves that ordered list into `opponent.deck` via `MOVE_CARDS`, and invokes `DRAW_CARDS`. It does **not** request or perform a shuffle of that opponent's hand. In the pinned general `game-effect.ts` `MoveCardsEffect` all-cards branch, `source.moveTo(destination)` preserves order; `CardList.moveTo` splices in index order and appends to destination. The native deck treats `cards[0]` as top and appended cards as bottom, so the two-or-more-card pile's order appears mechanically fixed by its old hand ordering. This would alter future draws after the deck cycles, although no strategic effect frequency is yet established.

This is a static source-path deduction; **avoid treating it as a witnessed game outcome** until the actual pinned native Store multihand test finishes. An original-versus-reversed three-distinct-card controlled fixture is committed in the same [native SFT](../../tests/agent44-specialredcard-emptyhand-native.sft.cjs) and the [shared smoke CI run 42325823233](https://github.com/FlareZ123/experiment-01/actions/runs/42325823233) is pending. The empty-hand-only reversible hook documented above does **not** attempt to repair this further randomness concern. Correct handling will need reproducible physical randomness and explicit game-state trace evidence, and should not globally shuffle the opponent's entire deck.

## Minimum integrated verification and correction

The shared Agent36/Agent41 bilateral gate can test this with one reversible research-side hook (keep the submodule untouched) and two precisely registered fixture states:

- Positive: printed Special Red Card in acting hand, opposing three Prizes and **one card in hand**, no lock. Actual native Store must accept, move opponent's one card to deck bottom and allow its stipulated three-card draw.
- Negative: same state except opposing **zero cards in hand**. Both advertised legal-action selection **and actual Store acceptance** must reject the Item. Record the error class and action ordinal, and confirm no card movement.
- Third conditional: opponent at **four Prizes** with a nonempty hand, negative. Confirms pre-existing Prize restriction remains intact.
- If the negative currently accepts, patch through a versioned research-side prototype/method hook that checks the opponent hand before the card leaves the acting hand, and integrate this into the **same shared policy on both seats**. Test original pin, hook revision, source card type identity, and cleanup. Avoid introducing a new isolated CI workflow or making a competitive improvement claim.

The [Advanced Player's Rulebook](../../resources/manual/EN_advanced_manual-2025-transcription-structured.md) B-01 also describes a prohibition on Items that fail to change game state, but the direct official named-card ruling is decisive for the target case.

**Status:** 29/32 authenticated name/count source lists; three originals still missing; zero paper-qualified games; zero proven 99.5% field results. This is a concrete paper-fidelity acceptance task for ranks 5 and 26, not a new candidate or field-strength estimate.
