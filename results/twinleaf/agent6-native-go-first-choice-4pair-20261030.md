# Agent 6: compiled native GO_FIRST selection polarity, four rank-seat pairs

**30 October 2026 | pinned original Twinleaf Store setup-only positive control.** This is a targeted mechanics result, with **zero complete games and zero competitively qualified games**. It does not rank fixed decks or demonstrate a 99.5% win rate.

## Provenance

- Manually dispatched the **existing** `.github/workflows/twinleaf-setup-audit.yml` using `agent6_go_first=true`; no new workflow or push trigger.
- [Successful workflow 40984178087](https://github.com/FlareZ123/experiment-01/actions/runs/40984178087), completed SUCCESS; research head `68d2a75487b8e0989467fb6cf7d719646e074d0c`; pinned Git submodule `vendor/twinleaf` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Uploaded native setup-only JSON artifact 12946615495](https://github.com/FlareZ123/experiment-01/actions/runs/40984178087/artifacts/12946615495). Downloaded ZIP is 418 bytes with SHA-256 `0d3e4061fd484768ed1f8fa51826b985cc3991d1ff404b223a90d4342788efb3`, independently compared to the GitHub artifact's published digest. It holds `agent6-go-first-native.json`, 1287 bytes, schema `agent6-native-go-first-polarity-v1`.
- Original fixture implementation: [`simulation/evaluation/agent6-go-first-native-setup.cjs`](../../simulation/evaluation/agent6-go-first-native-setup.cjs), reversible [`simulation/twinleaf/agent6-go-first-choice.cjs`](../../simulation/twinleaf/agent6-go-first-choice.cjs), original [pure tests](../../tests/agent6-go-first-choice.test.cjs).

## Exact outcome from original Store

Each pair uses the same rank/physical seat/seed and executes the opposite GO_FIRST choice with **both players assigned the same true/false preference**. The pinned Store resolves the actual coin winner and the first turn, and the existing first-turn capture validates the true first player against the native draw log. No attack or later game turn is simulated in this test.

| Original source rank | Source seat | Seed | Coin-winning seat (both arms) | If winner chooses **first**: first seat | If winner chooses **second**: first seat |
| --- | ---: | ---: | ---: | ---: | ---: |
| 6, Iron Thorns LO | 0 | 24941728 | 1 | 1 | 0 |
| 6, Iron Thorns LO | 1 | 1460221882 | 0 | 0 | 1 |
| 11, Absol/Garbodor | 0 | 24941728 | 1 | 1 | 0 |
| 11, Absol/Garbodor | 1 | 1460221882 | 0 | 0 | 1 |

**All four pairs passed assertions**: the first-turn capture stopped at a settled turn 1, `verifiedByDrawLog===true` for both arms, exactly one GO_FIRST decision was recorded for each arm, winner identity stayed the same within each pair, actual first player matched `wantFirst ? winner : 1-winner`, and turning preference off reversed the actual first seat. These are **four source-rank/seat pairs but only two seed values**; do not call them eight independent random starts.

Both source ranks can now be tested with authentic owner-specific first-player intent rather than the pinned generic confirm resolver's automatic decline. This does **not** verify a tournament-aware opening-choice strategy. The fixture applies symmetric true/false preferences, so mixed source/candidate choices, real source-first threat establishment, source response, Prize/hand equivalence across arms, clock and full-game competitive policy are untested.

## Interpretation for field comparison

The coin winner chooses first or second **before** initial seven-card setup. If source preference for first is `s`, candidate preference is `c`, and the exogenous toss winner `W`, the source starts first exactly when `W===source ? s : !c`. With opposite preferences (`s=true,c=false` or `s=false,c=true`), actual source start order is deterministic despite a fair toss. Therefore stratifying only by actual starter can selection-bias comparisons of distinct policies. The existing [outcome-blind coin-winner protocol](../statistics/agent6-prospective-actual-start-stratification-20261029.md) treats the toss winner as the external intake variable and separately authenticates the actual first-player draw log.

**Next integrated gate:** pass an independent mixed-preference native source/candidate setup test in the canonical shared runner, precommit the preference function using only information legitimately known at the toss, then compare real rank-6/11 first-turn source actions, opposing response and failures with unchanged fixed decks and all native artifacts. Source first-turn preference is a strategic treatment and must be frozen by policy; it must not be selected retroactively to favor a particular opening.

**Benchmark remains:** 29/32 exact source 60s (23/25/28 missing), zero competitively qualified games, no validated best fixed 60 and no demonstrated 99.5% win rate.
