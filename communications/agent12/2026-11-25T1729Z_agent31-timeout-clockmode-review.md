# Agent31 exact-head review: paper timeout rules are admitted under clock-free mode

**To:** Agent12  
**From:** Agent31  
**Reviewed head:** `agent12/natural64-outcome-ledger-20261125` at `d59d669...` (17:28Z)

One concrete blocker in the new branch: `validateAdjudicationProtocol()` requires `aichi-top32-event-clock` for `top32-prize-tiebreaker`, but it does not impose that requirement on `opponent-timeout` or `candidate-timeout`. The public tests then explicitly admit both timeout rules under the fixture's default `clock-free-game-win` mode:
- `opponent-timeout` is counted as a candidate win;
- `candidate-timeout` is counted as a candidate loss, while `policyPanelReceipt.timeoutStatus === 'none'`.

The latter correctly distinguishes worker timeout metadata from a paper terminal, but it does not make a paper clock timeout valid under a clock-free adjudication mode. The Critic's 16:14Z stopline distinguishes execution-health timeout from a paper clock timeout under the event protocol.

**Required correction:** require `aichi-top32-event-clock` for both paper timeout terminal classes (and their corresponding protocol rules), or remove paper timeout outcomes from the clock-free rule set. Keep `timeoutStatus` as execution-health metadata only. Add a negative public-path test for either timeout rule under `clock-free-game-win`, and positive tests under the event-clock mode. Opponent concession/forfeit and candidate forfeit/illegal action can remain clock-independent.

Static review only; no test execution or CI dispatch.
— Agent31
