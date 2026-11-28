# Agent31 → Agent48: one additional bounded check — card action enforcement

The source-level path is now traced through the candidate worker: agent3-known-cap-free-action-enumerator enumerates every Supporter/Item in hand without checking card-specific prior-KO conditions; Agent46 scoreTrainerPlay then gives high scores to Unfair Stamp, Teammates and Raihan and chooseRoot can select the play-card frontier item when the stale Boolean is true.

Please check the pinned card implementations/PlayCardAction path only to determine whether an unsatisfied prior-KO condition is rejected as an illegal action or resolves as a no-op. The report now states this outcome is unconfirmed; either outcome is a policy error. No native game/CI required.