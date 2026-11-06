# Agent 1: exact original-eight 260-root native replay and terminal mechanism

**6 November 2026. Developmental evidence only.** All eight original Aichi rank-6/rank-11 source-versus-candidate trials retain fixed source/candidate printed 60s, native seed/seat, policy and `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` pinned Twinleaf. **Zero competitively qualified paper Expanded games; no selected final deck and no win-rate estimate.**

## Reproducible registered extension

The [prior-registration](../aichi-2026/registrations/agent1-v13-v14-native-horizon260-20261106.md) altered **only** the actual native root-action limit from 96 to 260. The earlier source 96-root experiment [v13 pinned run 42215048792](https://github.com/FlareZ123/experiment-01/actions/runs/42215048792) retained archived public root `issue25-steward-v7.json`, SHA-256 `1c87b9151470cf76d626cc82bfe374186048b955329919fa4926d3f52df0e86f`.

A previous v14 CI failed before gameplay from a JavaScript lexical number sort (rank 11 sorted before rank 6); the explicit numeric `.sort((a,b)=>a-b)` correction is in [v14 source](../../simulation/evaluation/agent1-issue25-common-v14-horizon260.cjs) and [unit test](../../tests/agent1-issue25-common-v14-horizon260.test.cjs). [Pinned v14 CI run 42292410408](https://github.com/FlareZ123/experiment-01/actions/runs/42292410408) compiled and completed all eight native trials. Its original archived public root JSON SHA-256 was `9e486a2b2c23ad11fa0fc5a98f1429053df80c0fa014f72342447995f5f28e4f`, 941,917 bytes. An expanded terminal-reason-only confirmation in [CI 42293193740](https://github.com/FlareZ123/experiment-01/actions/runs/42293193740) compiled and succeeded: [artifact 13540009333](https://github.com/FlareZ123/experiment-01/actions/runs/42293193740/artifacts/13540009333), JSON SHA-256 `033c7ed4d14d05ab88175836b918b06168065a64704bbbf74e9e6870e71c6bab`.

[Native final public owner-zone observer](../../simulation/evaluation/agent1-v14-public-endstate-observer.cjs) additionally recorded **read-only** completed-game owner deck counts, original public Active/Bench and hand counts, with no bot-visible exposure. [CI run 42294887735](https://github.com/FlareZ123/experiment-01/actions/runs/42294887735) succeeded: [artifact 13540394718](https://github.com/FlareZ123/experiment-01/actions/runs/42294887735/artifacts/13540394718), enclosed `agent1-v14-horizon260-full-public-roots.json` SHA-256 **`9eee28d26bf8d102047428f4dd80ca6c22523c35d84140a8a81fa68ac2c42d42`**, 950,212 bytes. The source `game.finalState` is a postgame public-count snapshot, not a reconstructed concealed opponent hand.

Independent parsing of the downloaded archives verified **8/8 exact full physical source + contender opening fingerprints**, and **8/8 identical original v13 public action prefixes** through each original native endpoint (96 roots, except the unchanged rank-6 New Moon error at 84). Read-only instrumentation did not change accepted game roots or native dispositions. The source and contender role is resolved by the registered physical seat, rather than inferred from victory.

## All eight original native outcomes

Prize and deck arrays are native physical seat 0, seat 1, not source-versus-candidate order. A native engine finish is not yet a paper-compliant match.

| Registered original source rank / candidate / source seat | Native roots | Engine status | Winner seat | Final Prizes (0,1) | Final deck cards (0,1) | Native mechanism |
| --- | ---: | --- | ---: | --- | --- | --- |
| 6 / Champion / 1 | 260 | Action cap | — | [6,2] | [12,7] | Censored |
| 6 / New Moon / 1 | 260 | Engine finished | 1 | [4,0] | [13,8] | Source took final Prize cards |
| 6 / Champion / 0 | 154 | Engine finished | 1 | [3,0] | [23,30] | Contender took final Prize cards |
| 6 / New Moon / 0 | 84 | Engine error | — | Unknown | Unknown | Same original unresolved root error |
| 11 / Champion / 1 | 163 | Engine finished | 1 | [6,6] | **[0,29]** | Contender's deck exhausted |
| 11 / New Moon / 1 | 260 | Action cap | — | [6,3] | [15,18] | Censored |
| 11 / Champion / 0 | 154 | Engine finished | 0 | [6,6] | **[32,0]** | Contender's deck exhausted |
| 11 / New Moon / 0 | 260 | Action cap | — | [6,6] | [22,20] | Censored |

Exactly **4 native engine-phase finishes, 3 action caps, 1 engine error**. The 260-root limit happens to coincide with a rank-6 New Moon native finish, and these selected replay samples are small. Neither the nominal 4/8 native finish rate nor individual native winners are a competition result.

### Why rank-11 source wins require adverse policy testing

The two rank-11 original Absol/Garbodor source wins against Champion are **deck-exhaustion terminals with no Prize cards taken by either side**. The losing Champion contender used its ordinary native Mimikyu **Filch** attack **13 times** when source was seat 1, and **14 times** when source was seat 0. Printed Filch draws two cards, and its voluntary use can accelerate the attacking player's own deck depletion. On these source contexts, the contender has no demonstrated competent late-game decision to conserve its own deck, recover resources, pivot or attack to close the match. A default native Source win by that failure mode is especially weak evidence of real source or candidate deck strength. The source winner's remaining deck still had 29/32 cards respectively.

The [independent Agent2 rank-3 anti-Filch original-native A/B/A study](agent2-original-rank1-conservative-filch-response-aba-20261104.md) previously established that a 24-card own-deck threshold for stopping Filch can delay mill loss materially without changing either physical 60. To measure policy sensitivity here, Agent1 has separately [preregistered a source-independent bilateral owner-Filch A/B/A](../aichi-2026/registrations/agent1-v14-v15-bilateral-conservative-filch-20261106.md). That next test alters exactly one optional owner decision, holds all eight initial native games fixed and retains both unchanged A controls.

## Inference and remaining qualification

This is genuine selected native game execution and exact owner public-zone instrumentation. It leaves paper-format legality, all 32 distinct original opponent inventories (three are still missing), opponent competitive policy, printed card rule coverage, the official 25-minute match clock and final fixed 60 selection unresolved. **0 paper-competitive games qualified, 0% of the 99.5% target demonstrated.** Game-engine end is logged as `engine-game-end`; the observed final prizes plus public deck counts distinguish the two deck-exhaustion winners from the two final-Prize winners. They do not certify the skill of the players or the correctness of every interim card effect.
