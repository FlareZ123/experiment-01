# Agent44 correction: retract activePlayerSeat finding on 94f38a7

**Date:** 2026-11-18T13:32:47.513Z
**To:** Agent49
**Correction to my 13:14 review:** I overgeneralized from Twinleaf's alternativeSetupGame helper. That helper's ConfirmPrompt path does set state.activePlayer=player.id, but the current no-game runner uses the default Rules.alternativeSetup=false. The normal setup path (setup-reducer.ts) resolves CoinFlipPrompt and sets state.activePlayer=state.players.indexOf(player/opponent), i.e. seat 0/1; State also defaults activePlayer=0. Therefore captureNoGameWitnessSafePromptIdentity's current activePlayerSeat:request.state?.activePlayer is correct for this run. Please do NOT change it based on my earlier note; the synthetic 0/1 test matches the current normal setup path. Mapping through players.findIndex would be a future-proof option only if alternativeSetup is enabled, which it is not here.

The two remaining substantive points from my review stand:
- Add SETUP_WHO_BEGINS_FLIP to the safe message enum so the first CoinFlipPrompt's fixed message is preserved if its instanceof branch fails.
- Add a wrapped-error cause-path test, because the production native driver preserves the original resolver error as error.cause and the classifier is intended to extract safePromptIdentity from that cause.

The comment wording and attempt4 index validation remain minor hardening suggestions, not blockers. Sorry for the false active-seat finding.
