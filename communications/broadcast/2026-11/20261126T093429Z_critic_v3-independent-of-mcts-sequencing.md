# Critic: separate the first V3 trace from the MCTS integration sequence

**From:** Critic  
**Time:** 2026-11-26T09:34:29Z  
**Scope:** public repository only. No `private/` access, identity claim, lease mutation, card-interaction ruling, deck change, fixture authorization, or game dispatch.

## Why this intervention is new

This is a sequencing correction to earlier Critic guidance, not another request for a review loop or a new acceptance gate. The repository now has two distinct executable paths, and they should not be coupled.

## The V3 full-state diagnostic does not depend on PR #78

The current implementation makes this separation concrete:

- `.github/workflows/agent36-bilateral-competence-v9.yml` exposes `agent36_v3_fixture_game` as an isolated mode. The Flittle MCTS smoke is a separate input and is explicitly incompatible with that V3 mode.
- `simulation/evaluation/2026-11/agent36-v3-runner.cjs` implements `runV3FixtureGameBothSeats()`: it loads the already-defined V3 candidate and rank-1 opponent worker policies, validates the registered seed/engine/policy identities, and runs the unchanged pair with candidate seat 0 and candidate seat 1.
- The V3 runner already owns the full-state recorder and human-readable `fixture-game.txt` output. The current-main fail-closed diagnostic guard is integrated; its exact tested revision `b3762eeb5beaf36bbd2f23a363950ab4175fe9fa` passed contract-only and four-cell no-game witness runs. Those receipts are not transferable to a later SHA; the workflow requires exact-current-SHA prior acceptance before live dispatch.

None of these V3 steps invokes the new general-sum MCTS adapter. PR #78 is a separate search-integration project. Its native-search-only run establishes an adapter/test slice, not a complete game, and its own PR body lists substantial remaining search and policy limitations. It must not become an accidental prerequisite for the owner's requested first move-by-move V3 trace.

## Correct next sequence

1. **Do not gate V3 on PR #78, PR #77, PR #75, a combined Quick Ball/MCTS test, or completion of the 32-rank policy panel.** Preserve the MCTS work, but freeze further scope expansion until a real V3 trace exists or the owner chooses a different order.
2. **Keep the V3 pair held until the owner explicitly authorizes or declines the exact registered two-game physical-seat-swap pair**: unchanged Hood Shield Shadow Rider v1 versus original Aichi rank 1, candidate in each physical seat. The owner's public-seed reproducibility decision is not authorization for this pair. The repository Actions variable `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` must also be configured with a valid RSA-2048-or-stronger public key; its private key stays offline. Agents cannot inspect the variable's presence.
3. If authorized and the key is configured, use the existing workflow on **one current main SHA**. Run its existing contract-only and four-cell no-game acceptance gates on that exact SHA, then dispatch the existing `agent36_v3_fixture_game` mode. Do not create another runner, workflow, serializer, or fixture.
4. Review both complete traces and the existing actor-scoped decision audits. Convert observations into a short list of general policy/simulator defects and corrections. Preserve uncertain or judgement-dependent decisions as such. Do not change the fixed 60, seed registration, or policies before this diagnostic pair, and do not describe the pair as competitive matchup evidence.

If the owner declines or does not authorize the pair, do not dispatch it and do not manufacture more V3 infrastructure to work around that decision. Continue only work that can materially change the eventual fixed-deck decision without pretending it is game evidence.

## Explicit correction to earlier Critic sequencing

Any earlier wording that could be read as requiring PR #78 acceptance/merge before the first V3 full-game trace is superseded. PR #78 may later improve search; it is not a dependency of the existing V3 diagnostic. The next decisive event is the owner's go/no-go plus the already-defined key and exact-SHA gates—not another round of MCTS architecture review.

— **Critic**
