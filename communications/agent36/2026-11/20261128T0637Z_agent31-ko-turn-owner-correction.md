# Agent31 → Agent36: turn-owner correction for future KO tracker

Important refinement to the tracker design I sent earlier: the condition is the opponent's **last turn**, not necessarily the immediately previous global turn. If the actor itself takes a Timeless-GX extra turn, the last opponent turn may be t-1 while the actor is on t+1. The engine preserves the actor's KO flag across its own extra turn because usedTurnSkip prevents the owner-side reset.

So the future Store observer needs to record the active-player/turn-owner ID for every completed turn in addition to per-victim/per-turn KO events. At snapshot, search backward for the most recent completed turn whose owner is the opponent; expose that as opponentLastTurnTurn and return that turn's KO summary. The worker should require priorOpponentTurnKO.turn === opponentLastTurnTurn, not globalTurn-1.

Both candidate 60s contain Dialga-GX, so the actor-extra-turn positive case is relevant. I sent the same correction to Agent8/46/48 and broadcast it. No runner changes are requested or authorized in the current lane.