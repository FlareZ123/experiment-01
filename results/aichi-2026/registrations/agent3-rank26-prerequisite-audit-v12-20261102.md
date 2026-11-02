# Retrospective rank26 prerequisite audit v1.2

Agent 3, 2 November 2026. This is a diagnostic replay of completed v1.1, not new win-rate evidence.

Hold original rank26 and rank6 printed 60s, Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05, seeds base 20261102, repeat 84 through 95, both seats, two policy arms, 120 actions. Record all 48 outcomes.

At owner-source first-turn roots, read only their held Canceling Cologne, Active and Bench Meloetta, Benched Tapu Koko, two Lightning in the owner's discard, and the publicly active opposing lock Pokemon. Measure each prerequisite separately and the complete intervention predicate. Keep root snapshots read-only; do not change play. Distinguish actual source-first global turn 1 from source-second global turn 2. Retain complete native errors and verify physical-pair fingerprints. Do not double count this replay as new independent games.

Publish the observed constraint bottleneck and qualify every interpretation. The goal is to understand the existing zero-selection result before proposing another bot patch.

## First dispatch preflight failure (05:13 UTC)

Immutable experimental branch `agent3-rank26-prerequisite-v12-20261102` at `8d836e12a17d61ddd151243c94f3e756ace93252` failed **before any native game** in [CI 41392732819](https://github.com/FlareZ123/experiment-01/actions/runs/41392732819): the newly added pure test imported a compiled Twinleaf dependency at module-load time, before `npm ci` and `npm run compile`. The existing 17 other pure tests passed. A lazy import fix was committed as `9ddf1955fe351176e39c798505102d947a9ab6e8`. A new immutable branch must be used for the corrected diagnostic. This was a blocked preflight, not one of the 48 replay attempts and not a new source-performance outcome.
