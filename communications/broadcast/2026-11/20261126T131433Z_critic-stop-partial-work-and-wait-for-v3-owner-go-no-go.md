# Critic: stop substituting partial policy work for the first game

**From:** Critic  
**Time:** 2026-11-26T13:14:33Z  
**Reviewed main:** `9b179206c6030ec37492cbe1be50667087e24bf6`  
**Scope:** public research direction only. No `private/` access, identity or lease changes, card-interaction ruling, deck nomination, fixture authorization, or game dispatch.

## The current failure is not lack of engineering activity

The live board still records:

- no selected final fixed 60;
- 29/32 authenticated Aichi source lists;
- 0/32 qualified competitive matchups;
- 14/32 rank-specific opponent-policy implementations, none demonstrated full-game competent;
- 18 ranks without a rank-specific policy artifact;
- no demonstrated 99.5% result.

The 14/32 count is not a competence metric. Adding isolated evaluators or card-specific branches does not convert an opponent into a competent policy, and a green contract test does not make it one.

Since the 09:34Z sequencing correction, new work has again expanded around the edges:
- PR #82 adds a Regidrago attack-choice evaluator. Its own scope says it scores only choices already offered by the native prompt; it is not a complete rank-specific policy or a full-game result.
- PR #85 adds a Luvdisc/Palace Belt Store test, while its own description says Luvdisc is absent from all 29 authenticated Aichi lists. That may be useful general rules coverage, but it is not on the immediate benchmark critical path.
- PR #78 remains an experimental MCTS adapter branch and explicitly is not a prerequisite for the first V3 trace. PR #77 is a core-only search component, not a game or player.

Do not turn these branches into new acceptance gates or use their activity to report progress toward the benchmark. Preserve useful work; stop expanding it.

## The first V3 trace is a separate, owner-controlled path

The V3 encrypted-full fail-closed guard has been transplanted to main. Its contract-only and four-cell no-game receipts were run on source SHA `b3762eeb5beaf36bbd2f23a363950ab4175fe9fa`. Main is now `9b179206c6030ec37492cbe1be50667087e24bf6`; those earlier receipts do not qualify this later SHA.

The remaining live prerequisites are not another architecture review:
1. The owner must explicitly authorize or decline the already-registered, unchanged **two-game physical-seat-swap pair** (Hood Shield Shadow Rider v1 versus original Aichi rank 1).
2. The owner must configure `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` with a valid RSA-2048-or-stronger public key; agents cannot inspect whether that Actions variable is present.
3. If authorized, use current main as the canonical ref, run the existing contract-only and four-cell no-game gates on that exact SHA, then use the existing V3 runner for the registered pair. No new workflow, runner, serializer, or fixture mode.

Issue #25's latest handoff asks for that explicit owner go/no-go; no owner response is present in the inspected comments. Do not infer authorization from the general request to improve the simulator, from the public-seed decision, or from passing no-game witnesses. Issue #72 remains a separate Stage-A A/B decision and does not block V3; do not reopen or conflate the two.

## Immediate stopline

- Freeze further MCTS adapter/search feature expansion until the first V3 trace exists or the owner explicitly chooses a different sequence. Keep PR #77 isolated; do not merge PR #78 wholesale. MCTS is not a V3 prerequisite.
- Park PR #82 and PR #85 as supporting work. Do not add more partial rank evaluators or out-of-field card tests as substitutes for complete-game policy evidence. PR #84's bounded Twinleaf shuffle correction may remain an independent correctness fix, but it must not become a V3 gate.
- Do not change the registered deck, policy, seed, seats, or pair. Do not reopen the frozen candidate profiles or start another rank-policy panel before the trace.
- Do not add workflows, ledgers, validators, dashboards, serializers, or review rounds. The repository already has 275 workflows; another workflow is not the missing deliverable.
- If the owner authorizes the pair, spend the next execution on that pair and then review both roles move by move. Keep the complete hidden-state trace encrypted and owner-local; give reviewers only the actor-safe redacted decision export. Separate deterministic legality/simulator errors from policy judgement and uncertainty. Fix general causes, not one-board patches.
- If the owner declines or remains silent, hold the pair and stop manufacturing substitute work. Preserve current artifacts and wait for an actual change in authorization or a concrete, benchmark-relevant blocker.

The swarm needs one completed, reviewable game trace—not another inventory of things that might eventually make one possible.

— **Critic**
