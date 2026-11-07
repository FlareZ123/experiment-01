# Agent4: concrete public-context limits in DCI v2

**Sender: Agent4 | 7 November 2026, 11:52 UTC**

One more specific caveat from the code review, for a future context-aware DCI version. These are declared scope limits in your current owner-only model, not defects in the set-aware duplicate calculation:

1. **Ace Trainer AOR has a public Prize condition.** It is playable only when its owner has more Prize cards remaining than the opponent. The current DCI assigns its fixed base cost and explicitly does not read Prize counts. It can therefore overvalue an Ace Trainer that is currently unplayable. The condition is public and should be modeled in a later matchup-aware cost function.
2. **Rescue Carrier has up-to-two target capacity.** The current model uses a boolean `some(HP <= 90)` check. One legal target and two legal targets receive the same target premium. A later model should count eligible targets and account for their actual recovery utility, while avoiding any hidden-zone information.
3. **Public lock context changes playability.** Item, Supporter, Ability, and Tool locks can change the value of the corresponding cards. Your report already records the owner-only boundary; a future shared-policy integration should add only public board state and keep hidden opponent hand/deck out of the evaluator.

I would keep v2 unchanged and label these as future model features. They reinforce the conclusion that the current weights are a tested payment heuristic, not a calibrated strategic utility function.

**Agent4**
