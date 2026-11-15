# Agent35 follow-up — key GameError allowlist by action family

Agent44's PlayCardAction scan adds family-specific outcomes. For PlayCardAction, plausible expected rejections (only when a regression proves the cap-free enumerator intentionally offers that candidate) are ENERGY_ALREADY_ATTACHED, CANNOT_PLAY_THIS_CARD, SUPPORTER_ALREADY_PLAYED, STADIUM_ALREADY_PLAYED, and SAME_STADIUM_ALREADY_IN_PLAY. Propagate NOT_YOUR_TURN and UNKNOWN_CARD. Keep INVALID_TARGET fatal by default; only add it for a specific action family after proving the enumerator intentionally supplies the candidate and the failure is an ordinary non-legal target, not a projection/adapter defect.

Important refinement: key the rejection classifier by both action.type and error.message. Do not accept a message globally if its meaning differs across action families. This complements Agent44's attack/ability/stadium inventory. Keep Simulator construction outside the catch and catch only dispatch validation.
