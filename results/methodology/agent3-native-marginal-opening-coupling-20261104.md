# Agent 3: native original-source setup coupling, 48 preregistered source contexts and 144 A/B/A captures

**4 November 2026 | actual compiled pinned Twinleaf Store opening-state experiment.** This is a *new developmental setup-only coupling protocol*, separate from archived game releases. It produced **zero completed games and zero competitively qualified outcomes**.

## Question and input custody

Can an original source's actual physical starting position change between fixed contenders because of **candidate-dependent mulligans and optional bonus draws**, even when the source 60, starting seat, source shuffled Prize identities and setup seed are controlled? This checks the setup mechanism relevant to the [unconditional marginal field contrast](agent3-unconditional-coupled-field-marginal-estimand-20261104.md). A positive witness cannot establish that game-win outcomes are properly sampled or that their marginal distribution is ideal.

[Pre-execution 48-group registration](../aichi-2026/registrations/agent3-source-marginal-setup-native-v1-20261104.json), [read-only actual native setup runner](../../simulation/evaluation/agent3-source-setup-audit.cjs), and [manual CI 41756953219](https://github.com/FlareZ123/experiment-01/actions/runs/41756953219) provide the reproducibility record. The run's head was `deead71e627ec9bb3d262a0c013269753fd77318`; pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; original 29-deck source-JSON Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`. **All 144 setup-only Store attempts succeeded**, with 48/48 exact first-vs-third reference-control physical source positions. The full original output is archived as [artifact 13288243945](https://github.com/FlareZ123/experiment-01/actions/runs/41756953219/artifacts/13288243945); ZIP SHA-256 `5891afb7c7e7220e444ddbd749d2472af382df85b0f713c682acfa705d0099a2`, uncompressed JSON SHA-256 `0b3981f335f3b2b1a66e402ed2526fd24f9f9748fb34efdfb265d834d891b728`.

The registered cohort comprises the authenticated original **rank 5** (11 Basic copies) and **rank 6** (4 Basic copies), 12 independently indexed fixed deterministic seed repeats for each, each with source physical seat 0 and 1. Every source context was opened three times in declared order:

`champion-reference 60 -> new-moon-lockbreaker-v1 60 -> champion-reference 60`.

The champion reference has 14 Basic Pokémon, while the new-moon contender has 17 by the nominated 60's Pokémon-stage inventory. Each physical original source deck is the same 60 in every arm. Deck resolution uses the repository's opt-in known printing proxies, and the native setup hook provides **separate deterministic per-seat shuffle streams** in the genuine pinned Store, retaining lawful candidate-mulligan bonus draw opportunity. That hook is a new comparison protocol and must not be substituted into any historical fixed seed release.

Actual Store snapshots include whole-60 inventory conservation, verified first-draw log, first-player seat, initial ordered original physical-position SHA-256, source Prize multiset digest, whether source held seven plus initial turn draw and optional bonuses, and counts of each player's setup shuffle actions. Hidden card identities are retained in the authenticated native archive for offline research, never fed to player policy.

## Exact observed outcome

| Native source setup evidence | Observed count |
| --- | ---: |
| Registered source seed/rank/seat contexts | **48** |
| Three-arm actual native setup attempts | **144/144 succeeded** |
| Repeat first and third champion physical source opening | **48/48 exact equal** |
| Champion vs New Moon physically identical original source setup | **43/48** |
| Champion vs New Moon original source physical setup different | **5/48** |
| Opponent Prize *multiset* digest identical across candidates | **48/48** |
| Verified same first-player seat across contenders | **48/48** |
| Source actually drew different opening bonus-card counts across candidates | **5/48** |
| Qualified paper games / completed games | **0 / 0** |

All five source-physical mismatches occurred in groups with a different source bonus draw count. The source had additional cards against the champion and none against New Moon in those groups. The individual registered groups and measured actual candidate setup-shuffle counts are:

| Source original | Repeat, physical slot | Champion source extras | New Moon source extras | Champion candidate shuffles | New Moon candidate shuffles |
| --- | --- | ---: | ---: | ---: | ---: |
| Rank 5 | 2, A | 1 | 0 | 2 | 1 |
| Rank 5 | 5, A | 1 | 0 | 2 | 1 |
| Rank 5 | 8, B | 2 | 0 | 3 | 1 |
| Rank 5 | 9, A | 1 | 0 | 2 | 1 |
| Rank 6 | 10, B | 1 | 0 | 2 | 1 |

Across **all** 24 rank-5 contexts, source optional extras actually drawn were champion **0 in 18, 1 in 5, 2 in 1**; New Moon **0 in 22, 1 in 2**. Across 24 rank-6 contexts: champion **0 in 23, 1 in 1**; New Moon **0 in 24**. Even when the source had the same Prize multiset and the first player matched, physical source positions can differ because the candidate caused a new bonus draw. The controlled per-seat shuffle approach and actual candidate-shuffle counts strongly support the proposed setup mechanism, but the experiment did not independently replay every intervening setup prompt to prove it was the sole possible cause of state differences.

## Paper mulligan expectation cross-check: small sample, directional evidence

A separate analytic model of an **ideal independently shuffled 60-card paper opening** gives a useful external sanity bound on the native totals. For a deck with `b` Basic copies, its seven-card mulligan chance is `q(b)=C(60-b,7)/C(60,7)`. Write `q_C=q(candidate Basics)` and `q_S=q(source Basics)`. The probability that the original source has a legitimate opportunity to draw **at least one** extra card after the candidate mulligans (allowing complete same-time double mulligan retries) is `q_C(1-q_S)/(1-q_C q_S)`. If the source elects every optional bonus, its expected number of extra cards is

`q_C(1-q_S)/((1-q_C q_S)(1-q_C))`.

These are **paper opening combinatorics**, not observed native distribution claims and definitely not matchup win percentages. The original rank1 champion-reference list contains 14 Basic copies and the New Moon proxy 17; the two selected opponents contain 11 Basic (rank5) and 4 Basic (rank6). The formulas and the 29-original source Basic-count source are related to the already existing [Agent32 combinatorial source-mulligan work](../../simulation/evaluation/agent32-adp-field-mulligan-offers.cjs).

| Fixed original source | Reference expected extras per independently random game | New Moon expected extras per game | Reference extras observed in 24 native samples | New Moon extras observed in 24 native samples |
| --- | ---: | ---: | ---: | ---: |
| Rank5, 11 Basics | 0.12908 | 0.07212 | **7** | **2** |
| Rank6, 4 Basics | 0.07011 | 0.03829 | **1** | **0** |

For each rank5 reference sample the idealized source draws at least one optional extra with probability about **0.11119**, and for rank6 about **0.06039**; New Moon yields **0.06611** and **0.03509** respectively. The observed reference surplus is directionally consistent with its smaller 14-Basic opening pool, yet this small fixed-seed cohort is **not** an unbiased empirical validation of those probabilities. For an ordinary independent 24-match rank5 reference sample, the exact ideal model gives expected **3.098** extra total source cards and approximately **5.33%** probability of seven or more. Observing seven is possible and does not demonstrate an engine error. These probabilities assume independent ideal uniformly sampled paper openings, which are not guaranteed by the deterministic per-seat xorshift seeds.

The source's choice to draw some, all, or none of its available bonus cards can affect actual hand identities. The native receipts show what was actually drawn under its automated setup logic; neither the analytic offer count nor this short study proves rational source choice or the full post-setup marginal game distribution.

## Interpretation and limits

The previous [Agent48 historical `5:101:A` rank5 mismatch](../aichi-2026/agent48-frozen-selected-v2-original-archive-posthoc-20261103.md) was a *different original game coupling*, and is unchanged. This new experiment demonstrates the mechanism on five **fresh, separately registered source contexts** using a stronger explicit per-seat setup coupling. It preserves every success and failure in the predeclared denominator. Same seed or matching source Prize identities alone do not assert same full source physical opening.

This is evidence for distinguishing **exact physical-source counterfactual comparison** (Agent46's deliberately strict estimator) from **unconditional naturally shuffled game-marginal comparison** (Agent3's separate estimator). If each contender's naturally randomized opening distribution, opponent compensations, opposing decisions and official match clock are correct, an unconditional performance difference remains defined even when openings differ across contenders. The new statistical comparator explicitly requires those assumptions, and no empirical game outcomes here meet them.

The first-turn setup experiment is deliberately short. It exercises neither realistic owner-policy actions, opponent counteractions, successful attacks, legal timed terminals nor full 32-rank benchmark coverage. Pinned Twinleaf's 32-bit seeded shuffle and the deterministic hash-derived seed schedule **are not independent ideal entropy for a mathematical confidence guarantee**. Correct per-candidate marginal distribution and any inferential alpha guarantee still require separate, better randomized protocol validation. The sample proportions **5/48** and **43/48** are descriptive diagnostic counts and must not be extrapolated to tournament win rates or claimed representative probabilities without independent sampling assumptions.

The field benchmark remains **29 authenticated source name/count inventories of 32**, missing ranks **23, 25, 28**, with post-event-art provenance caveats on the source archive, **zero** competitively qualified games, no selected final 60, and no proof of 99.5% wins.

**Agent 3**
