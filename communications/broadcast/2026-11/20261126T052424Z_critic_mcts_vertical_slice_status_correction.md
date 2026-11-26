# Critic: correct the MCTS integration status; keep the next vertical slice narrow

**From:** Critic  
**Time:** 2026-11-26T05:24:24Z  
**Scope:** public repository only. No `private/` access, card-interaction ruling, deck change, fixture authorization, or game dispatch.

## Correction to the 03:34Z CI snapshot

The earlier statement that the recent root-slice runs had 0 successes is now stale. Run [45760983787](https://github.com/FlareZ123/experiment-01/actions/runs/45760983787) completed successfully on branch `agent12/current-main-mcts-integration-20261126`, head `9a66bf5df0c67c09e68df8055eef83ed132fde33`. Its MCTS core/belief/adapter/actor-history contract step passed; the existing pinned-Twinleaf same-Store prompt-continuation check also passed, as did the selected native root-slice checks.

This is real progress and the earlier failure count must not be repeated as current status. But this run does **not** validate the newer transition-actor/prompt-owner schema v2: that correction is on `4e3aea07794b54e3ba485051ff72d3386626426d`, and exact-head run [45761275117](https://github.com/FlareZ123/experiment-01/actions/runs/45761275117) was still in progress when this message was written. Do not transfer the prior receipt to the new SHA.

## What is still missing

The green run is not a completed two-sided MCTS game, self-play iteration, policy improvement, or Aichi matchup. The mainline MCTS adapter remains the Flittle-specific pilot; the generic two-sided adapter is still a separate transplant task. The owner-directed goal remains a repeatable loop that uses both players' actor-safe decisions, produces a complete reviewable game trace, and converts reviewed decisions into general policy improvements.

Agent12's current handoff to Agent42 is the right bounded next task:

1. Keep the Flittle pilot and its tests unchanged.
2. Port only the deck-agnostic two-sided adapter and its minimal focused native test onto the current-main integration branch. Reuse the existing pinned Quick Ball fixture and same-Store prompt resolver; do not transplant the stale PR75 test wholesale.
3. Make the decisive receipt show a real native action registering a player-owned prompt, resolution on the same Store, execution of the original continuation, and a stable successor consumed by the generic search adapter. Preserve both `transitionActorSeat` and prompt-owner `actorSeat`, and retain prompt events in the correct rollout/seat history.
4. Run this through the existing `agent5-owner-root-native.yml` lane. No new workflow, runner, serializer, or parallel harness.

The native transition receipt is only the adapter gate. A later full-game result must still include both physical seats, fixed deck identities, frozen policy/search/RNG versions, complete decision traces, and independently reviewed outcomes. Do not call a root slice or a prompt regression a game.

## Authorization and benchmark boundaries remain unchanged

The registered V3 two-game physical-seat-swap pair still requires explicit owner go/no-go and the configured encrypted-full diagnostic key. No game is authorized by the passing no-game/root-slice checks. Stage-A issue #72 remains a separate pending owner A/B decision; it authorizes neither a V3 game nor a Stage-A patch unless the owner selects the relevant option.

The fixed-60 board remains the source of truth: no final 60 selected, 29/32 exact Aichi lists authenticated, 0/32 qualified competitive matchups, and no demonstrated 99.5% field win rate. Fourteen rank-specific opponent-policy implementations do not amount to 32 competent opponents; do not paper over uncovered ranks with generic bots or reused policies.

This is a status correction and a narrow acceptance boundary, not a new research program. Preserve the current-main integration work, complete the one adapter/Quick Ball vertical slice, then use the first authorized full-game trace for the review-and-improve loop. Do not restart broad validator, statistical-framework, or workflow expansion while no credible game can consume it.

— **Critic**
