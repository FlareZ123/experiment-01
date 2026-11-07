# Agent29 native rank9 source shuffle: actual physical permutation witness and noninterference

**7 November 2026 | source-only historical owner-policy audit | zero competitive-paper-qualified games**

## What was resolved

The [previous v2 native result](agent29-rank9-compressor-anyturn-v2-native-20261107.md) proved two genuinely accepted original rank9 source `Battle Compressor PHF` Items moved three physical source Energy cards each from own deck to discard. It recorded two stamped `ShuffleDeckPrompt` resolutions, while the preexisting `agent33-native-shuffle-numeric-validation-hook-v1` returned `checked=0`. This left their actual numeric shuffle permutation and resulting physical deck order independently unaudited.

We verified pinned upstream source at Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:
- [Store.reducePrompt](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/store.ts) assigns `prompt.result=action.result` and calls the registered continuation; it **does not call `prompt.validate`**. Therefore a handler wrapping only `ShuffleDeckPrompt.prototype.validate` may never see an actual native game shuffle.
- [SHUFFLE_DECK](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/prefabs.ts) calls `player.deck.applyOrder(order)` after prompt settlement.
- [CardList.applyOrder](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/state/card-list.ts) performs a separate numeric permutation test before reordering. This is a distinct safeguard from `ShuffleDeckPrompt.validate` and does not prove that an arbitrary null or invalid answer would be rejected upstream.

## Independent actual Store observation

Added a separately registered reversible read-only [Store-dispatch physical shuffle witness](../../simulation/twinleaf/agent29-authoritative-shuffle-order-witness.cjs) that observes the authoritative Store first seen on its real `AddPlayerAction`; speculative copies are excluded. The wrapper matches an actual unresolved native `ShuffleDeckPrompt` whose `sourceCard.fullName==='Battle Compressor PHF'`, records its owner seat, checks whether the supplied `ResolvePromptAction.result` is an exact numeric permutation of the current physical deck length, then compares **physical Card-object identity in the post-Store deck** to the before-Store deck indexed by that submitted order. It writes only booleans/counts/seat/deck length, never unrevealed deck identities or order. Native action and prompt contents are unchanged.

Regression tests in [test file](../../tests/agent29-authoritative-shuffle-order-witness.test.cjs) cover both physical seats with a valid 12-card permutation that native lexicographic `validate` rejects, an invalid repeated-index shuffle which native Store accepts as a prompt but does not physically apply, a speculative or unrelated source Trainer, and restoration of `Store.prototype.dispatch` after failure. All tests were part of passing existing manual CI.

The existing manual workflow [GitHub Actions run 42337421617](https://github.com/FlareZ123/experiment-01/actions/runs/42337421617) **succeeded** at source head `6a68a2a265f09a5594b3e0c64b173904f81fdb1d`, pinned native Twinleaf, including **56/56** native CES48 tests. Its separate v3 output [artifact 13559648643](https://github.com/FlareZ123/experiment-01/actions/runs/42337421617/artifacts/13559648643), ZIP SHA256 `3a9b3e9f1bce0fe22448332449fcde1a01d8b07650582bb8a2f3b9154b7763d3`, preserves four original physical-deal pairs and eight attempt rows.

| Cohort | Source-stamped real ShuffleDeckPrompt resolutions | Valid numeric permutation | Physical post-deck matches submitted order | Numeric validate hook calls |
| --- | ---: | ---: | ---: | ---: |
| Control, no extra source Item | 0 | 0 | 0 | 0 |
| Treatment, late source Battle Compressor | **2** | **2** | **2** | **0** |

Each treated owner is original rank9 physical **seat 1**, each shuffle has exactly **34** physical cards remaining after three selected Energy cards moved into discard, and each source shuffle order is a valid 0–33 numeric permutation physically applied to all 34 source cards. There were **zero invalid source-stamped permutations**, **zero physical-order mismatches**, and **zero prompt/source-card mismatches** in the observed treatment. The validation hook's zero calls are now explained directly by upstream Store control flow. A valid permutation of one deck is not proof of uniform randomness, future draw quality, or every card's paper fidelity.

## Exact noninterference comparison to separately archived v2

To test the claimed read-only character empirically, we independently parsed the immutable [v2 archive 13560305641](https://github.com/FlareZ123/experiment-01/actions/runs/42336670889/artifacts/13560305641) and this v3 archive, joined all trial IDs and compared underlying `fullPhysicalDealFingerprint`, `rootActionLedgerSha256`, **complete `rootActionLedger` arrays**, `finished`, `winner`, `rootActionCount`, and source Item audit. Every one of the **8/8** registered A/B arms had **exactly equal initial physical deals and exact accepted public root tapes** across separate runs. Every one of the eight native completion/cap dispositions also matched. Both newly accepted source Items and all six physical Energy movements recurred. Only the registration version and read-only audit fields changed. This is strong empirical noninterference for these eight fixed historical sources, not a universal guarantee.

## Causal limits and next step

The native v2/v3 comparisons still use `legacy-shared-prng` without isolated policy or physical shuffle streams; **outcomes of treated vs control can diverge through RNG consumption as well as game decisions**. Neither source Compressor produced the intended follow-on `Extra Energy Bomb` in an accepted root; two source owners instead passed immediately after their discarded Energies. Stage/clock, opponent decision quality and three missing Aichi originals remain unresolved. All eight native attempts are development only, **zero qualified competitive games**, no fixed-60 winner and no demonstrated 99.5% field win rate.

The highest-value follow-up is a real source public-board + printed-Ability availability audit at the immediate post-shuffle Pass, followed by an explicitly registered source Ability+Energy recipient policy test and adversarial opposing reply. Do not treat a 34-card valid permutation, a source discard payment, or native terminal as a source strategy payoff.
