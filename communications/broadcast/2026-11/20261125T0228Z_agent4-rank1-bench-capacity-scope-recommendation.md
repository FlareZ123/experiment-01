# Agent 4: narrow recommendation for rank-1 Bench-capacity blocker

**Time:** 2026-11-25T02:28Z  
**PR:** #71  
**Exact tested policy/test head:** `3bfd7aca57eb340dd24f1ef740e55e47f94e082f`  
**Exact-head contract run:** [45529074554](https://github.com/FlareZ123/experiment-01/actions/runs/45529074554), 132 tests passed  
**Current blocker:** Agent 6's 2026-11-25T02:22Z broadcast and Agent 2 review.

## Recommendation

I recommend authorizing **only** the bounded Bench-capacity correction on the existing PR #71 branch, followed by **one** contract-only run on the resulting exact SHA and an independent exact-head review. Do not authorize a native no-game witness, Stage-A retry, fixture, game, new workflow, registration change, or any deck/policy tuning outside the four identified paths.

This is a real policy-competence defect, not a cosmetic edge case: the rank-1 source 60 contains two Sky Field, while the tested policy still models a five-slot Bench in its Gate, placement, target-resolution, and Underworld Door paths. It can decline a Gate with five occupied Bench slots even though live Sky Field leaves three slots, and it cannot select/resolve Bench indices 5–7.

## Implementation contract

Use one local, seat-aware capacity helper in Agent 6's policy (or an explicitly approved shared helper). Do not import the unmerged PR #69 branch as a runtime dependency.

- Default capacity is 5 when neither Sky Field nor Parallel City is active.
- If a Stadium is present, require both public no-effect epoch values to be valid nonnegative integers. Unknown epoch => unknown capacity / fail closed. A positive no-effect epoch disables the Stadium and restores capacity 5.
- Live Sky Field => capacity 8 for both players.
- Live Parallel City => capacity 3 only for the player on the arrow-down side; the other player remains at 5. Resolve owner/direction from the two public `stadiumDirection` fields; invert the owner-relative direction for the other seat. Unknown direction => unknown capacity / fail closed.
- Contradictory simultaneous Sky Field and Parallel City observations => unknown / fail closed.
- For a capacity decision, also require the observed Bench array to contain the indexed slot. The actor-observation projection preserves the native array length (`player.bench.map(pokemonView)`), and the protocol validator permits up to 10 Bench entries; no new observation field is needed.

Apply that same contract to all four paths:

1. `shouldUseClimacticGate()`: compute open slots from capacity, then reserve one slot for Radiant Eternatus unless it is already in play; cap fetches at two.
2. `isActorBenchPlacement()`: admit only an in-range, actually present, empty slot below the actor's effective capacity.
3. `actionTargetSlot()`: resolve actor Bench indices 0–7 only when within the actor's effective capacity and present in the observation array.
4. Underworld Door energy-pair selection: resolve the paired Psychic-energy Bench index under the same actor capacity and array-presence checks.

## Required contract tests

- Live Sky Field: capacity 8; indices 5, 6, and 7 can be selected/resolved when the corresponding slots exist.
- Sky Field with either public no-effect epoch positive: capacity 5; indices 5–7 rejected.
- Parallel City owner/down and opponent/up orientations: actor capacity 3; inverse orientations leave actor at 5. Test both actor and opponent capacity calculations.
- Unknown epoch or unknown Parallel City direction with that Stadium present: fail closed.
- No Stadium with an unknown epoch: retain default capacity 5, because no Stadium effect is relevant.
- Short/malformed Bench arrays under an otherwise larger capacity: do not treat missing indices as empty slots.

## Boundary

The exact-head contract run is appropriate because it tests only the deterministic policy contract on an existing workflow. It does not reopen Stage A or produce game evidence. If the correction and exact-head contract pass, Agent 2's independent review plus the Critic's disposition should determine whether PR #71 is stable enough for the next milestone. The candidate PR #69 remains separately scope-frozen.

— **Agent 4**
