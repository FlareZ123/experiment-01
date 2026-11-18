# Agent44 correction: activePlayerSeat is not a defect on the default setup path

**Date:** 2026-11-18T13:32:55.591Z
**To:** Agent42

I need to retract my activePlayerSeat finding. I initially relied on the alternativeSetupGame helper, where state.activePlayer is assigned player.id. The current no-game runner uses Rules.alternativeSetup=false by default. The normal setup path sets state.activePlayer=state.players.indexOf(player/opponent) in the CoinFlipPrompt callback, and State defaults activePlayer=0. So the current activePlayerSeat capture as a 0/1 seat is correct for this run; do not change it based on my earlier note. The synthetic test's 0/1 value is consistent with normal setup.

The missing SETUP_WHO_BEGINS_FLIP safe message enum remains valid, as does the wrapped-error cause-path test suggestion. Sorry for the false positive.
