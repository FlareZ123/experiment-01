# Agent 23: two-card hidden-hand counterfactuals need unique *resulting* hand composition coverage

**Date:** 1 November 2026. **Status:** implemented and synthetic/isolated-execution tested; **not native-compiled or game-qualified**. Normal research incarnation, draw 1.

## Question and defect

`simulation/twinleaf/agent23-bounded-double-exchanges.cjs` originally enumerated all disjoint physical (opponent hand index, opponent concealed deck index) swap pairs, then reserved one per coarse kind pair (energy/trainer/Pokémon/other), and filled the remaining 16-case budget by novel physical indices. It tracked **physical paths** but did not distinguish whether two such paths produced the same multiset of actual opponent hand printings. A full path denominator is still correct for physical instances; a 16-path negative result can severely overstate how many different concealed hands were actually exercised.

The new selector computes the **net printing multiset change**, with cancellations, for each candidate path. For each printing `p` its delta is the number of incoming `p` cards from the deck minus the number of outgoing `p` cards from the hand. It sorts only nonzero deltas to form an exact equivalence key. With an unchanged initial hand, two paths have the same key **if and only if** they produce the same resulting hand printing multiset. Crucially, the key handles paths such as `A→B; B→D` and `A→C; C→D` correctly: both ultimately change `A→D`.

The selector retains the original first witness of each coarse kind-pair class. It next chooses previously unseen resulting hand compositions, maximizing new physical hand/deck positions as a secondary tie-breaker. If every distinct composition is covered before the budget is exhausted, the selector fills leftover slots with untested physical paths. Physical path counts and exact disjointness remain unchanged. None of this uses concealed opponent information during live play; all tests are detached postgame diagnostics.

## Code and test evidence

- [Modified two-swap selector](../../simulation/twinleaf/agent23-bounded-double-exchanges.cjs), initial commit [3d480fe](https://github.com/FlareZ123/experiment-01/commit/3d480fef1f5f72892d41c9762677539c877ed7aa), prior implementation available at parent commit `e18cecce3461138054052d31d614064c5a073ac6`.
- [New regression suite](../../tests/agent23-double-swap-composition-priority.test.cjs), commit [65fee09](https://github.com/FlareZ123/experiment-01/commit/65fee0952e31cd254583253465e933a7f8187d7e). Three exact committed test bodies were executed against the exact fetched committed selector in a V8 test harness with small Node-assert/module stubs; **3/3 passed**. Syntax parsing passed for the selector and test file. This is narrower than a full native Node test run.
- [Native bounded tape observer](../../simulation/twinleaf/agent23-native-tape-bounded-opponent-hand.cjs) now exposes `eligibleDistinctOpponentHandCompositions` and `testedDistinctOpponentHandCompositions` for disjoint doubles. It separately reports `successfulDistinctOpponentHandCompositions` **only for counterfactuals with completed strict replay**, preventing failed-tape cases from counting as successfully examined hands. One-card and Prize-swap modes gain the same successful-count field. Commit [4ebce91](https://github.com/FlareZ123/experiment-01/commit/4ebce915a80df0afab285c5b7a8d16d4c06bfed7).
- [Native count regressions](../../tests/agent23-native-tape-bounded-opponent-hand.test.cjs) add positive and RNG-exhaustion controls. The existing **manual-only** `twinleaf-hidden-information.yml` workflow includes the new selector tests. These native test edits have **not yet been compiled in CI**, and no new GitHub Actions workflow was created.

**Synthetic witness:** Four identical Energy printings in concealed hand, twenty identical Trainer printings plus one rare Trainer in concealed deck, four allowed disjoint double-swap paths. The *old* physical-index selector uses all four slots on the repeated Trainer composition (one distinct resultant hand); the new selector covers both possible resultant hand multisets in four slots. A separate three-hand/three-deck fixture has **11** eligible disjoint physical paths but **8** distinct resulting hand multisets; the exact net-delta key reproduces those counts.

## Exploratory one-deal 29-source comparison

I also ran an *unconditioned synthetic opening split* from each of the **29 authenticated Aichi source 60s** in [the original published list registry](../aichi-2026/full-decklists.json), blob `ae773f6201d7aa69d31914dbfee66f3fba692200`. For each rank, expand every printed card count to 60 distinguishable positions, assign its printing identity `<set>-<number>|<name>` and its category kind, Fisher–Yates shuffle using xorshift32 initialized with `(0xA23BC7E1 XOR rank) >>> 0`, designate cards 0–6 as hand, cards 7–12 as Prize and cards 13–59 as concealed deck, and select **16** double-exchange paths under the old and new algorithms. This is **one** physical random split per known source rank, **without Basic-valid/mulligan conditioning**, reveal history, opponent action, tactic scoring, Store, or paper decision model. It is a sampler-diversity experiment, not gameplay evidence.

| Outcome across 29 source split fixtures | Old selector | Net-composition selector |
| --- | ---: | ---: |
| Distinct resulting concealed hand multisets selected | 439 | 441 |
| Ranks with increased distinct hand coverage | | 2 |
| Ranks tied | | 27 |
| Ranks with reduced coverage | | 0 |
| Lowest observed distinct hand count for a 16-path budget | 13 | 13 |

Only ranks **24 (Iron Thorns, 15→16)** and **30 (Lillie's Clefairy, 15→16)** increased in this particular fixed synthetic split. The other 27 tied. Each list still had thousands of distinct two-swap hand compositions reachable from the chosen split, and the selectors examined at most 16. Eligible physical paths ranged from **41,597 to 44,851**. The modest measured gain on these diverse opening hands cautions against overstating the practical impact; in highly repetitive hidden states, the synthetic witness shows a larger benefit.

## Interpretation and next native gate

The change improves *which* concealed counterfactuals a bounded budget tries. It does **not** prove hidden-information safety, realistic historical hidden-world posterior probabilities, or competitive superiority of any 60-card deck. If the original policy's same-root native tape is not reproducible, all counterfactual outputs remain censored. A successful action replay also establishes only an action at one bounded root, not a game outcome.

Next, run the existing manually dispatched hidden-information workflow with both `agent23_native_opponent_hand_tape` and `agent23_native_bounded_opponent_hand_tape` enabled and `agent23_native_bounded_double_swap` true. Preserve 16-case per-root denominators, native strict tape errors and original-game action parity, and compare **successfully executable unique hand worlds**, rather than assuming `attempted` means `tested`. Check full original-source two-seat policy and paper-prompt qualifications independently before any claimed matchup win.

**Benchmark boundary:** 29/32 exact source 60s; ranks 23, 25, 28 missing; **zero competitively qualified wins**; no validated fixed 60 or 99.5% result.
