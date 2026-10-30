# Agent 29: real native Hammer pressure from a previously passing Aichi source
**UTC 30 October 2026.** Scope: original paper Expanded Aichi Open League 2026 rank-6 Iron Thorns source, with rank-11 Absol/Garbodor as absence control. **Evidence class:** compiled pinned-engine native Store actions, mechanically verified physical Energy discard, plus four retrospective same-deal OFF/ON development cases. No prospective matchup or win-rate evidence.

## Question and source identity
The original [rank-6 exact registered 60](full-decklists.json) has **four Crushing Hammer (POR)** and **two Enhanced Hammer (TWM)**. A prior frozen 32-arm scout with the original default policy observed **zero accepted Hammer plays by rank 6** despite these printed Items. Could a bounded policy that sees only the acting owner's own hand and the public board convert a baseline `PassTurnAction` into a real Item play, settle the original engine's prompts and remove opposing attached Energy without changing the physical initial deal?

Crushing Hammer is probabilistic and can target any attached Energy when heads. Enhanced Hammer targets Special Energy and does not require a coin. Do not equate the existence of a playable Hammer with its tactical advisability: preserving a card, leaving an opposing Energy attached for trapping or delaying denial, or playing a different line can be better. The experiment only tests action coverage and native resolution.

## Implementation and decision boundary
- [Owner-root and prompt adapter](../../simulation/twinleaf/agent29-actor-hammer-after-pass.cjs) is reversible and **opt-in**. It observes the exact acting owner's detached `actorObservation`, the owner's visible hand, public opponent attached Energy printings, the Item lock and the public static printed Energy catalog. It does not consult either hidden deck order, the opponent's hand printings, or face-down Prize identities.
- The adapter delegates every previously selected non-Pass root to the earlier policy. On a baseline Pass, an available Enhanced Hammer is prioritized when a publicly attached Special Energy is identifiable; otherwise a held Crushing Hammer can target an opposing Pokémon with Energy. The native physical card's `canPlay` checks the proposed action. Native validators resolve target Pokémon and attached Energy, and a physical card-identity comparison certifies that the selected opposing Energy actually left play and entered the opponent's discard pile.
- The [canonical common-actor composition](../../simulation/evaluation/agent7-canonical-actor-composition.cjs) exposes `AGENT29_HAMMER_AFTER_PASS_DEV=true` or `ownerHammerAfterPass:true`. **Default remains off**, and no source deck, candidate deck or historical trial seed is changed. The selector can operate for either physical seat, with observed seat encoded in receipts.
- The pinned Twinleaf engine internally samples its 50/50 Hammer coin from the game RNG, then exposes a `WaitPrompt` for coin-flip animation. Its result is **never selected by the actor policy**. The adapter resolves the owner wait and then the genuine post-heads target prompts. Separate staged native tests explicitly control the RNG to verify both heads and tails; the headless policy uses the original seeded engine RNG.
- The pinned engine stores an attached Energy object in both `PokemonCardList.cards` and `.energies.cards`. Native tests preserve the exact shared physical object, which is relevant because the engine's Enhanced Hammer `canPlay` reads the first representation.

## Validation and frozen provenance
**[Manual CI 40977694421](https://github.com/FlareZ123/experiment-01/actions/runs/40977694421) completed SUCCESS**, at research head `88535f338679221d0dd2930a8be7846384855bf3`, pinned upstream Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` under `vendor/twinleaf`.

All tests were green:
- [Pure root selector tests](../../tests/agent29-actor-hammer-after-pass.test.cjs): original rank-6 printed quantities, deterministic visible-target selection, locks and absent-opportunity gates, unchanged owner observation.
- [Genuine pinned Store native tests](../../tests/agent29-actor-hammer-pinned-native.test.cjs): Enhanced Hammer native play and actual Special Energy removal for **both physical seats**; Crushing Hammer successful heads discard and unsuccessful tails preservation using test-only controlled RNG; real target prompts and physical discard.
- [Same-deal source-first OFF/ON tests](../../tests/agent29-hammer-headless-native.test.cjs): four historical rank-6/rank-11 source-first arms, two fixed candidate sixties, each run with policy disabled and enabled. All initial source physical-deal fingerprints, actual starter seats and trial IDs match controls. Proposal-count reconciliation and native effect receipts passed.

Historical rank-6 source-first seed **407516727** and rank-11 source-first seed **482443328** are deliberately reused from existing retrospective source-first fixtures, not drawn for this experiment. The candidate occupies physical seat B in these cases; the original source occupies seat A. The two fixed candidate sixties are the rank-1 Shadow Rider reference and New Moon Lockbreaker v1. The historical fixture has four attempts total. No claim of adversarially optimized human decisions, independent repeated games, complete 32-deck coverage, or valid 99.5% estimate follows.

## Native paired result
This is the test's exact compact output, from the successful workflow's `AGENT29_NATIVE_HAMMER_RETROSPECTIVE_PAIR` line:

| Original source / selected arms | Baseline Pass roots seen by the adapter in treatment | Pass roots with viable owner Hammer | Original Store-accepted Hammer roots | Physical opponent Energy discards | Rejected Hammer roots |
| --- | ---: | ---: | ---: | ---: | ---: |
| **Rank 6 Iron Thorns**, two treatment arms | 42 | **2** | **2** | **1** | **0** |
| **Rank 11 Absol/Garbodor**, two treatment arms | 47 | **0** | **0** | **0** | **0** |
| Four-arm development total | **89** | **2** | **2** | **1** | **0** |

The rank-6 source in physical **seat 0** played its actual `Crushing Hammer POR` at global turns **45** and **61**; one native post-effect settlement at turn **61** moved `Psychic Energy MEE` into the opponent's discard. There is no separately certified Energy-discard receipt for the turn-45 attempt. The experiment did not independently aggregate coin outcomes; refrain from claiming the precise coin sequence from the absence of a discard receipt. There were **zero capped treatments** in the four cases as reported by the paired-test summary, and the paired assertions found no newly rejected Hammer roots. The same-deal assertion limits conclusions to the initial physical deals; later draw distributions can diverge after actions change.

The original archived frozen 32-arm policy had no accepted source Hammer roots. The new treatment therefore verifies a previously missing **source-owned gameplay channel** at authentic native roots, although later game trajectories and any tactical value have not been qualified.

## Exact opening-Hand incidence, with matchup limitations

The three authenticated Iron Thorns ex-only source decks at ranks **6**, **24** and **29** each contain exactly four Basic Pokémon in a 60-card deck. Their registered Hammer counts are rank6 **4 Crushing + 2 Enhanced**, rank24 **0 Crushing + 2 Enhanced**, rank29 **4 Crushing + 1 Enhanced**. The source first-seven-hand incidence conditioned on a Basic-valid initial seven follows exact hypergeometric sampling, before Prize placement and any optional opponent-mulligan bonus cards.

For `b=4` sole Basics, `h` disjoint specified Hammers and seven draws, the exact probability of holding at least one of those Hammers *conditional on holding any Basic* is:

`1 - [C(60-h,7)-C(60-h-b,7)] / [C(60,7)-C(60-b,7)]`,

where `C(a,k)` is the binomial coefficient. Explicit integer-combination evaluation yields:

| Exact source | Any Hammer in Basic-valid first seven | At least one Crushing | At least one Enhanced |
| --- | ---: | ---: | ---: |
| Rank6 Iron Thorns (4 Crushing, 2 Enhanced) | **49.95372%** | **36.39695%** | **19.90802%** |
| Rank24 Iron Thorns (0 Crushing, 2 Enhanced) | **19.90802%** | **0%** | **19.90802%** |
| Rank29 Iron Thorns (4 Crushing, 1 Enhanced) | **43.51358%** | **36.39695%** | **10.41406%** |

For rank6, the two families occur together in **6.35125%** of Basic-valid initial sevens; the **13.55677%** share that holds any Hammer but lacks Crushing is particularly important against a deck exposing only Basic Energy, because Enhanced Hammer cannot remove Basic Energy. These are exact **held-card incidence** calculations only. They do not give a chance to use Hammer on turn one, a probability of a useful target, the number of valid post-mulligan extra draws, a coin-success probability, or a match-winning value. They instead provide a quantitative reason to test the source's early Item decision vocabulary and to treat the two Hammers as distinct channels against different opponent Energy inventories.

## Limits and concrete next steps
The near-term research priority is measurable **opponent-policy competence**. This bridge only plays Hammers when the prior bot would Pass. It does not arbitrate against an immediately playable attack or more valuable Trainer, decide when to preserve denial for a future turn, correctly optimize coin-dependent matchup pressure, or solve Supporter and Bench contention. Agent 4 is independently testing Plumeria; its two-hand discard cost creates different DCI/AMR concerns. Source rank 6 also contains unexercised disruption cards and may win through passive lock without attacking. Future comparisons should use a common, strong both-seat policy and record actual target Energy removal, position effects, resource expenditure, game clock and source replies.

The 2026 Aichi Top32 source corpus remains **29 exact original 60s of 32**. Ranks **23, 25 and 28** lack authenticated exact lists. There is **no competitively qualified win result, no demonstrated superiority of any nominated fixed candidate deck, and no evidence for attaining 99.5%**.

**Reproduction:** Run the existing manually dispatched [canonical workflow](../../.github/workflows/agent7-canonical-actor-bilateral.yml) with `source_first_retrospective=true` at the pinned research revision, or after the pinned server build run the three tests named above. The Hammer action itself is opt-in and default off; the paired test toggles it explicitly. The workflow's original four-arm default experiment remains separate and unchanged.
