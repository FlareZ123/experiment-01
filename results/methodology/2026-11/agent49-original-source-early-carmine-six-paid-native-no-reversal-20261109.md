# Original-source early Carmine: six fully paid native plays, zero completed winner reversals

**Agent 49, 9 November 2026.** This is a developmental policy decision result, not a paper-competitive game sample.

## Frozen comparison and repaired execution

The pre-implementation [16-group registration](../../aichi-2026/registrations/agent49-source-carmine-first-own-turn-16pair-20261109.json) fixes 8 original rank-11 Absol/Garbodor and 8 original rank-18 Regidrago physical source seeds, 4 of each candidate orientation per rank. Both treatments retain the **identical printed source 60**, the same **New Moon Lockbreaker v1 60**, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, and the 260-root ceiling. The proposed source-only action is **Carmine TWM** on the first own turn, only where the frozen native policy would pass, source owner holds the genuine card, the owner Supporter quota is available and native `canPlay` returns true.

The first native run [42549541906](https://github.com/FlareZ123/experiment-01/actions/runs/42549541906) produced **six live proposed plays but zero counted settlements**, with five induced treatment-side errors at a direct pre-dispatch `owner.discard.cards` receipt read. That is an instrumentation failure and must not be used as evidence against Carmine. The census job also failed an unrelated outdated contract assertion; the independent native job completed.

The adapter now checks zone-list availability, records unavailable telemetry separately and refuses to certify physical settlement without the necessary physical zones ([repair](https://github.com/FlareZ123/experiment-01/commit/45b08c6ba6e0d88a622743bbf5c923bf8b8e15a0), [regression](https://github.com/FlareZ123/experiment-01/commit/8d1dbd389eff623c127ced979678ba125e9a6cad)). **Both census and native jobs passed** in [fresh run 42642374801](https://github.com/FlareZ123/experiment-01/actions/runs/42642374801); the full 32-attempt JSON is retained in [native artifact 13684978838](https://github.com/FlareZ123/experiment-01/actions/runs/42642374801/artifacts/13684978838). Every registered physical group appears in both arms and all sixteen physical-deal fingerprints match.

## Native result

| Measure | Control | Source-Carmine treatment |
| --- | ---: | ---: |
| Native terminals | 10 | 9 |
| Native engine errors | 3 | 4 |
| 260-root censored games | 3 | 3 |
| Confirmed Carmine Store commitments | 0 | 6 |
| Confirmed full five-draw and complete other-hand discard | 0 | 6 |
| Confirmed first root Pass → Carmine divergence | 0 | 4 |
| Followed by meaningful opponent root *and* later source own-turn root | 0 | 4 |
| Completed winner reversals with matching physical deals | 0 | 0 |

Source actor-only physical payment was **2, 3, 4, 4, 4 and 5 other hand cards** across the six accepted Carmine plays, all physically moved into the owner's discard, followed by 5 real cards drawn from the owner's deck. All six had final `supporterTurn=1`, zero unsettled prompts and no unavailable owner-discard receipt. None reads opponent hidden hand.

| Frozen physical group | Discarded other hand cards | Native disposition | Source accepted attack roots, control → treatment |
| --- | ---: | --- | ---: |
| rank11, 4900, source seat1 | 3 | Both terminal, unchanged winner seat1 | 13 → 14 |
| rank11, 4902, source seat1 | 5 | Both engine error; source chronology cannot be compared | unavailable |
| rank11, 4904, source seat1 | 4 | Control terminal, treatment decoder error; no winner comparison | unavailable |
| rank18, 4908, source seat1 | 4 | Both root-capped | 0 → 0 |
| rank18, 4909, source seat0 | 2 | Both terminal, unchanged winner seat1 | 8 → 6 |
| rank18, 4910, source seat1 | 4 | Both root-capped | 0 → 0 |

The four source first-root divergences were 4900, 4908, 4909 and 4910. Each had at least one later consequential opponent root and one later consequential source own-turn root. Root counts are **native action observations**, and later root presence by itself does not certify strategic quality. For 4904, native treatment diverged into a redacted bot decoder failure; no causal winner claim is permitted. The two 4902 arms already failed with the same redacted decoder hash. The base common policy is developmental and incomplete.

## Deck decision

**Do not promote an unconditional first-own-turn Carmine-over-Pass rule into the selected shared policy or claim field performance from it.** It consumes substantial other-hand resources, produces one higher attack count and one lower count among the two both-terminal accepted cases, and **zero actual winner reversals** in this small censored panel. The rule is mechanically viable on these six source states; its *strategic* merit is unestablished. Any renewed Carmine proposal should first identify an owner-visible hand and matchup condition expected to change a specific attack/control sequence, then freeze a new counterfactual with comparable opponent continuation.

This closes the outstanding six-proposal native receipt bug. It leaves the repo-wide benchmark unchanged: no final fixed 60 selected, 29/32 original opponent lists, zero competitively paper-qualified games, no demonstrated 99.5% field win rate. The immediate higher-value work is an accepted **complete opponent-contested resource-to-attack/control episode** in a common two-player release profile, with paper and clock review kept independent of native terminal status.
