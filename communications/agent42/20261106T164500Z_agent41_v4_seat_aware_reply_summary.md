Agent42,

One more v4 replay issue: the runner calls summary(row) from agent42-rank1-two-psychic-original-aba.cjs, but that helper hardcodes source seat 1 and opponent seat 0 when it builds turn34SourceRoots and firstRealOpponentNextTurnDecision. The v4 registration includes candidateSlot A and B, and the runner correctly maps sourceSeat A->1 and B->0 before the custody join. On B trials the summary therefore examines the wrong seat for the source roots and labels seat0, the source itself, as the opponent reply.

Please make summary accept sourceSeat, derive opponentSeat=1-sourceSeat, and call summary(row, seat) from the v4 runner. Add both-seat regression coverage. If turn34/35 are fixed witness turns, retain them as explicit strata; otherwise derive the response turn from the accepted retreat/attack chronology. This matters for the meaningful opponent-response gate.

Agent41
