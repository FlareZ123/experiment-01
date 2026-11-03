# Original rank-31 first-own-turn Roxie / Koffing / Radiant board geometry

**Agent 15 | 3 November 2026 | authenticated original rank-31 printed 60, exact BigInt physical-card combinatorics, independently seeded literal physical deals; zero competitive games.**

## Decision-relevant question

An existing authentic rank-31 source Store case selected Roxie CEC205, discarded Koffing CEC76 and reached Koffing's optional Blow-Away Bomb prompt; an opt-in policy confirmation put a damage counter on each of six opposing Pokémon, but the observed 240-action continuation ended at an action cap with no new Prize gain. The historical v8 shared prompt guard prevented several illegal Roxie **payment replies** but left the earlier empty-eligible **PlayCard root** unguarded. **Current shared portfolio v11 has since introduced a source-stamped Roxie no-eligible-root veto** in `simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs`; this newer change does not itself prove that it is selected in a qualified natural opponent policy. See [native printed chain](agent43-rank31-koffing-root-confirmation-pair.md), [shared v8 paper contract](agent46-rank31-roxie-unified-payment-paper-portfolio-native-20261101.md), and [earlier rank-31 first-draw access](agent15-rank31-roxie-koffing-firstdraw-20261101.md).

A natural first-turn source line can take one further step if original **Radiant Alakazam SIT59** is in play: following a successful Roxie-paid Koffing Blow-Away Bomb, its **Painful Spoons** Ability can relocate up to two of the opponent's damage counters from one opposing Pokémon to another. The Ability requires a valid recipient and must remain unsuppressed; one Koffing places only one counter per opposing Pokémon, so this line's possible benefit depends on an opposing Bench and the other damage in the state.

This study measures how often the three source identities can occupy the correct **hand and player board zones** on the first own turn going second, *before* any natural search or extra draw. It does not certify a selected Ability or a damage/KO payoff.

## Strict physical setup and original source identity

The authenticated rank-31 source 60 contains exactly Roxie **4**, Koffing **3**, Radiant Alakazam **1**, **15 Basic Pokémon** in total, and 7 eligible Evolution Pokémon. Verify source IDs against [full-decklists.json](full-decklists.json). The seven mutually exclusive physical classes have copy counts `[3 Koffing, 7 other conservatively Roxie-eligible Basics, 1 Radiant Alakazam, 4 conservatively ineligible Basics, 7 eligible Evolution, 4 Roxie, 34 other]`, totaling 60.

1. Shuffle 60 cards uniformly. Require at least one Basic in the **opening seven**; a Basic first appearing on the eighth draw cannot repair an illegal opener.
2. Choose an opening Active *before the first draw*. To preserve a Koffing payment, prefer a non-Koffing Basic if present; use a Koffing only if forced. Make no initial voluntary Bench commitments except those needed for the proposed Radiant line.
3. Set six unknown Prize cards, then take **one ordinary first-own-turn draw**. Marginally this draw has 53 equiprobable physical identities beyond the opening seven, even though six are hidden in Prizes.
4. Require a retained Roxie and Koffing in hand. For the triad require Radiant Alakazam in the first eight, with a place on the Active Spot or Bench before Roxie. The conservative second-payment event counts a second Roxie-eligible Pokémon card after Active selection.
5. For the **Bench-Radiant** subevent, select the opening Active using a realizable pre-draw policy: another non-Radiant/non-Koffing Basic if present; otherwise a Koffing when **at least two** Koffing were in the first seven; otherwise Radiant when it is the only way to preserve the Koffing. This is chosen without knowing the eighth card. The complement of this Bench subevent in the triad requires Radiant to start Active under this source starter policy.

The `includeModernEx` sensitivity treats lowercase modern Pokémon ex differently from historical Pokémon-EX/GX for the Roxie eligibility clause, while keeping the published 60 and all opening identity counts unchanged. This affects optional second payments but not the three-card or starter-zone event.

## Exact physical opportunity results

All probabilities are **conditional on a Basic-valid initial seven**, among uniformly random source shuffles. Denominator: **18,063,846,900** equally weighted opening-seven / eighth-category slot combinations (340,827,300 valid combinations × 53). These are expected physical opportunities, not realized card-play frequency.

| Pre-registered observable condition after the first ordinary draw | Exact favorable weight | Conditional rate |
| --- | ---: | ---: |
| Roxie plus retained Koffing, independent of Radiant | 2,295,407,528 | **12.70719100%** |
| Roxie plus retained Koffing **and Radiant** held/reachable for play | 309,765,032 | **1.71483424%** |
| Triad with Radiant originally among starting seven | 280,622,167 | **1.55350169%** |
| Triad where Radiant first arrives on the eighth draw | 29,142,865 | **0.16133255%** |
| Triad can put Radiant **on Bench** under preselected opening Active policy | 214,720,841 | **1.18867726%** |
| Triad requires Radiant **Active** under the same policy | 95,044,191 | **0.52615698%** |
| Triad plus at least a second conservative Roxie payment | 277,349,483 | **1.53538438%** |

Only **13.49499%** of the physical Roxie-plus-retained-Koffing hands also have direct access to the singleton Radiant by this first-turn draw. Of those triads, **69.31733%** admit the preselected Bench-Radiant policy, while **30.68267%** put Radiant Active when retaining Koffing.

Under printing-literal lowercase Pokémon ex payment eligibility, the triad and Bench/Active split are unchanged; the triad with a second eligible payment rises slightly to **1.54281422%**, with exact favorable weight **278,691,599**. The *same* cards and locations are sampled throughout.

These are intentionally narrow **no-search/no-extra-draw** cases. As with the earlier 12.707% envelope, Item searches, Supporters, Abilities, mulligan bonus cards, a different play order, and later turns can enlarge or shift access. No match result, lock effectiveness or first-turn damage advantage can be inferred from the percentages.

## Independent verification and paper/native vetoes

The exact [reusable CJS enumerator](../../scripts/agent15-rank31-roxie-radiant-triad.cjs) uses seven-class multivariate hypergeometric weights and each class's remaining count for the eighth draw. [Four source-guarded regressions](../../tests/agent15-rank31-roxie-radiant-triad.test.cjs) assert original printing, exact integer weights, independent geometry partitions, full parity with the earlier retained-Koffing result and modern-ex sensitivity. The new test is also included in the existing manual-only [global field gate workflow](../../.github/workflows/aichi-global-field-gate.yml).

Separately, a 500,000-shuffle seeded **literal sample of eight physical source cards** yielded 441,416 Basic-valid openings; among them 7,589 triad opportunities (1.71924%), 5,133 Bench-Radiant opportunities (1.16285%), and 6,758 triad plus second-payment opportunities (1.53098%). Sampling fluctuations are compatible with the exact figures. This independent sample did not execute the game engine or resolve hidden actions.

For a genuine source-line release, the selected source policy must show its actual starting Active choice, all original hand/Prize/Bench states, owner-legal PlayCard Roxie root, one or two **physically eligible** Roxie payments, actual discarded Koffing and its **affirmative** optional ability decision, an in-play unsuppressed Radiant, at least two opponent Pokémon where a meaningful Painful Spoons target exists, the correct counter movement, and opponent follow-through. Preserve both starting orders and both seats, including missed and denied opportunities. **The first-player first-own-turn cannot play an ordinary Supporter**, so this direct one-draw Roxie model applies to the going-second first-own-turn window; going first requires separate later-turn modeling.

## Scope and status

This is a concrete source-player **access-to-effect chain** admission denominator. It cannot convert earlier prepared-board successes into a qualified trial and does not prove that the original rank31 source ever chooses this line. A 1.71% direct physical first-turn triad is too rare to justify claiming routine early use without a verified search/draw extension. This study provides a specifically testable miss/selection ledger for the shared bilateral policy and identifies when nominal card access requires an exposed Radiant Active.

The complete field remains **29/32 authenticated opposing originals** (missing ranks **23, 25, 28**), **zero competitively qualified games**, and **no proven fixed 60 with 99.5% wins**.
