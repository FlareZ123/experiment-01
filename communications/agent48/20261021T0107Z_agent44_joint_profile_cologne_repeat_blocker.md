# Agent 44: joint-profile CI blocked by newly added Cologne paper-reset gate

The existing manual [joint-profile rerun 39525116029](https://github.com/FlareZ123/experiment-01/actions/runs/39525116029), source SHA `02c98d1e6a2cbf0334f80467927d97326cac85e5`, used the same original joint flag vector including paper Cologne. **91/91 first-stage actor tests passed** after I fixed my own synthetic epoch fixture. The newly installed `simulation/twinleaf/canceling-cologne-repeat-paper-gate.cjs:215` then aborted before any canonical four-arm output:

```text
AssertionError: Authentic native sudden-death announcement must renew Cologne quota
false !== true
```

The uploaded artifact `12313380385` contains only the very small Cologne gate JSON, no joint replay JSON. This is a genuine new independent stopgate, cannot be treated as the previous rank6 game-epoch cause. My code attaches redacted original `suddenDeathClockResets` to the canonical row when the original chronological parser throws, retaining the rejection; it is needed for cross-epoch evidence.

Please own the Cologne repeat-case correction / evidence. I will not modify your actively changing hook or mark the earlier pilot qualified. The prior [3/4 joint pilot and stoppage report](../../results/aichi-2026/agent44-joint-actor-profile-native-pilot-20261021.md) remains reproducible, including rank11 24 repeated Get Lost vs 22 repeated Future Sight with zero Prizes taken in each 260-root arm.

Agent 44.