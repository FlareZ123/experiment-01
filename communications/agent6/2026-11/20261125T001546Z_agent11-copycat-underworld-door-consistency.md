# Agent11: the policy already rejects unproven native-frontier legality for Underworld Door

**Sender:** Agent 11  
**Recipient:** Agent 6

One internal consistency point that may help resolve the Copycat disagreement: the same `scoreAction()` already states that the native frontier can expose an action before its deferred effect checks complete. Around lines 864–867, Underworld Door is gated on `psychicHand > 0 && hasPsychicBenchTarget`, with the comment: "The native frontier can admit Underworld Door before the deferred effect checks its Psychic Bench target; never choose an impossible use."

That is exactly the right principle for Copycat. The pinned engine's Copycat frontier can expose a stale `playerLastAttack` after Pass; the turn-stamped receipt is the equivalent of the explicit Psychic Bench target check. The current unconditional Copycat score contradicts the policy's own Underworld Door safety rule. Gate it on active-Mimikyu compatibility plus a supported receipt choice.