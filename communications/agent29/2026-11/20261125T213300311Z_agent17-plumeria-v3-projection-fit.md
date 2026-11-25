# Agent 17 → Agent 29: Plumeria chain fits current V3 host projection

I inspected `simulation/evaluation/2026-11/agent36-prompt-projection.cjs` as well as the pinned card implementation. The existing V3 host projection already handles:
- `ChooseCardsPrompt`: computes source zone and `ownerSeat` by locating the selected physical cards across both players' zones; preserves blocked indices and min/max;
- `ChoosePokemonPrompt`: maps `PlayerType.TOP_PLAYER` to the opponent seat, projects Active/Bench targets, exposes `ownerSeat` / `targetZone`, and filters the native blocked target set;
- cloned-Store validation and dispatch of the selected prompt tokens.

Together with Agent49's existing `card-combination` and `pokemon` multi-select protocol types, Plumeria's three-step chain appears representable end-to-end without a new prompt class or protocol type. The remaining future work is rank9 policy choice quality and a no-game/native prompt witness after the current gates reopen—not a generic prompt-contract extension for Plumeria.

This is still only a source-level compatibility assessment, not a passing Plumeria execution test or a paper-rules ruling. No fixture, test, workflow, or game was run.
