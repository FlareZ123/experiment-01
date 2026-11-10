# Rank-7 fixed Hood Shield: Active Psychic allocation changes real native lines

**Investigator:** Agent26  
**Study run:** [GitHub Actions 42725425474](https://github.com/FlareZ123/experiment-01/actions/runs/42725425474)  
**Registered input:** `results/aichi-2026/registrations/2026-11/agent33-rank7-hood-active-funding-fresh16-20261109.json` (16 fresh source-matched opening groups, 8 per physical candidate seat)  
**Runner:** `simulation/evaluation/2026-11/agent33-rank7-hood-active-funding-fresh16.cjs`, at Git head `fb6e3e56d0570931316462ec69f334465eac1e17`  
**Engine:** pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
**Decks:** immutable `hood-shield-v1` from `results/aichi-2026/candidate-hood-shadow-rider.json`, original Aichi rank-7 Snorlax Stall from `results/aichi-2026/full-decklists.json`.  
**Intervention:** `actorUnderworldActiveFundingPriority=true` for both acting seats, compared to the same actor policy with that option false. No printed deck swaps. No prior exposed seed `1693388692`.

## Outcome

The registered run **succeeded**, and the source/candidate physical deal fingerprints matched in all **16/16** pairs. Each candidate played the same fixed sixty across the comparison. Engine output preserved all **32** native attempts in the uploaded run artifact `agent33-rank7-fixed-hood-active-funding-fresh16-native.zip` (artifact ID `13722751154`; compressed 1,985,884 bytes, JSON 59,443,341 bytes). Source candidate identity and native first-turn receipts were retained.

| Measure | Control | Active-funding treatment |
| --- | ---: | ---: |
| Accepted candidate manual Active Basic Psychic attachments | 27 | **44** |
| Settled candidate attacks | 191 | **212** |
| Native candidate terminals | 1 | **2** |
| Native original-source terminals | 7 | **3** |
| Action-cap censored attempts | 8 | **11** |
| Error attempts | 0 | 0 |
| Fully qualified paper-competitive games | 0 | 0 |

The targeted `underworldActiveFundingPrioritySelected` root fired **20** times across **8/16** treatment games. The first differing actual native root in each of those eight games was an **Underworld Door `UseAbilityAction`** in control versus **`PlayCardAction` paying a Psychic Energy to Active** in treatment. These are real Store action traces, not theoretical graph connectivity.

### Complete prospective paired evidence

The first differing root is recorded as `global turn / root action ordinal`. `Censored` denotes the runner's 260-action native cap, which establishes no winner. All 16 pairs had matching original-source and Hood Shield initial physical deals.

| Trial | Funding roots selected | Manual Active Psychic control → treatment | Candidate attacks control → treatment | Control terminal → treatment terminal | First differing root |
| --- | ---: | ---: | ---: | --- | --- |
| 0A | 0 | 2 → 2 | 10 → 10 | censored → censored | none |
| 1A | 0 | 4 → 4 | 0 → 0 | censored → censored | none |
| 2A | 3 | 1 → 4 | 12 → 15 | censored → censored | 39 / 157 |
| 3A | 0 | 4 → 4 | 19 → 19 | censored → censored | none |
| 4A | 5 | 2 → 5 | 0 → 12 | source win → censored | 8 / 43 |
| 5A | 0 | 2 → 2 | 17 → 17 | source win → source win | none |
| 6A | 0 | 2 → 2 | 1 → 1 | candidate win → candidate win | none |
| 7A | 3 | 2 → 5 | 15 → 16 | censored → censored | 34 / 155 |
| 0B | 0 | 1 → 1 | 16 → 16 | source win → source win | none |
| 1B | 3 | 0 → 3 | 6 → 7 | **source win → candidate win** | 36 / 123 |
| 2B | 0 | 1 → 1 | 9 → 9 | source win → source win | none |
| 3B | 1 | 1 → 1 | 10 → 12 | source win → censored | 40 / 168 |
| 4B | 0 | 2 → 2 | 26 → 26 | censored → censored | none |
| 5B | 1 | 1 → 2 | 18 → 20 | censored → censored | 52 / 233 |
| 6B | 3 | 1 → 4 | 12 → 11 | source win → censored | 31 / 138 |
| 7B | 1 | 1 → 2 | 20 → 21 | censored → censored | 42 / 190 |

Trial `1B`, registered seed **3104969830**, originally ended in an original-source win after 242 native actions on turn 52. The paired intervention instead accepted candidate Active Psychic attachments on turns **36, 44 and 46** (root action ordinals 126, 152, 159) and ended in a **candidate native win** after 245 native actions on turn 58. The source performed **zero** declared attacks in either arm, consistent with a stall scenario. The candidate settled six attacks in control and seven in treatment. The Engine declared the terminal in both arms; this is a native-policy outcome, not a paper-certified matchup success.

## Interpretation and decision

This independently registered development sample supports retaining the Active-funding branch as a **candidate policy improvement**, especially against source stall lines that profit from an unfunded Active VMAX. It concretely increases funded Active actions and changes at least one completed source outcome under the same physical start. It remains a developmental policy proposal rather than an unconditional improvement.

Native outcomes have large missing-winner uncertainty. Five pairs had two definitive native terminals, with one candidate-favouring reversal and four unchanged winner identities. Three pairs changed an original-source terminal into an unresolved cap; eight pairs had two unresolved caps. Giving each capped game either possible eventual winner yields a **paired candidate native win-count difference interval of -7 to +12 across 16 registered pairs**, despite the one directly witnessed reversal. The aggregate native win tally therefore cannot establish a comparative game win rate, much less the 99.5% full-field target.

The treatment consumed the sole held Psychic to fund Active instead of performing Underworld Door. This can reduce acceleration or draw. Trial `6B` shows more Active funding with one fewer settled candidate attack, and `3B` shows a selected funding action without a net increase in Active attachments. A large evaluation must account for that opportunity cost and all responses rather than assume a universally winning decision.

The immediate productive next step is a **separately registered, wider actual-game comparison** testing the manually funded Active VMAX and the existing `actorMaxGeistManualRecovery` post-Underworld alternative. Use real settled attacks, Prize changes, opposing response, full native dispositions and sharp censoring bounds; the current sample cannot justify a deck change. The final objective remains one fixed legal 60 against all 32 original decks, with full paper-rule and playing-policy qualifications still unresolved.

## Additional delivered native integration result

In [staged workflow 42725879890](https://github.com/FlareZ123/experiment-01/actions/runs/42725879890), **all 16 of 16** native regression tests pass. Both full-actor source seats actually select and settle `Jet Energy PAL -> VS Seeker PHF -> recovered Faba LOT` into source hand while maintaining sixty physically distinct cards per owner. [Agent26 fixture fix `d823e5a`](https://github.com/FlareZ123/experiment-01/commit/d823e5ac0b5ce56f4b858f93c3255fbeeffadbda) corrected the harness's extra-action assertion after the native line had already completed. The board is deliberately staged, so zero of these cases count as competitive games.

**Original raw artifact:** [download from GitHub Actions run](https://github.com/FlareZ123/experiment-01/actions/runs/42725425474/artifacts/13722751154). Artifact retention is 21 days; this persisted report preserves the complete 16-pair summary beyond its expiry.
