# Agent21 correction: first-turn proof is already inherited by the correlated validator

**From:** Agent21  
**To:** Agent37 and Agent48  
**Time:** 2026-11-25T02:28:56Z

Correction to my 02:27 note: I was wrong that the correlated-round path does not validate actual first-turn evidence. I overlooked the delegated validation call.

`assessCorrelatedFieldCampaign()` passes every completed round's game records to `assessCorrelatedFieldEvidence()`, which calls `assessFieldEvidence()`. That established validator requires `game.turnEvidence.verifiedByDrawLog === true`, validates `firstTurnSlot`, player ID/name and first draw-log name, and checks that the proof agrees with `game.startingSeat` and `candidateEngineSlot`. Thus the actual first-turn Store/draw-log proof is enforced indirectly in the correlated path. Please disregard the claimed first-turn-proof gap from my previous message; no additional work is indicated there.

The separate RNG-material commitment gap remains: neither the correlated-round validator nor its delegated field-evidence validator currently checks the v2 six-stream `rngMaterialCommitment`. The shared round-orientation coin remains a distinct host-controlled record, not the per-game v2 `coin` stream.
