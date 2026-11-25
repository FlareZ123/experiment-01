# Stadium-triggered forced-discard prompt gap in the rank-1 policy

**Agent 6 · 25 November 2026**

## Finding

The exact-head Bench-capacity correction in PR #71 models the resulting capacity (8 for live Sky Field, 5 when Stadium/Tool effects are disabled, 3 when an opponent-facing Parallel City applies). It does **not** choose Pokémon when a Stadium effect forces an immediate discard.

This is a separate policy-competence risk for the candidate:

- When Sky Field leaves play, each player must discard Benched Pokémon until they have five.
- When Parallel City enters with its arrow pointing at a player, that player must discard Benched Pokémon until they have three.
- The published Regidrago subset has Parallel City in 7/9 and Megaton Blower in 6/9; Megaton Blower can discard a Stadium in play. The Stadium cross-check is documented in [agent6-regidrago-stadium-pressure-crosscheck-20261125.md](agent6-regidrago-stadium-pressure-crosscheck-20261125.md).

## Exact policy-code observation

On the tested PR #71 code head `89a3e93c0f804713509e924ba76c5df7ccf9e96b`, the policy's `promptDecision()` handler in `simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs` recognizes Pokémon-choice modes for Underworld Door, Raihan, Acerola, Climactic Gate, Field Blower, promotion and Guzma.

There is no explicit Stadium-driven discard mode for Sky Field or Parallel City. The generic `selectionType === 'pokemon'` fallback returns `UNCLASSIFIED_POKEMON_PROMPT` when a non-optional Pokémon choice has no recognized mode.

Therefore, **if** the pinned Twinleaf environment represents a Sky Field / Parallel City forced discard as a generic `ChoosePokemonPrompt` / `selectionType: 'pokemon'`, the current policy will abstain rather than choose which Pokémon to discard. This is a conditional code-path finding; the exact native prompt shape was not established in this invocation.

## Why this is distinct from PR #71

The authorized PR #71 change corrects future Bench-capacity estimation and eligibility in four paths: Climactic Gate EV, actor Bench placement, manual Psychic Energy target resolution, and Underworld Door Bench-pair selection. It does not add a forced-discard chooser, a discard-value model, or a Stadium transition test. Do not interpret the 136 passing contract cases as acceptance of this separate prompt path.

The issue also interacts with the deferred Gate-slot reservation concern: a forced discard may remove Radiant Eternatus, Clefairy ex, or a VMAX that the policy intended to preserve. A generic "lowest-value Pokémon" heuristic may be insufficient unless it understands the current matchup plan and future Gate/Max Geist line.

## Next research boundary

A future separately authorized task should:

1. Confirm the actual pinned Twinleaf prompt shape for Sky Field leaving play and Parallel City entering play, without using an unapproved native fixture.
2. Add a Stadium-forced-discard prompt mode that distinguishes the player who must discard and the required number of choices.
3. Score choices against board roles and future lines (active/bench status, VMAX count, Fairy Zone availability, Radiant's completed Gate use, and matchup-relevant techs) while preserving a deterministic tie-break.
4. Add pure contract tests for Sky Field 6–8-to-5, Parallel City over-3-to-3, both actor-relative orientations, optional/mandatory choice bounds, and unknown metadata fail-closed.
5. Only then seek the appropriate authorization for a contract run and, separately, any native/game validation.

**Current disposition:** unresolved and outside PR #71's authorized four-path scope. No code was changed for this issue; no fixture, game, matchup, or win-rate claim was produced. Stage-A remains retry-frozen.
