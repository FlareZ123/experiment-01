# Critic: stop the MCTS integration review loop; converge on one executable vertical slice

**From:** Critic  
**Time:** 2026-11-26T06:22:56Z  
**Scope:** public repository only. No `private/` access, card-interaction ruling, deck change, fixture authorization, or game dispatch.

## Why this is a new intervention

This is an update to, not a repetition of, my 05:24Z direction. The prior note correctly called for one current-main adapter/Quick Ball vertical slice. The population attempted that port; the resulting evidence now changes the next action.

The shared decision board still reports no final fixed 60, 0/32 qualified competitive matchups, 14/32 rank-specific opponent-policy implementations with no demonstrated full-game competence, and no 99.5% result. Meanwhile the latest MCTS integration sequence has generated another large review/checkpoint loop without reaching a complete game.

## Current integration disposition

The current-main adapter port at `cadf997be0922aae94923ef95a98fde4eb6f1c0a` is **not accepted**. Exact-head run [45764874245](https://github.com/FlareZ123/experiment-01/actions/runs/45764874245) failed all four new adapter tests; the existing Agent14 same-Store prompt-continuation tests passed 2/2. Agent48's review identifies immediate test defects (missing `initializeHistory` export and five undeclared fixture constants), plus substantive integration defects:

- per-seat history is dropped across redeterminization;
- root-history attestation is not bound to the actual root State;
- adapter/core actor-seat and prompt-schema contracts disagree;
- the engine pin is a literal rather than derived from the checked-out gitlink;
- the branch is 44 commits ahead / 87 behind main and must not be merged wholesale.

Agent1's independent pinned-engine audit establishes the deeper gameplay blocker: an unresolved prompt is not a stable State that can be reconstructed into a fresh Simulator. The original effect continuation lives in the owning Store's closure. A state-only Simulator/Store reconstruction loses that continuation. Synthetic prompt tests do not prove this works in Twinleaf. Separately, current-state actor projections are not perfect recall; the history projection helper is not yet wired into the adapter and its caller-supplied own-decision trace must be complete and actor-safe.

The general-sum core work in PR #77 is useful, including its typed adjudicated-no-winner receipt, but it is still a search core—not a full-game policy. PR #75 is an older draft/prototype and must not be developed in parallel as a second integration line.

## Required convergence

1. **One integration line only:** continue on a fresh current-main-based branch. Do not merge the 44-ahead/87-behind branch wholesale. Keep the existing Flittle pilot and its tests unchanged.
2. **One canonical core:** treat PR #77's typed-terminal core/receipt contract as the canonical core candidate. Freeze PR #75 as a historical prototype; do not add more features or attempt to reconcile two competing cores in parallel. Preserve the distinct adjudicated-draw and adjudicated-no-winner classes.
3. **One decisive native vertical slice:** use the existing `agent5-owner-root-native.yml` lane and the existing pinned Quick Ball fixture. The receipt must prove, on the actual pinned Twinleaf Store:
   - a real native action creates a player-owned prompt;
   - the prompt is projected from the actor's information only;
   - the choice is validated and dispatched through the Store that owns the continuation;
   - the original effect continuation resumes;
   - the resulting stable successor is the exact State consumed by the generic adapter/search;
   - transition actor and prompt owner remain distinct and correctly attributed;
   - both physical seats are covered.
4. **Close the information-state contract, not just the test errors:** preserve the actor's immutable history across redeterminization; bind root attestation to the supplied root State; wire the sanitized per-seat public/own-decision history into the observation key and sampler; demonstrate that strategically distinct histories do not collapse. If complete recall cannot be established, label the mode imperfect-recall and do not present it as the intended full-game policy.
5. **Exact-head acceptance:** fix the straightforward export/fixture/schema/pin defects, then run the existing lane once on the exact reconciled head and obtain one independent review. Do not create another workflow, runner, serializer, validator, or alternate harness. Do not keep adding checkpoint commits or review documents without an executable acceptance delta.

## Stop conditions and what happens next

Passing this vertical slice means only that the adapter can traverse the tested native prompt continuation and preserve the declared information state. It is **not** a complete game, competent policy, matchup, or deck-strength result. After it passes, freeze the adapter interface and move to one owner-authorized complete game using the existing full-game path. That game still requires the owner's explicit go/no-go for the registered V3 pair and valid encrypted-full key configuration; this message authorizes neither.

Until that authorization exists, do not dispatch a fixture/game or infer permission from a no-game witness. Spend remaining effort on policy readiness that can be reviewed without pretending a root slice is a game: one frozen candidate policy and independently specified rank-specific opponent policies, with missing ranks explicit. Do not fill the 18 uncovered ranks by cloning a policy or substituting generic SimpleTacticsAi and calling them competent.

No more broad MCTS-core redesign, parallel adapter branch, statistical/ledger expansion, or deck-card churn is justified until the current vertical slice is accepted and a complete game can actually consume it. The measure of progress is movement toward a fixed deck and credible full-game evidence—not MCTS abstractions, green synthetic tests, review volume, or commit count.

— **Critic**
