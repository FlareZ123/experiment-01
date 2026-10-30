# Agent 6: compiled asymmetric GO_FIRST source/candidate preferences

**30 October 2026.** A continuation of the [initial native four-pair polarity control](agent6-native-go-first-choice-4pair-20261030.md). Evidence class: **original pinned Store setup-only control**, no finished games or competitive ranking claims.

## Reproducible native run

- Existing, manually triggered `.github/workflows/twinleaf-setup-audit.yml`, input `agent6_go_first=true`; [run 40984692631 completed SUCCESS](https://github.com/FlareZ123/experiment-01/actions/runs/40984692631).
- Exact research head `66ed1d9056f08067b873a993cf759ec7b11f4059`; vendor Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; extended original runner [`simulation/evaluation/agent6-go-first-native-setup.cjs`](../../simulation/evaluation/agent6-go-first-native-setup.cjs).
- [Native artifact 12946447054](https://github.com/FlareZ123/experiment-01/actions/runs/40984692631/artifacts/12946447054), 492-byte ZIP; independently downloaded, SHA-256 `77d54a18e27d082772b5eb88f4dfd9ea9f0c0b16d2a154e29637e320b618fb02`, matching the GitHub artifact digest. Inside: `agent6-go-first-native.json`, schema `agent6-native-go-first-polarity-v2`.
- The original v1 symmetric-arm four pairs remain byte-for-byte identical in the v2 JSON. Four additional **asymmetric-preference pairs** exercised the same actor-only GO_FIRST adapter and original Store. Both roles' choices are keyed exclusively by physical seat and frozen Boolean preferences before the game starts, without consulting opponent hidden hand, deck or Prizes.

## Native mixed preferences

`preferences=[A-winner-wants-first,B-winner-wants-first]`. Exactly one coin-winner decision was recorded per arm; the first real turn and owner slot were independently attested by the original native draw log. Seeds intentionally repeat across ranks, so no inference about random-start prevalence follows.

| Source rank | Source physical seat | Seed | Toss winning seat | First seat if preferences **[true,false]** | First seat if **[false,true]** |
| --- | ---: | ---: | ---: | ---: | ---: |
| 6, Iron Thorns LO | 0 | 24941728 | 1 | 0 | 1 |
| 6, Iron Thorns LO | 1 | 1460221882 | 0 | 0 | 1 |
| 11, Absol/Garbodor | 0 | 24941728 | 1 | 0 | 1 |
| 11, Absol/Garbodor | 1 | 1460221882 | 0 | 0 | 1 |

**All 4/4 asymmetric pairs passed** and preserved identical coin-winner seat within each pair and against the v1 symmetric controls. Each native run recorded `stoppedAtFirstTurn=true`, `verifiedByDrawLog=true`, exactly one actor GO_FIRST audit entry, and `firstTurnSlot === (preferences[winner] ? winner : 1-winner)`. Opposite mixed profiles reversed the actual first seat. The unmodified source/candidate deck ranks were 1 vs 6 and 1 vs 11, as in the v1 fixture.

This is an **independent source-rank/seat choice-policy plumbing check**, not a test of player knowledge or strategic advantage. The same two actual numerical seeds across two ranks are not four independent random draws.

## Why it matters for the one fixed 60

The frozen generic prompt resolver automatically elects to go second when winning the coin flip. The real-source literature describes rank-6 and rank-11 opening-turn plans whose tactical opportunity depends on starting side, and the first-player selection itself occurs before the initial seven cards are drawn. An authentic agent must precommit its opening-choice strategy based on genuinely known information before the toss. The new test certifies that **differing source and candidate preferences** are faithfully applied, including cases where the actual first player is deterministic across fair coin winners.

For an asymmetric comparison `sourcePref=true,candidatePref=false`, source starts first for either toss winner. Conversely `sourcePref=false,candidatePref=true` makes source start second for either toss winner. Do not condition paired trial intake on matching *actual* first seats if the policies legitimately differ; preserve exogenous coin winner, actual starting-side receipts and all rejected seeds. See the [preregistered coin-winner intake protocol](../statistics/agent6-prospective-actual-start-stratification-20261029.md).

**Remaining qualification gates:** the test stops before substantive gameplay. It does not establish naturally dealt Speed Lightning staging or Boost Shake lock, opponent responses, scoring policy, full original-card rule fidelity, source/candidate deck-quality differences, 25-minute paper clock behavior or the missing 3/32 full field. No fixed deck is validated, no game is competitively qualified and 99.5% remains unproven.
