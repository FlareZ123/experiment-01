# Agent5 — connecting actor-relative PUCT to DCI/AMR and whole-deck evaluation

**20 November 2026 · design synthesis only**

**Status:** post-trace integration specification. No code, candidate list, policy, fixture, workflow, seed, seat map, Twinleaf revision, game, matchup result, or win-rate estimate is changed or claimed here.

## Purpose

The repository already has two useful but separate pieces:

- an actor-relative re-determinizing PUCT core with an observation-only fixed-opponent callback ([implementation and synthetic regression](agent5-actor-relative-redeterminizing-puct-20261119.md));
- a state-conditioned formalization of DCI, AMR, connector domination, ALS, K0/K1 and resource constraints ([formal model](agent5-state-conditioned-action-realism-model-20261113.md)).

This note specifies how they should fit together for a common player. The key design rule is: **DCI and AMR are properties of competing legal continuations in a particular information state, not static scores attached to card names.** PUCT should compare complete, resource-consuming decisions by their downstream value.

## 1. Search contract: one edge must be a playable decision

A search node is an acting player's information set, identified by physical seat and a canonical actor-observation hash. The observation must include enough perfect-recall history to distinguish strategically different information sets:

- current public board, public events and turn/action history;
- the acting player's own hand and legitimately known own zones;
- the acting player's K0/K1/PARTIAL knowledge ledger, including known top/bottom deck information;
- the acting player's own prior actions and information transitions;
- public effects, restrictions and current turn resources.

It must exclude the other player's concealed hand/deck/Prize identities, omniscient engine state, sampled hidden worlds and physical shuffle RNG.

A search edge is **not** merely a root Trainer play if that play opens prompts. It is a fully settled composite decision:

`root action → physical payment → prompt targets/choices → native validation → accepted Store transition`

The edge key must bind the root action, physical card/copy identity, prompt source and shape, selected tokens/targets/payments, and settlement receipt. `applyAction` must return a detached stable state with no unresolved prompt. A greedy prompt resolver outside the search makes the root action and its consequences separate decisions and can erase connector tradeoffs.

The native action enumerator and transition adapter are trusted host-side components. The player policy and its priors must receive only the actor observation and sanitized actor-visible action descriptors. Do not pass a raw native State, other-seat prompt, or action object containing references to concealed zones into a policy callback.

## 2. What each PUCT callback is allowed to mean

| Search component | Correct responsibility | Invalid shortcut |
|---|---|---|
| `enumerateActions` | Complete legal frontier for the current actor, including all relevant physical prompt choices | A partial list of convenient actions or a frontier that changes across hidden worlds with the same observation |
| `actionKey` | Stable key for a complete composite action | A card-name-only key that merges distinct physical payments or targets |
| `actionPrior` | A search prior over already-legal, actor-visible action descriptors | A card-strength score, proof of legality, or substitute for downstream value |
| `redeterminize` | Sample a detached state from the *current acting seat's* verified belief before each nonterminal decision/leaf | Reuse the root player's hidden world at every opponent node |
| `opponentActionPolicy` | Pure/stateless actor-observation policy over sorted legal action keys, with a stable policy ID | A callback that reads native State, opponent hidden zones, mutable cross-rollout closure state, or sampled-world details |
| `terminalValue` | Exact natural-terminal outcome utility from the requested seat's perspective | A setup score or incomplete-game value presented as a win |
| `evaluateObservation` | Actor-observation-only estimate for a deliberately truncated leaf, calibrated against completed games | Uniform/zero values treated as a competitive evaluator, or hidden-state access |

The current core already supports `redeterminize(state, actorSeat, random, actorObservation, deadline)` and `opponentActionPolicy(observation, sortedLegalActionKeys, seat, rng)`. These are useful core seams, not proof that the current Twinleaf adapter is ready: the adapter remains Flittle-only, root-seat constrained, and lacks a complete Expanded action/prompt frontier. If a natural terminal can be a tie, preserve a zero-sum search utility (for example, draw = 0) and separately count that outcome as a nonwin in the benchmark ledger; do not silently report draw as half a game win.

For field evaluation, use one frozen candidate-policy/search configuration across every rank, plus one independently assessed immutable opponent policy per original rank. The candidate policy may condition on its permitted observation and predeclared public matchup context, but must not fork into rank-specific scripts. Each rank's opponent-policy ID/config remains unchanged across candidate physical seats and actual-first-player strata. Hold search budget, evaluator, prior version, RNG protocol and stopping rules fixed. Keep three identities separate in the run manifest: (a) the candidate's policy ID, which is identical across ranks; (b) the rank-specific opponent policy actually used by the opposing bot; and (c) the candidate search's opponent-response model. If the exact opposing 60/policy is explicitly public matchup context in the benchmark, bind that assumption and allow the candidate model to use it. Otherwise the candidate policy must infer from actor-visible public cards/history and sample from a public-evidence decklist prior; the true hidden list may parameterize the game environment and opposing bot, but must not be passed into the candidate's observation or action prior. A rank-specific response model is an evaluation assumption, not permission to reveal concealed opponent information.

## 3. DCI as a counterfactual continuation value

For one legal search/payment action, hold the non-discard effect fixed and compare complete legal physical discard sets. Under the same source information state, opponent policy, continuation-policy class and search budget:

`DCI(D1 versus D2 | s,a) = Q(s_after_D1) - Q(s_after_D2)`

where `Q` is the expected downstream game utility under that declared continuation contract.

Consequences:

- DCI is **set-valued and non-additive**. Two individually expendable cards can be jointly required for a later line; two individually valuable cards may be jointly safe to discard after their purpose is complete.
- Compare physical copies and actual zones, not just print names. A card in the discard, a card in hand and a copy already committed to the Bench can have different continuation value.
- Compare the same action's non-discard effect. Do not call a different search target, Supporter line or action cost a discard preference.
- Preserve all legal discard subsets in the action frontier where feasible. If pruning is necessary, label the omitted choices and test that pruning does not remove a high-value line.
- A hand-written DCI estimate may seed `actionPrior`, but the search value must decide the tradeoff. A high prior is not evidence that the discard was strategically correct.

The PUCT tree naturally compares connector alternatives only if each prompt choice is represented as a distinct complete edge and the successor state retains the real resource consumption.

## 4. AMR as deadline-conditioned execution and fallback

For a line `π`, record at least:

`(P(execute by deadline), E[ΔU | execute], E[ΔU | not execute], resource_cost, failure_modes)`

The deadline may be the opponent's next lock/attack, a turn boundary, a Prize-race threshold, or the match clock. The failure branch is the actual fallback continuation, not automatically zero. A low-probability line with decisive payoff can outrank a high-probability line with little gain; success-only samples conceal this distinction.

PUCT rollouts can estimate the execution probability and conditional outcome components, but the runner should record them explicitly. Do not infer AMR from whether a line was observed to succeed in a small selected subset. Include failed attempts, blocked prompts, no-opportunities, resource shortfalls, opponent interruptions and capped/censored games.

AMR-overriding is represented by the state transition and deadline: spending a protected resource before a lock can be optimal when waiting removes the line. Do not hard-code a permanent discardability or preservation label.

## 5. Human concepts become native state constraints

- **Connector domination:** Arven, Computer Search, Guzma & Hala, Serena, Secret Box and other connectors create competing branches. Search their actual alternatives under one Supporter/action budget; do not add their theoretical reachability counts.
- **ALS:** represent a deck as ordered contingent lines with prerequisites, payments, Active/Bench footprint, timing, once-per-game powers and opponent responses. Search must reach the decisive continuation or use an evaluator that represents partial-line progress and its remaining obligations.
- **Lock topology:** Ability, Item, Supporter, Stadium, Tool and attack-origin restrictions are different state effects. Let native rules and actual board position determine which lines remain; do not award independent additive bonuses to locks that suppress one another.
- **Discrete tactical value:** gust, lock removal, attack copying, prevention and Prize-taking lines can be rare but decisive. Do not prune them solely because their opening access or average setup score is low. Use adversarial challenge states and completed-game outcomes to calibrate priors.
- **Multi-Prized collapse:** sample the joint hidden partition consistent with the acting player's K0/K1/PARTIAL information. Do not multiply independent marginal Prize risks when a line requires several components simultaneously.
- **Bench and Active occupancy:** model the actual five-slot Bench, Active pivot, retreat and attacker requirements as successor-state constraints, not as independent card bonuses.
- **Supporter/Energy/VSTAR limits:** use the native per-turn and once-per-game resource state. A connector already spent cannot be counted again in a later branch.

## 6. Actor-relative information must survive every resample

The actor-relative core verifies that the actor observation hash is unchanged by re-determinization. That check proves preservation of the supplied projection, not its completeness or the sampler's correctness.

The Twinleaf adapter integration must additionally prove:

1. A player who has completed a deck search retains its exact K1 Prize membership through later re-determinization.
2. PARTIAL knowledge retains its known top/bottom deck blocks and invalidation semantics.
3. The non-acting player's prior private ledger is not copied into the acting player's belief. Reconstruct that player's sampled private state from the new actor's information, then derive the simulated opponent's own ledger from the sampled world.
4. Both physical seats can become the acting root; seat-swapping does not change the policy distribution for equivalent observations.
5. Changing only the other player's concealed cards cannot change the acting player's observation, action frontier, action prior, opponent-policy input or chosen action under the same policy RNG.
6. The same actor observation always yields the same complete legal-action frontier, regardless of the sampled hidden world.
7. Transition randomness, actor-relative determinization RNG and opponent-policy RNG remain separate and reproducibly derived. The owner authorized public reproducibility; that does not authorize exposing the physical shuffle seed to a policy worker.

A specific source-level risk is recorded in [the Agent25 K1/PARTIAL handoff](../../../communications/agent25/2026-11-20T130300Z_agent5-actor-relative-k1-preservation-risk.md): the current sampler recomputes root knowledge with a null owner-K1 snapshot and does not first reuse the acting seat's ledger from sampled-state metadata. It must be resolved and tested before the core is used after K1 transitions.

## 7. Staged validation and field use

Do not start this work before the registered first natural-terminal trace has passed the canonical owner gates and been reviewed. After that:

1. Use the accepted trace to bind the actual pinned Store, prompt, observation and public-history interfaces. Do not guess at native fields.
2. Reproduce the synthetic strategy-fusion regression under Node 22 and the pinned Twinleaf integration tests.
3. Add K0, K1 and PARTIAL actor-relative re-determinization tests; both-seat and seat-swap tests; hidden-world non-interference; complete-frontier invariance; and complete prompt-settlement tests.
4. Validate one small fully specified prompt chain and its competing payments/targets with the same continuation policy. Keep the exact Flittle fixture separate from Expanded applicability.
5. Run the registered Hood v1 versus rank-1 source diagnostic only under the frozen bundle. This is a pipeline/policy diagnostic, not a competitive matchup result.
6. Only after policy and engine readiness, run the 29-list, four-game-per-rank smoke panel (116 games) as coverage/failure detection. It is not a win-rate estimate and does not fill ranks 23/25/28 or paper-admit original physical opponents.
7. Freeze a single candidate 60 and policy bundle before confirmatory testing. Do not promote a candidate based on the smoke panel or on posthoc candidate-specific policy changes.

Report each opponent separately, both candidate physical seats, actual first-player order, wins/losses/draws, natural terminals, censored games, policy IDs, action/prompt receipts, candidate/opponent deck hashes, engine/research revisions, and uncertainty. Keep the 29-list diagnostic, 24-list strict-Expanded comparison and owner's 32-list cross-format target as distinct estimands.

## Limits

This is a design bridge, not a validated search policy. No DCI/AMR value, legal Expanded frontier, candidate ranking, matchup outcome, or 99.5% result is established. The first-trace/PR #58 owner boundaries remain unchanged: Agent49 owns canonical integration and dispatch; Agent6 owns the first registered trace; Agent19/Agent45 retain recorder/setup-audit ownership; Agent25's adapter work is deferred until the accepted trace.
