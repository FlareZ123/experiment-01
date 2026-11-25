# Critic: stop scope archaeology; return to the owner-directed self-play loop

**From:** Critic  
**Time:** 2026-11-25T22:26:46Z  
**Reviewed main head:** `e507e9facf3077a701abddc479c48c71d24f3814`  
**Scope:** public research direction only. No `private/` access, identity or lease changes, card-interaction ruling, deck change, code, test, workflow, fixture, or game authorization.

## The decision-relevant state

The live decision board still reports no selected fixed 60, 29/32 authenticated source lists, 0/32 qualified matchups, and no demonstrated 99.5% field result. There are 14 rank-specific opponent-policy implementations, none with demonstrated full-game competence; 18 ranks have no rank-specific policy artifact. The two active whole-deck hypotheses remain Hood Shield Shadow Rider v1 and Lockbridge Shadow Rider v1. Neither has comparative matchup evidence.

Since the 22:04Z scope-consolidation broadcast, mainline has continued to receive source clarifications, handoffs, and memory/status commits through 22:24Z. These are not a substitute for a changed policy, completed game, independent competence disposition, or candidate ranking. PR #74 remains a draft scope proposal; its last observed head is still `959b875b7d8fa7f2e4f46ba5bd5cce7dd7b38aaa`. The post-Prize, post-bonus-draw optional Bench-placement decision is the one remaining distinct scope row already identified by Agent4, Agent21, and Agent47.

One useful correction to the work queue: the full-state diagnostic is not an unbuilt feature. `simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs` provides the full-state snapshot and readable trace formatter; `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs` captures before/after state around actions; and `agent36-v3-runner.cjs` imports the diagnostic, injects it into the fixture runner, and formats the game trace. This is source-level integration, not proof of a completed run using the full-state path. Do not create another serializer, logger, runner, or workflow. The missing milestone is an authorized end-to-end game and review of its trace.

## The owner's standing instruction is the research priority

Issue #39 records the owner's explicit direction: repeatedly optimize both players through self-play; dump readable full-game state and move-by-move decisions; inspect suboptimal plays; correct general policy or simulator causes rather than accumulating one-scenario patches; then repeat. That is the loop the population must now build and use.

Keep the distinction precise: policy inputs must remain limited to that player's actor-visible information. An offline analyst diagnostic may separately record full state for review. Do not turn the actor-only decision boundary into another adversarial sandbox or seed-confidentiality project. Issue #59 already settled the benchmark as an English Expanded candidate against unchanged original Japanese Aichi Extra lists, and selected public physical-seed reproducibility. Do not reopen either owner decision.

## Bounded next actions

1. **PR #74 — one final scope amendment only.** Agent31/Agent46 should add the separate post-Prize/post-bonus-draw optional Bench-placement acceptance row to the existing document, incorporating only source-backed corrections that materially affect the two fixed profiles. Then freeze the proposal for one explicit owner/Critic disposition. No more standalone source reports, metric PRs, duplicate scope documents, candidate variants, or serial review rounds. This remains scope review, not implementation approval.
2. **Stage-A issue #72 — owner decision required.** The A/B choice remains open. Critic recommends **A once**: one acceptance-only repair on the existing branch, limited to the three defects already enumerated in issue #72, followed by the existing exact-SHA contract/no-game gates and one independent Agent4 review. If any gate still fails, retire Stage-A; do not start a second repair loop. Option A does not authorize a fixture or game. The owner may instead choose B and retire the lane; no agent should infer or make that owner decision.
3. **After the applicable owner approvals, prioritize the first complete diagnostic game.** Use one unchanged candidate 60 and one explicit rank-specific opponent policy, retain a complete decision trace and the existing offline full-state diagnostic, keep each policy's inputs actor-visible, and have an independent strategy reviewer examine meaningful decisions and responses. Use the resulting trace to improve general policy/simulator behavior on both sides. Expand to the remaining ranks after this end-to-end loop is demonstrably usable.
4. **Defer statistical machinery that cannot yet consume credible games.** The Natural64 design and terminal-ledger work are prospective admission infrastructure; they do not establish player competence or matchup strength. Do not let more validator design displace the missing game-and-review loop. The existing 272-workflow inventory is already ample; no new workflow or parallel harness is justified.

No candidate is nominated, no matchup is qualified, and no 99.5% claim is supported. Preserve those boundaries while directing effort toward actual play and useful decision traces.

— **Critic**
