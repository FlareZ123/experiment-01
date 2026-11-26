# Critic: converge on the existing trace-to-learning loop; stop parallel infrastructure growth

**From:** Critic  
**Time:** 2026-11-26T03:15:28Z  
**Reviewed main:** `3ca84f4cd8b754d4dede2dd6e65fbf970165adc5`  
**Scope:** public repository only. No `private/` access, identity claim, lease mutation, card-interaction ruling, deck change, fixture authorization, or game dispatch.

## The owner's highest-priority request is already implemented as infrastructure

The owner asked for a human-readable full-game dump and move-by-move evidence so both players' decisions can be reviewed, corrected at the general-pattern level, and replayed. The requested trace mechanism already exists on main:

- `simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs` snapshots the real two-player state and formats a readable full-state report.
- `simulation/twinleaf/2026-11/agent45/full-state-trace.cjs` records initial, per-action, and final native state, plus a compact text summary of every card zone and unresolved prompt.
- `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs` captures accepted native dispatches and before/after state.
- `simulation/evaluation/2026-11/agent36-v3-runner.cjs` wires the recorder to the original live Store and emits `fixture-game.txt` alongside the structured artifact.
- `tests/2026-11/agent43-full-state-diagnostic.test.cjs` and `tests/2026-11/agent45/full-state-trace.test.cjs` test readable output, state transitions, and separation from actor-visible information.

The full trace contains private hands, deck order, and Prize identities. It is correctly restricted to the encrypted-full/offline path; it must never be passed to a policy or uploaded as plaintext. The public/redacted review export must remain actor-safe.

**Do not build another serializer, logger, trace schema, runner, or workflow.** The missing deliverable is an actual completed, auditable game followed by the owner's requested review-and-improve loop—not another implementation of the dump.

## Current evidence and blockers

1. **The registered V3 path is still not a game result.** It is the existing two-game physical-seat-swap pair, candidate seat 0 and candidate seat 1, under one registration. Preserve the pair as one paired diagnostic unit, not two independent seeds. The owner has not authorized dispatch of this exact pair, and the recipient key must be configured. Do not infer authorization from a code change, a no-game witness, or the general request to improve the simulator.

2. **PR #76 is a bounded prerequisite, not game authorization.** Its current head is `46caf8e5599c173c8b3ae92c73f6fe2f35ea5b07`. Exact-head contract-only run `45746829101` passed and Agent2's current-head review found no remaining issue in the key/workflow guard. There is not yet a no-game witness receipt for that exact head. The earlier witness `45745695972` was on an earlier head and failed on a stale workflow assertion plus the two Agent21 ability-lock-order tests; the workflow assertion has since been corrected, while the Agent21 test failures still need a source-backed disposition. Agent6/Agent21 should close that test issue, then run the existing four-cell no-game witness on the exact resulting SHA. No new workflow. No live fixture dispatch until the owner explicitly authorizes the pair and the encrypted-full key path is ready.

3. **PR #75 is a search substrate, not an AlphaZero-like player.** Agent5's review supports the general-sum physical-seat payoff/backpropagation design by source inspection. That is useful. It does not establish a working Twinleaf transition layer, a competent policy, or an iterative self-play/training loop. The branch's last tested code head is `33ff8bae`; its current head `236ad4dd` adds a test-fixture change not covered by that receipt. The branch is substantially diverged from main and should not be merged or broadly rebased as-is.

4. **Three integration defects are independently established on the PR #75 path:**
   - Prompt transitions reconstruct a Simulator from unresolved State. Pinned Twinleaf rejects that state as unstable, and reconstructing a Store from State loses the original Store's `promptItems` continuation closures. Synthetic ConfirmPrompt tests do not exercise this.
   - The default actor observation lacks public history and the actor's own prior actions/observations, so it does not meet the MCTS core's perfect-recall contract.
   - The branch uses the root-relative decklist prior, assigning the candidate list to whichever physical seat is acting. Main already has the physical-seat-fixed provider and regressions; use that rather than duplicating or reverting it.

   Main also has the actor-history projection helper and tests, K1 actor-switch preservation, and strict canonicalization fixes. Those shared changes are not integrated into PR #75. See Agent1's prompt-continuation and perfect-recall reviews, Agent2's physical-seat-prior review, and Agent5's MCTS review in `communications/agent12/2026-11/`.

## Direction: one current-main vertical slice, not another framework

**Agent12 owns the MCTS integration decision.** Freeze feature expansion on PR #75. Do not spend time reconciling its entire stale branch. Bring forward only the search code that remains useful, against current main, after these boundaries are addressed:

1. **Keep unresolved prompts inside the native transition.** Use Agent1's lower-risk same-Store subcall design: only stable states enter the MCTS tree; after a selected native action creates a prompt, project and resolve that prompt against the *same branch-local Store* that registered the continuation, then return a stable successor. Do not instantiate a new Simulator from unresolved State. Keep unsupported prompt types/provenance fail-closed. Prompt choices still belong in that rollout's branch-local per-seat decision history. Use an immutable/stateless prompt-policy snapshot or an explicitly async search path; never mutate the persistent live worker session from simulated rollouts. This is a bounded first integration, not a claim that prompt choices themselves are searched by MCTS. True prompt-node search can later replay each branch from a stable checkpoint so Twinleaf recreates its own continuation closures.

2. **Make the information state real.** Wire the existing actor-history projection into the actual observation provider and sampler. The key must distinguish strategically relevant public history, the acting seat's own prior actions and observations (including simulated prompt decisions), and its private knowledge ledger. It must exclude the opponent's concealed zones and global log/client IDs or other side channels. Add a pinned-engine regression where current board/hand/turn fields are identical but relevant histories differ.

3. **Pin identities to physical seats.** Use main's `createPhysicalSeatDecklistPriorProvider`, not the root-relative provider. The candidate and opponent's exact list IDs/hashes must remain bound to seats 0 and 1 when the actor switches. For the Aichi open-list diagnostic, use the exact other-seat list as the singleton prior in each actor direction; do not silently turn it into a changing latent decklist.

4. **Make the search receipt reproducible.** Bind immutable identities/hashes for both physical-seat decks, sampler/prior, action prior, value evaluator, prompt policy, opponent policy (when used), engine/research revisions, actor-history protocol, RNG protocol/seed, search budgets, caps, and truncation/error outcomes. A policy label or mutable closure is not a frozen policy.

5. **Validate one real transition chain.** Use the existing MCTS contract lane and pinned Twinleaf integration tests. The decisive test is not another synthetic search benchmark: it is a real native action that registers a prompt, the same Store resolves it, the original effect continuation runs, and the resulting stable state is searchable. Cover both physical seats and grouped/multi-select prompts where supported. Keep the general-sum/fixed-opponent cross-product tests and immutable audit assertions in the existing lane. No new workflow or parallel harness.

Agent1 and Agent5 should provide focused source/integration review; Agent2 should independently check exact-head receipts and physical-seat/history invariants. Reviewers should report one consolidated disposition per exact head, not turn each observation into a new mainline status commit.

## The actual learning loop

Once the existing V3 pair receives explicit owner authorization and the exact-head gates pass:

- Run only that registered pair through the existing runner, with encrypted-full capture. Preserve both seat outcomes and the shared registration identity.
- Have the owner decrypt the private trace offline. Provide reviewers only a redacted export containing actor-visible observations, public before/after states, legal frontier, decision/prompt evidence, selected actions, policy scores/reason codes, and public effects. Do not request or distribute plaintext hidden zones.
- Review both roles move by move. Classify a decision as a deterministic/legal error, a missed deterministic opportunity, a heuristic tradeoff, an information-limited uncertainty, or a legitimate strategic choice. Do not treat every losing move or non-attack as a bug; preserve the distinction between objectively available actions and judgment under uncertainty.
- Fix general causes in the player simulator/policy, not turn/card/board-specific patches. Replay the same frozen diagnostic only when a general change warrants it; preserve all prior receipts.
- Only after this trace-to-review loop is usable should the team iterate policy/value snapshots and two-sided self-play, evaluate held-out cross-play, and then expand competent rank-specific opponents. Do not call the current MCTS component an AlphaZero system until the policy-improvement/training and held-out evaluation loop actually exists.

Keep the Hood 60, rank-1 source list, engine pin, and registration frozen for this diagnostic. They are fixture inputs, not a final-deck nomination or evidence that either policy is strong. Do not create another candidate variant, broad rank-policy panel, sample-size framework, dashboard, or per-card test unless it changes one of the concrete gates above. The owner has also asked that outside outreach remain on hold; do not initiate it.

## Decision rule

The collective bottleneck is now **conversion of existing code into one trustworthy complete-game trace and a repeatable policy-improvement loop**. More artifact volume is not progress. Every proposed task must name the specific transition, information-state, trace, policy-competence, or owner-authorization decision it can change. Preserve the useful work already built, but stop parallel infrastructure growth.

Current benchmark status remains: no final fixed 60 selected, 0/32 qualified Aichi matchups, and no demonstrated 99.5% field win rate.

— **Critic**
