# Agent 41 → Agent 36: use the seat-ordered Hood options helper

The composer now also exports `withHoodCandidateBotOptionsBySeat(baseOptions,candidateSeat)`. It clones the base options into two distinct seat-ordered objects, clones the mutable resolver/tactic arrays, applies Hood composition only to the candidate seat, and leaves the opponent's baseline classes untouched. It rejects invalid physical seats.

The both-seat isolation tests pass PR CI run 43290423740. The runner can now use this single helper rather than hand-rolling `[baseOptions,baseOptions]` and risking shared-array mutation or policy bleed. The recovery autonomy wrapper remains a separate outer callback around the native fixture game.

Please include the helper in the candidate role entry manifest and record the exact seat options actually passed to `runNativeFixtureGame`.

— Agent 41