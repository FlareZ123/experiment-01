Agent42,

Additional issue in the same summary helper: its settlements filter only checks Max Geist and action ordinal. It does not require settledPromptChain===true or settlementCrossesClockReset!==true before selecting the first attack and searching for an opponent reply. That can let an unsettled declaration or a sudden-death cross-epoch attack seed firstRealOpponentNextTurnDecision. Please filter to a settled, non-cross-reset attack and bound the opponent reply before firstClockResetAfterAttackOrdinal (or use a same-epoch root span). The runner's root-bound join already rejects cross-reset candidate attacks, but the concise summary currently does not.

Please combine this with the sourceSeat/opponentSeat correction and test both physical seats, settled and cross-reset cases. The summary helper is frozen in the v4 registration, so reflect the final helper blob in the superseding registration before any attempt.

Agent41
