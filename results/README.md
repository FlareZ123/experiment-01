# Fixed-60 decision board

**Status — 13 November 2026:** no final fixed 60 selected; zero competitively paper-qualified games; no demonstrated 99.5% win rate. The governing objective is paper **Expanded (Black & White onward)**. The Aichi Open League 2026 lists are source inventories from a Japanese Extra event, not automatically legal Expanded opponents.

## Benchmark eligibility

| Classification | Count | Ranks / consequence |
| --- | ---: | --- |
| Original Aichi lists authenticated | 29/32 | Ranks 23, 25 and 28 remain unavailable |
| Unchanged lists incompatible with international Expanded | 5/32 | Ranks 3, 6, 7, 24 and 29 contain 14 copies of three Japanese-only promo identities |
| Authenticated lists with card-pool / official-banlist / Japanese-identity and deck-construction screen passed, physical source print unresolved | 20/24 | Ranks 8–22, 26, 27, 30–32; proxy screens, not physical-print certification ([ranks 8–16](aichi-2026/2026-11/agent39-ranks8-16-expanded-eligibility-screen-20261113.md) · [ranks 17–22, 26–27, 30–32](aichi-2026/2026-11/agent3/expanded-proxy-audit-ranks17-22-26-27-30-32-20261113.md)) |
| Other potentially compatible authenticated lists not yet per-rank screened | 4/24 | Ranks 1, 2, 4 and 5 |
| Verified Expanded-legal opponent lists | **0/32** | No rank currently qualifies for the Expanded field denominator |

Do not equate 29 authenticated source lists with 29 legal opponents. The 20-rank screen passes English card-pool and current official Expanded banned-printing checks; the newly screened 11 also pass the four-copy, one-ACE-SPEC and Prism Star copy checks. The existing Japanese identity/effect audits cover the relevant same-name ban collisions. Exact physical Japanese prints remain unverified. The official overlay finds zero exact banned-printing hits in the 29 lists, but eight banned prints have stale `expanded: Legal` flags in the bundled snapshot, so never use that flag alone as the ban gate ([overlay report](aichi-2026/2026-11/agent3-expanded-banlist-snapshot-discrepancy-20261113.md)). The XYP chronology exceptions are now mapped to pre-event Japanese prints ([crosswalk](aichi-2026/2026-11/agent39-xyp-japanese-print-crosswalk-20261113.md)), but this does not prove which copies players used. Preserve all original lists; do not invent missing lists, substitute cards, or silently change the game ruleset to Japanese Extra. The current clean format-contract proposal is [PR #46](https://github.com/FlareZ123/experiment-01/pull/46); it is open and non-draft, and its current head has a green Node 22 CI run, but it remains unmerged and its branch has diverged from main. Its empty `availableRanks` result is not yet a production release. See the [source-format incompatibility audit](aichi-2026/2026-11/agent3/format-contract-player-ceremony-20261112.md), [Expanded legality review](methodology/2026-11/agent7-expanded-vs-aichi-field-legality-audit-20261112.md), and [missing-list source audit](aichi-2026/missing-opponent-list-source-audit-20261107.md).

## Fixed-60 candidates

| Candidate | Current decision |
| --- | --- |
| [Rank-1 Shadow Rider champion reference](aichi-2026/benchmark-shadow-rider.md) | Developmental comparator only; not a proven best deck. |
| [Hood Shield Shadow Rider v1](aichi-2026/candidate-hood-shadow-rider.md) | Leading modified-list hypothesis, **not selected**. In the 116-native-arm all-29 comparison, both leading lists had 31 native wins. Of 55 matched source-deal groups, 41 completed in both arms and completed winner reversals favored Hood 6–3; the exact censored win-count difference remains **[-9, +13]**, so ordering is unresolved. Its [Expanded-normalized 60](decks/hood-shield-shadow-rider-v1-expanded-legal-60.md) is a legal-printing export, not a strength result. |
| [Temple Shadow Rider v1](aichi-2026/candidate-temple-shadow-rider.md) | Regidrago-focused development hypothesis; paired evidence is small and censored. |
| [New Moon Lockbreaker v1](als/new-moon-lockbreak-60-candidate.md) | Whole-architecture challenger; developmental comparison is policy-sensitive and heavily censored. |
| [Psychic Reserve Iron Thorns/Mimikyu v3](aichi-2026/candidate-iron-thorns-psychic-reserve-v3.md) | Developmental branch; small six-rank native panel, no paper-qualified games. |
| Sentinel Lopunny/Vileplume v1/v2 | Conditional lock concepts; no autonomous complete competitive game. See [v1](aichi-2026/candidate-sentinel-lopunny-vileplume-v1.psv), [v2](aichi-2026/candidate-sentinel-lopunny-vileplume-v2-whismur-doublelock.psv), and the [counter-census](aichi-2026/2026-11/agent27-sentinel-double-lock-field-counter-census-20261112.md). |

No candidate has a certified winner ranking, field win-rate estimate, or final nomination. Preserve historical candidate fingerprints and raw experiments.

## Execution and qualification

- **Owner-directed fixture:** the existing [Agent36 manual workflow](../.github/workflows/agent36-bilateral-competence-v9.yml) has a secure, explicitly fixture-only native-game path. It has **not** run against the pinned Store. The owner must configure the public Actions variable `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM`; keep its private key offline. After configuration, use the existing manual input—do not add another workflow or upload plaintext. The fixture is an Expanded engineering diagnostic, not a physical paper match or competitive matchup.
- **Candidate-policy integration:** PR #41 reports a pinned-Store staged Hood → paid retreat → Clefairy attack/Prize sequence passing 4/4 variants, alongside its retreat matrix. This is useful mechanics evidence only; it does not exercise the candidate actor-only chooser, source-dealt access, or a complete game. PR #41 is stacked on draft PR #38. PR #45's Hooded Block root option remains default-off. Stacked PR #47 adds an Agent34/Agent43 chooser-to-pinned-Store fixture and now wires it into the existing manual workflow, but no workflow run has occurred. Keep the option default-off until that native fixture passes and the suppressor/false-veto findings are independently resolved.
- **Production admission:** main still does not contain the V3 evaluator, field validator and two-phase bundle builder as a merged production release. PR #46 carries the format/date contract and digest-recomputed regressions; its Node 22 workflow passed on head `6e5a475`, but the branch still needs rebase/merge. The main-branch paper-review contract therefore remains unqualified, and the PR's green CI does not make any Aichi rank eligible. See the [V3 deck-aware policy-competence contract](methodology/2026-11/agent43-v3-deck-aware-policy-competence-20261112.md), [builder/adversarial review](methodology/2026-11/agent49-v3-adversarial-builder-runner-review-20261113.md), and [MCTS information-boundary audit](methodology/2026-11/agent50-information-set-mcts-boundary-audit-20261113.md).
- External reviewer outreach and registry provisioning remain paused at the owner's direction. Do not resume them until the owner does.

## Highest-value next work

1. Recover original Aichi ranks **23, 25 and 28**; complete physical-print bridges for the 20 card-pool-screened ranks 8–22, 26, 27 and 30–32, and per-rank screening for the four remaining potentially compatible lists (1, 2, 4 and 5). Apply the independently sourced current-English Expanded banned-printing overlay rather than trusting bundled `legalities.expanded` flags; its eight stale flags have zero exact hits in the 29 Aichi lists. Keep the five unchanged format-incompatible lists explicitly out of the Expanded denominator.
2. Complete the candidate-specific Hood root-policy path through the real Agent34 actor-only chooser and pinned Store, using the staged native sequence as an acceptance fixture. Keep it default-off until the policy's suppressor/false-veto findings are independently resolved. Do not turn staged board evidence into a matchup claim.
3. Once the owner configures the diagnostic public key, run the existing secure fixture once, inspect both actual decision traces, fix general causes, and replay. Keep this fixture non-admitting.
4. Only after a nonempty, source-authenticated Expanded opponent field and independently competent frozen policies exist, execute the balanced field contest. Report each rank, both candidate seats and both first-player assignments separately; do not infer a 99.5% result from a subset or a proxy metric.

## Research map

- [Original Aichi source coverage](aichi-2026/missing-opponent-list-source-audit-20261107.md) · [format incompatibility](aichi-2026/2026-11/agent3/format-contract-player-ceremony-20261112.md) · [Expanded field audit](methodology/2026-11/agent7-expanded-vs-aichi-field-legality-audit-20261112.md) · [official banned-printing overlay](aichi-2026/2026-11/agent3-expanded-banlist-snapshot-discrepancy-20261113.md) · [ranks 8–16 screen](aichi-2026/2026-11/agent39-ranks8-16-expanded-eligibility-screen-20261113.md) · [XYP Japanese-print crosswalk](aichi-2026/2026-11/agent39-xyp-japanese-print-crosswalk-20261113.md)
- [V3 policy competence](methodology/2026-11/agent43-v3-deck-aware-policy-competence-20261112.md) · [balanced-field confidence design](statistics/agent12-simultaneous-128-stratum-matchup-confidence-20261107.md)
- [Simulator fidelity](../simulation/twinleaf/) · [Twinleaf findings](twinleaf/) · [methodology](methodology/) · [strategy research](strategy/) · [historical decision-board snapshot](archive/decision-board-20261113-before-critic-compaction.md)

The archived snapshot preserves the prior detailed implementation notes. Keep this index decision-first; add new atomic evidence to its subject area and update this page only when candidate selection, field eligibility, or competitive qualification materially changes.
