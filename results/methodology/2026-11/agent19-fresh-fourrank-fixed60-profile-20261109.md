# Two different fixed 60s: fresh four-rank Aichi paper-core native comparison

**Agent 19, 9 November 2026 | Frozen branch `agent19/frozen-dual60-20261109` | Native development, no paper-qualified games.**

## Selection-relevant decision

A complete **32-attempt** study now directly compares the unchanged rank-1 **Shadow Rider Calyrex champion-reference 60** against the unchanged **New Moon Lockbreaker v1 60**. Each faces the exact original published Aichi sixties for ranks **5 Mew Genesect, 6 Iron Thorns, 11 Mega Absol/Garbodor and 13 Regidrago**, in both physical seats with two independently registered repeats. Both printed 60-card lists, all original source 60s and both-player actor decisions stay fixed across the 16 seed/rank/seat groups.

**Provisional development signal: the Shadow Rider reference finishes more games and wins more of its native terminals on this diagnostic subset.** It produced **10 native candidate wins among 13 native terminals** (16 total attempts), versus **6 wins among 10 native terminals** for New Moon (16 total attempts). This is a statement about these exact current automated player trajectories, **not a competitive win rate or a recommendation to declare a final deck**. The four archetypes are a deliberately incomplete field subset, and the nine root-capped cases are censored.

## What actually ran

- Fresh registration, sealed before any comparative native outcomes: [16 seeds and 32 immutable trial IDs](../../aichi-2026/registrations/agent19-dual-fixed60-four-source-papercore-prospective-20261109.json). Six source and policy Git blobs and pinned Twinleaf engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` match on the isolated branch.
- Reusable explicit opt-in corrected-source profile: [paper-semantics wrapper](../../../simulation/twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs), covering Celestial Roar v2, Energy Mix shuffle and AttachEnergy blockedTo. Same three corrections enabled across both actors and contenders.
- Actual `runDevelopment` runner: [fixed dual-contender executable](../../../simulation/evaluation/2026-11/agent19-dual-fixed60-fourrank-paperprofile-native.cjs), frozen two-seat v8 `agent41-frozen-bilateral-development-v2.json` plus identically applied generic owner tactical options. Seat-isolated policy RNG and post-setup physical shuffle RNG, with shared original setup RNG; **actual full-source fingerprints, not seed equality alone, decide pairing admission**.
- [Compiled green Actions run 42564022107](https://github.com/FlareZ123/experiment-01/actions/runs/42564022107) on frozen branch head `fc008ef85c8fab3403d9de5d69f3b94a3a21ee44`; [archived raw full attempts, artifact 13650203351](https://github.com/FlareZ123/experiment-01/actions/runs/42564022107/artifacts/13650203351), ZIP SHA-256 `cad35cf7208e8d4704247dc170d1ac6c514841ec67e254c270fd5561c6329435`. Raw decoded JSON is ~37 MB and retains every root, complete outcome, engine exception and physical receipt.

## Result and per-rank comparison

| Original source rank | Matched source openings / 4 | Both-terminal matched pairs / 4 | Shadow Rider outcomes (win, loss, cap) | New Moon outcomes (win, loss, cap) |
| --- | --- | --- | --- | --- |
| 5 Mew Genesect | 4 | 4 | 2, 2, 0 | 2, 2, 0 |
| 6 Iron Thorns | 3 | 2 | 2, 1, 1 | 1, 1, 2 |
| 11 Mega Absol / Garbodor | 4 | 2 | 4, 0, 0 | 2, 0, 2 |
| 13 Regidrago | 4 | 1 | 2, 0, 2 | 1, 1, 2 |
| **Total** | **15/16** | **9/16** | **10, 3, 3** | **6, 4, 6** |

All **32** native games produced a genuine original physical opening and accepted roots, with **0 engine errors**, **23 native terminals**, **9 root-260 action caps** and **32/32 `SETTLED_PHYSICAL_INTEGRITY_PASSED`**. The previously empty all-abort green-run failure mode now has an explicit nonvacuous development admission check and eight passing isolation/admission unit tests.

Of the **nine physically matched and both-terminal pairs**, seven were Shadow Rider native candidate wins and six were New Moon wins. **Three of those nine** changed winner when switching the fixed 60: rank5 `5:0:B` favored Shadow Rider, rank5 `5:1:A` favored New Moon, and rank6 `6:1:B` favored Shadow Rider. Those are counterfactual native events under *actually matching original source physical openings*, not guaranteed matchup improvements under skilled play. Rank6 `6:1:A` failed the source-fingerprint equality check, and both of its games capped; it is included in attempts and excluded from causal matched-pair counts.

The combined paper profile recorded 53 accepted native Energy target prompt inspections, zero illegal target rejections, and exactly one original rank13 Celestial Roar attack captured by the external root ledger. **No Energy Mix effect occurred naturally** in this 32-run sample; the previously completed two-seat constructed Store matrix establishes its semantics but this study does not claim field activation. The 32 physical integrity passes show no full-card loss on these runs and do not certify all possible card effects.

## Decision and next experimental design

The current strongest **developmentally observed** fixed 60 among these two candidates is the published rank1 champion reference. Hold **New Moon Lockbreaker** as an unqualified structural challenger: the prior exact model gives at most **13.77%** joint early access to its two lock counters under optimistic Iron Thorns mulligans, and this native panel has more New Moon caps and fewer natural wins. Those facts challenge rapid promotion of New Moon, while one matched original rank5 terminal also shows that New Moon can win a game that the reference loses.

The next structural improvement should target early meaningful setup/attacks and per-owner use of discrete disruption under the same validated paper core, followed by a fresh **larger original-field, both-seat comparison of different fixed 60s**, with a competent source opponent and physical card/clock qualification. Merely increasing a card-access proxy or repeating the same four ranks cannot prove 99.5% against all Top32.

**Nonqualifications:** This is not a randomized human field trial, Aichi official wall clock is unmodeled, source and candidate decision policies have weak spots and some source scripts, partial Japanese printing legality remains, ranks23/25/28 lack authenticated opposing printed 60s, and action caps prevent complete results. **Qualified paper games = 0. Final 60 selection = none. Verified 99.5% = none.**

### Failed-attempt recovery, preserved without false success

The first [main-branch attempt 42562963041](https://github.com/FlareZ123/experiment-01/actions/runs/42562963041) executed native actions but rejected all 32 rows at the runner's randomness manifest assertion, yielding no reportable game outcomes. A historical Genesect root regression blocked [42563398369](https://github.com/FlareZ123/experiment-01/actions/runs/42563398369), and a concurrent shared-runner version change correctly blocked [42563637021](https://github.com/FlareZ123/experiment-01/actions/runs/42563637021). The source, runner and exact registered blobs were frozen in an isolated immutable Git branch, the randomness request was passed through the native runner itself, and [42564022107](https://github.com/FlareZ123/experiment-01/actions/runs/42564022107) was the first fully admitted 32-game comparison. No game outcomes from an earlier run were used to select a specific seed.
