# Agent 22: valued owner-search bundles in native rank-7 Steven's Resolve

**30 October 2026. Evidence: original pinned Store, staged owner-visible search, two physical seats. Competitive-qualified games: 0.**

## Question and unchanged baseline

The canonical large-deck owner search can recover a full three-card native-valid Steven's Resolve bundle from the exact printed rank-7 Hiroto Fuji Snorlax Stall 60. Until now, `firstNativeValidBundle` chose the first lexically sorted legal bundle. That is an ownership-safe mechanical fallback but has no claim to choosing cards that answer the current board. Can the exact same native search be made conditional on an explicit, printing-only utility function while retaining genuine prompt legality, deterministic ordering, and end-turn settlement?

The source remains `results/aichi-2026/full-decklists.json`, rank 7, four Steven's Resolve CES, pinned Twinleaf Git link `vendor/twinleaf` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The existing native fixture stages an Active Wobbuffet PHF and one Steven in hand against a public Pidgey MEW. It is **not** a naturally dealt original competitive game. The first seven, six Prizes and mandatory draw are constructed deterministically; there is no full-match opponent policy.

## Implementation

- `simulation/twinleaf/agent22-sparse-owner-bundles.cjs`: optional `scoreBundle(printings)` callback. Enumerates all combinations up to the genuine `max<=3` for an owner-visible card inventory (at most 60), with the unchanged native `ChooseCardsPrompt.validate` gate. The score receives a frozen string-only printing multiset, without native card objects, deck order, or opponent concealed cards. Highest score wins; ties prefer more cards and then canonical lexical order. An empty selection is included **only** when the actual native prompt validator permits it. Without the callback, the previous first-native-valid behavior remains unchanged.
- `simulation/twinleaf/agent22-sparse-owner-search-adapter.cjs`: permits a reversible `scoreBundle` opt-in in the existing `withSparseActorOwnerSearch`. The original authenticated owner prompt and actual native physical reconstruction/Store dispatch are retained. Existing complete bounded menus can also be ranked; large prompts use the exhaustive scored native-valid solver. Caller-provided score code itself is a trust boundary: the concrete supplied scorer uses constant printed-card weights, while a future scorer must be separately audited for owner-information safety.
- Pure regressions `tests/agent22-sparse-owner-bundles.test.cjs` and `tests/agent22-sparse-owner-search-adapter.test.cjs` exercise invalid physical combinations, duplicate printings, optional zero, mandatory nonempty, stable tie-breaking, order permutation, two fake seats and concealed opponent-hand independence.

The additional native test in `simulation/twinleaf/agent22-steven-native-store-gate.cjs` repeats the original exact source stage for each physical owner seat with the first-native-valid control and an opt-in **hypothetical** scorer. The predefined scores are: VS Seeker PHF +10, Counter Catcher PAR +8, Capture Energy RCL +6, zero for other printings, and -100 per repeated printing. These weights are an intentionally explicit *illustrative preference*, not a demonstrated competitive source-player valuation.

## Native evidence

[Compiled manual GitHub Actions run 40977262129](https://github.com/FlareZ123/experiment-01/actions/runs/40977262129) **succeeded** on Git head `faf3b5053360f1c186fdd3ddc19577857a34f5b5`. The prior pure/native run [40977165774](https://github.com/FlareZ123/experiment-01/actions/runs/40977165774) also succeeded before adding the four-way comparison. The run is manual workflow dispatch with `native_search_only:true`, not a new on-push workflow.

[Artifact 12943316589](https://github.com/FlareZ123/experiment-01/actions/runs/40977262129/artifacts/12943316589), archive SHA256 `b615eb0419a85cc71e3cd48c6de62ef0fc8d285d1b4eb2e18edc23e2d3519295`, contains `agent22-steven-native-store-result.json`. The script has assertions for all of these observations:

| Native owner search | Physical seat 0 | Physical seat 1 |
| --- | --- | --- |
| Baseline first-native-valid full bundle | Artazon PAL, Bellelba & Brycen-Man CEC, Captivating Poké Puff STS | Same three |
| Opt-in valued full bundle | Capture Energy RCL, Counter Catcher PAR, VS Seeker PHF | Same three |
| Native valid/accepted search, postconditions | Pass | Pass |
| Owner deck after taking 3 from 46 | 43 | 43 |
| Remaining owner hand after completing Supporter | 9 | 9 |
| Completed native shuffle and opponent turn advancement | Pass | Pass |

**Correction after artifact inspection:** All four owner-selected **ChooseCardsPrompt** resolutions were genuinely accepted and the three selected cards reached hand. However, the archived run's original **ShuffleDeckPrompt.validate returned false** for the full 43-card permutation, due to the separately known pinned native numeric-comparison bug. The Store nevertheless progressed to the opponent's next turn, and it left an opponent-side WaitPrompt pending. Therefore CI 40977262129 independently proves printed choice and native search acceptance, **but does not certify the original shuffle validation**. The fixture has been updated to apply the repository's existing reversible `agent22-numeric-shuffle-validation-hook.cjs`, assert that the one original Store shuffle passes validation, and preserve the pending opponent-side prompt as an explicit post-handoff condition. A new compiled run is required before claiming a validated shuffle under that correction. Neither version establishes strategic skill or a completed game.

The pure tests also demonstrate that a legal optional search can score its empty bundle highest when all offered selections have negative value, or choose a single legal card under a mandatory nonempty search. These are mathematical policy affordances rather than in-game timing or strength observations.

## Limits and integration guidance

This mechanism improves **choice expressiveness**, not evidence of search-line quality or the 99.5% field objective. It contains a hand-picked score vector; it does not evaluate actual opponent threats, Alternative ALS lines, next-turn resource competition, lock and retreat costs, official clock constraints, or competing Supporters. The fixture lacks a natural opening and an autonomous opponent reply. It records no deck-vs-deck win and does not prove that the valued bundle is preferable to the lexicographic control in this particular stage.

The integration owner is Agent 41. The reusable intake is a detached printing-only, native-validated bundle selector, ideally coupled later to a common owner-visible opportunity-cost scorer, with real source-dealt state, best competing line, owner-K0/K1 knowledge and native response evidence. Do not silently switch baseline policy defaults or count these four mechanism probes as qualifying matches.

**Field status unchanged:** 29/32 exact original sources; ranks 23, 25 and 28 still missing; zero competitive-qualified games, no established fixed 60 or 99.5% win rate.
