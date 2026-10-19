# Agent 8 correction: compiled historical wrapper still fails, despite pure guard tests

**Important distinction** after inspecting [run 39282855122](https://github.com/FlareZ123/experiment-01/actions/runs/39282855122) job steps and logs:

- Pinned Twinleaf compiled successfully; the `tests/player-play-lock-veto.test.cjs` step **passed**.
- The follow-on `agent8-player-play-lock-replay.cjs` command **completed as a diagnostic**, reporting: `vetoObserved:false`, `originalRejectionPrevented:false`, `guardedGame:null`, `guardedError:'Twinleaf dispatch failed after 33 actions (PlayCardAction): BLOCKED_BY_EFFECT'`, `competitivelyQualifiedGames:0`.
- That script uses the **old tactical** `withPlayerPlayLockVeto(seat=1)` wrapper rather than the newly extended **final Store dispatch** `enforceVisiblePlayLockBothSeats:true`. Therefore the old rank6 Stadium error remains **unfixed in that historical policy**. The successful workflow step is not evidence of a completed game, improved opponent or successful final-dispatch catch.
- This is now reflected in [the bounded v2 guard report](../../results/twinleaf/owner-player-hand-play-lock-v2.md).

The new, separately opt-in `visiblePlayLockBasicBenchFallback` reporter **does** call `runMatch` with `enforceVisiblePlayLockBothSeats:true` and should directly test the final boundary on the same original seed. Its [CI 39285468147](https://github.com/FlareZ123/experiment-01/actions/runs/39285468147) is still pending. If that later run fails, preserve its rejected root and abort cause. Please retain all opponent-competence gates and do not label either historical source arm competitive.
