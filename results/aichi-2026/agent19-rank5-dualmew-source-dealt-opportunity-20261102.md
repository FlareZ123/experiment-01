# Source-dealt rank-5 dual-Mew Max Miracle opportunity: 16 original Snorlax opponents

**Agent 19 | 2 November 2026.** Evidence: [native CI run 41393312882](https://github.com/FlareZ123/experiment-01/actions/runs/41393312882), [read-only raw artifact reporting 41393777791](https://github.com/FlareZ123/experiment-01/actions/runs/41393777791), and [all-row machine-readable summary](agent19-dualmew-original-rank3-7-source16-summary.json). This is a **developmental opportunity audit**, with zero competitively qualified games.

## Hypothesis and execution

A constructed genuine pinned Store fixture proved an Active rank-5 Mew VMAX with one DCE can copy *Max Miracle 130* from another evolved Benched Mew VMAX to KO Mimikyu PAL97 despite Safeguard; copying Genesect *Techno Blast* instead takes zero Prizes. Refer to [original mechanical finding](agent19-rank5-mew-mirror-safeguard-20261102.md) and [four-arm native receipt](agent19-mew-mirror-native-receipt-20261102.md).

The next question was whether **the whole prerequisites occur naturally** in same original source 60 versus original 60 game development. The 16 physical seeds were independently drawn, then committed **before running the engine** in [registration](registrations/agent19-dualmew-rank3-7-source-dealt-20261102.json) at commit `c051fbd5e957205014c8d8af8d03c9243087ee86`. Fixed inventory: rank-5 Yamato Nakano Mew Genesect; original rank-3 and rank-7 Snorlax. Each opponent gets four seeds at Mew seat 0 and four at seat 1. The common source-deck resolver admitted all three complete 60s. Every run used the original pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, 200 accepted-action maximum, owner-visible natural Evolution, Special Energy and Genesect copied attack actor options, and the shared generic fallback.

The observer `simulation/twinleaf/agent19-dual-mew-source-observer.cjs` watches **postdispatch genuine Store states** only, explicitly filtering out speculative bot Store objects. It reads face-up Pokémon and attached Energy, plus a real owner-controlled ChooseAttackPrompt, without hidden hand, deck or Prize identities. The tests verify public detection, blocked/missing conditions, live-Store identity, and hook restoration. Full source-dealt execution lives at `simulation/evaluation/agent19-dual-mew-original-opportunity.cjs`.

## Results

| Preregistered observed state | Source-dealt original games |
| --- | ---: |
| Actual source-dealt attempts | 16 |
| Native errors | 0 |
| Engine terminals | 1 |
| 200-action censored/incomplete | 15 |
| Two evolved Mew VMAX in play, one Active | 1 |
| Those two plus attached Active DCE | 1 |
| Dual Mew while opposing PAL97 Mimikyu Active | 0 |
| Dual Mew, DCE and PAL97 simultaneously | 0 |
| Real Max Miracle donor offered in that exact state | 0 |
| Competitively qualified games | 0 |

**Only observed dual-Mew game:** original opponent **rank 3**, Mew actual physical **seat 0**, repeat 2, physical seed `3070588817`. It reached an engine-terminal result and showed the dual-Mew board in **16 postdispatch observations** and DCE on the Active in **one** postdispatch observation. These counts are repeated public board snapshots, **not sixteen games or independent random events**. The opponent was not observed with Mimikyu PAL Active at the same time. Rank-7's eight trials never showed both evolved Mew VMAX in the same board state under this policy.

**Crucial limitations:** Fifteen runs were action-censored, generic source and opposing bot policies lack demonstrated playing competence, and the source Mimikyu may be deployed differently by skilled opponents. There is no 25-minute paper clock or full semantic fidelity certification. The absence of an offered Max Miracle in this tiny censored cohort **does not establish that the line is intrinsically rare in human play**, and does not lower or raise any competitive matchup win-rate estimate.

## Research implication

The prior constructed-board decision-policy defect is real and mechanically corrected by an optional default-off owner-only Max Miracle selector, but its tactical payoff requires two evolved Mew VMAX, DCE and opponent Mimikyu all aligned. The newly observed bottleneck is **formation and co-occurrence**, not choosing Max Miracle once the genuine menu is available. Improvements to Mew Bench development, evolution follow-through, and source Snorlax's safeguarding response deserve separate owner-information-safe comparative tests before recommending an integrated rank-5 policy.

The existing registered rank-5 v3 actor blob `05b54513fd637c4eee134d5f48d43c446d107f7d` is preserved unchanged. The experimental branch `agent19-maxmiracle-stage` holds a tested opt-in preference; it must be versioned and freshly registered before adoption because main's original v3 code hash is externally frozen.
