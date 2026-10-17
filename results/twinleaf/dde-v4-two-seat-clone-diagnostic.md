# Double Dragon v4: paired source-deck clone profiles in both actual starting orders

**Agent 20, 17 October 2026. Evidence classification:** two preselected source-deal *policy/clone observation* regressions, not representative opponent-play testing and not a game-win-rate estimate.

## Evidence and frozen inputs

- [Successful manually dispatched CI run 39031995069](https://github.com/FlareZ123/experiment-01/actions/runs/39031995069), head `78f80737a1d6fc66f9571e1762c5c95bcf387fda`. The compiled `Test effective Energy matcher` suite passed all five tests, including the source-panel equality assertion.
- Pinned upstream Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; exact manifest-resolved Aichi source decks: rank 10 Haruku Yoshioka Regidrago and rank 1 Yasunori Kato Shadow Rider Calyrex, unchanged.
- [Reproduction script](../../simulation/twinleaf/dde-source-clone-seat-panel.cjs) runs each preselected deal with `DoubleDragonAttachTactic-v4`, fixed policy-randomness isolation and a 350-action cap, first using pinned `Simulator` cloning and then the opt-in prototype-safe cloning experiment.
- The source runner verifies first player from actual draw logs, rather than assuming the physical player slot corresponds to first action.
- Exact observation test: [tests/dde-attach-priority.test.cjs](../../tests/dde-attach-priority.test.cjs). It hashes the runner-visible action/effect/terminal record (including played-card counts, attack and Ability traces, final board and remaining Prizes), comparing the two profiles for each identical deal.

## Extracted actual-CI observations

| Condition | Rank-10 goes second (physical A) | Rank-10 goes first (physical B) |
| --- | ---: | ---: |
| Frozen shuffle seed | `3162592764` | `4246551499` |
| Actual first physical player | B (rank 1) | B (rank 10) |
| Total capped actions | 350 | 211 |
| Engine turns | 69 | 38 |
| Regidrago Double Dragon plays | 3 | 2 |
| Regidrago Apex Dragon attacks | 30 | **0** |
| Regidrago attacks of any name | 30 | 2 |
| Shadow Rider attacks of any name | 2 | 4 |
| Regidrago / Shadow Rider final Prizes remaining | 2 / 4 | 3 / 0 |
| Engine terminal state | Action limit: incomplete | Game end: complete |
| Pinned-versus-prototype-safe observable digest | Equal (`09d1b82f7ad975ed8bab6b2ad538fc79616091018353da86810bdf245e306c62`) | Equal (`fa9c8c213beefb3164f24add23f0ca8eebe95431347d23ab872a78df8ef4f019`) |

The JSON summary was printed in the successful CI job's `SOURCE_DDE_V4_CLONE_SEAT_PANEL` test output. Both clone profiles reproduced the same observable digest **within each deal**. Neither case tests two independent clones under the *same* live root Store throughout the match or shows full transient/closure-state equivalence. Prototype-safe isolation itself remains experimental.

The going-first Regidrago deal presents an especially actionable policy qualification failure: the player recorded two Double Dragon attachments yet **zero Apex Dragon attacks**, before the opponent reached zero remaining Prizes. This directly falsifies the hypothesis that restoring dynamic Energy attachments is sufficient to guarantee exploitation of Apex Dragon in that authentic source deal. The source of the non-attack has not been isolated: evolution, attack access, target selection, board positioning, prompt choice, opponent response, and other action contention all remain plausible. A detailed live action-and-response audit is needed to distinguish them.

The going-second deal reached the 350-action cap after 30 recorded Apex Dragon attacks. Since the action limit was reached without a terminal state, it is a **censored gameplay trace**, not a win or draw. The two cases also differ in seed and candidate physical seat, so the dramatic attack-count difference cannot be attributed causally to starting order.

## Priority and limits

1. On the *going-first* frozen deal, inspect source-reported board, available and chosen legal attacks, Regidrago evolution/attachment timing, and opponent response on the first turns after both Double Dragon plays.
2. On the going-second deal, explain why 30 Apex attacks still leave the match unfinished at the action limit, especially whether attack effects and Prize transitions are faithful.
3. Revalidate current-v4 live action/reducer replay with its own timestamped version. The prior 350/235 replay is frozen historical policy and cannot be inherited by this changed v4 trajectory. See [Agent 8's current-v4 source-differential report](../aichi-2026/agent8-rank10-dde-v4-trajectory-differential.md).
4. Only after full-source action/provenance, paper-effect, opponent competence and clone-state gates pass, test both actual start orders across independently sampled seeds.

**Competitive qualification remains 0 games, with no defensible 99.5% rate.** Exact Aichi source 60s remain 29/32, missing ranks 23, 25 and 28. The reference fixed deck remains unchanged.
