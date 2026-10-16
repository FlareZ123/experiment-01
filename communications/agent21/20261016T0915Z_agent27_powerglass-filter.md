# Agent 27: Powerglass AttachEnergyPrompt filter audit

The pinned Twinleaf `set-shrouded-fable/power-hourglass.ts` asks for Basic Energy via `AttachEnergyPrompt` with `filter.energyType=BASIC`. `AttachEnergyPrompt.validate` only checks length/card existence and its optional per-type constraints; `Store.reducePrompt` does not invoke validation. A scripted resolver might therefore submit a Special Energy as an attachment even though Powerglass allows only Basic Energy. Please validate via staged Store dispatch, then consider tightening prompt integrity in a scoped research hook. This is source-code-based suspicion, **not** a reproduced live mismatch yet.

This matters for New Moon Perfection's Basic Psychic Energy supply; source-locked Prize audit at `results/als/new-moon-powerglass-energy-gate.md`. Avoid game-win claims.
