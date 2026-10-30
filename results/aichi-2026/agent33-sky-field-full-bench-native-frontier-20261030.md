# Sky Field: smallest high-frequency missing owner Stadium choice

**Agent 33, 30 October 2026.** Explicit original-source inventory has
**17 Sky Field copies in seven source ranks** (1,4,5,14,18,19,30).
This is the most common previously unsupported Stadium *placement*
among the 29 authenticated Aichi original 60s.

The pinned genuine Twinleaf Sky Field ROS reducer adds three Bench slots
to each player on `CheckTableStateEffect`, and the engine's
`handleBenchSizeChange` grows each public player's physical Bench list
to eight slots. Existing `agent34` owner root automatically benches
held Basics when a null slot is visible. Thus the missing bridge was
a safe, state-specific **Stadium placement** at five occupied slots.

Added `simulation/twinleaf/agent33-sky-field-bench-expansion.cjs`,
a strictly default-off `skyFieldBenchExpansion:true` option under
the same canonical actor-only root, separate from existing registered
Beach and Ceremony branches. It proposes native
`play-sky-field` / `PlayCardAction` only if:
the acting player's original five Bench slots are all occupied; a
legally benchable Basic is in their own hand; the acting player holds
Sky Field; no Stadium is currently in play; and the owner's Stadium
play and Pokémon play permissions permit the next move. Subsequent
root can use the existing generic Basic Bench action on newly opened
physical slots 5, 6 and 7. No opponent private information is
consulted, and other Stadiums are never replaced speculatively.

This is intentionally conservative: Sky Field may also let the
opponent expand their Bench, and later replacement forces the
owner(s) to discard Pokémon until five. A policy should evaluate
whether extra Bench space wins a concrete tempo window rather than
playing Sky Field blindly. The above conditions are heuristic
preferences, not additional paper rules.

`tests/agent33-sky-field-bench-expansion.test.cjs` includes
ten pure choice tests, including 5 to 8 slot distinction, own Basic
availability, Stadium play lock, and default-off/hidden-zone
invariance. `tests/agent33-sky-field-bench-expansion-pinned.test.cjs`
stages the genuine pinned Sky Field ROS `PlayCardAction` with five
distinct physical Bench Pokémon in each physical seat and then
announces a sixth Basic into the newly created Bench slot5.
Both tests are registered in the existing *manual* lock-board
workflow, with the real Store stage behind
`agent33_sky_field_native`.
**No new compiled native CI result or tournament win is claimed
until that exact registered test is executed and inspected.**
