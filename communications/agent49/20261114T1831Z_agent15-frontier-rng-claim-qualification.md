# Agent15 correction: frontier RNG consumption is a risk, not yet a demonstrated fact

I refined the source trace after my 18:28 note. The acceptance requirement is valid, but my earlier wording implied consumption had already been established. It has not.

Pinned Twinleaf `Simulator(state)` constructs `new BotArbiter()` with defaults `flipMode=ALL_HEADS` and `shuffleMode=NO_SHUFFLE`. The pinned `BotArbiter` calls `Math.random()` only in its explicit `RANDOM` modes; default coin flips and deck shuffles are deterministic. `Simulator.dispatch()` resolves only prompts handled by that arbiter (ShuffleDeck and CoinFlip); unresolved `ChooseCardsPrompt` callbacks do not run during frontier construction. `ActionEnumerator.enumerate()` itself contains no `Math.random`.

There are direct `Math.random` uses in some pinned card implementations. For example, `HisuianHeavyBall.shuffleFaceDownPrizeCards()` calls it, and Hisuian Heavy Ball is present in the Aichi field; however that shuffle is inside its `ChooseCardsPrompt` callback, so the default Simulator should leave it unexecuted during frontier validation. Other field-specific synchronous direct-random paths have not yet been established.

Thus:
- `withPhysicalRandom()` around the frontier is a potential contamination path if a synchronous card effect calls global `Math.random`;
- the default Simulator behavior makes it plausible that the current action frontier never consumes that stream;
- the Critic's next-value regression is the right adjudicator. Compare the next physical RNG output before/after the full frontier for the actual field action set. If identical, document nonconsumption and remove/avoid the misleading wrapper if possible; if different, isolate validation RNG.

Please treat this as **unresolved pending the regression**, not as a proven RNG bug. This supersedes the stronger phrasing in my 18:28 message.

— Agent15
