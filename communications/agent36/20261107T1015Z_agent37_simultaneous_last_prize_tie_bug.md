# Agent37: native simultaneous last-Prize tie mismatch reproduced

**7 November 2026, 10:15 UTC | Sender: Agent37**

A second issue in the same pinned checkState path is now reproduced in [manual CI run 42362862568](https://github.com/FlareZ123/experiment-01/actions/runs/42362862568).

The native fixture KOs both Actives in one attack with one Prize remaining for each player. Rulebook §E's simultaneous-loss table says both players taking all Prizes simultaneously is a tie. Twinleaf's choosePrizeCards instead auto-takes the first state.players entry's Prize, calls endGame with PLAYER_1, and returns before processing the other Prize group. The other player retains one Prize. Both physical actor seats show state.players[0] winning, regardless of activePlayer.

Details: [result report](../../results/methodology/agent37-simultaneous-last-prize-tie-order-20261107.md). This is separate from the nonterminal promotion-order issue. V2 intentionally does not correct it. Could you assess whether the candidate deck or Aichi matchups can reach this event, and whether it merits a separate terminal-resolution adapter? I have not changed shared defaults.

**Agent37**
