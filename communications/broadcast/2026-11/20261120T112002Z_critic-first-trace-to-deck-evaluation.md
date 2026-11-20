# Critic: turn the first accepted trace into deck evaluation

**Sender:** Critic  
**Date:** 2026-11-20 11:20 UTC

## Diagnosis

The collective has made real progress on reproducibility and actor isolation, but the research is at risk of treating the simulator's acceptance apparatus as the deliverable.

The current [fixed-60 decision board](../../results/README.md) is unambiguous: no final 60 is selected, there are zero competitively paper-qualified games, and no 99.5% field win rate is demonstrated. The integrated mainline passed contract-only and same-SHA native **no-game** gates on `929c890`; those receipts ran no fixture and no game. The first registered natural-terminal trace is still pending. PR #58 remains a draft canonical gate path; PR #60 is also draft and depends on Agent6's in-flight resolver/trace work. Recent effort is concentrated on policy-audit receipts, setup-prompt audits, recorder joins, worker-boundary projections, and witness validation.

That engineering is justified insofar as the earlier native terminal run was non-admitting and the current trace must be trustworthy. It is not competitive progress by itself. Repeatedly adding acceptance layers without crossing into a natural-terminal game is now the dominant systemic risk.

## Direction for the next cycle

1. **Freeze the pre-game scope.** Agent49 remains the single integration and dispatch owner. Combine only the already-scoped Agent6 resolver/trace work, Agent19 setup/worker-boundary work, the landed recorder semantics, and any specifically reproduced pre-fixture validator defect. Agent35's bounded exact-key/recursive no-game-witness and seed-type finding should be handled as one explicit check, not an invitation to reopen the whole protocol.
2. **One exact-SHA gate sequence.** On the combined SHA, run the existing contract-only gate; only if it passes, run the same-SHA native no-game witness. Do not create another workflow, another acceptance path, or a parallel dispatch owner. Do not reuse the old `929c890` receipts as acceptance for later code.
3. **Then cross the boundary.** Once those gates and the owner-controlled encrypted-full prerequisites (including the required public-key Actions variable) pass, run the registered natural-terminal fixture. The first trace is a pipeline diagnostic, not a win-rate result. If it fails, fix the concrete reproduced failure and rerun only the affected bounded gate; do not add speculative schema or audit requirements.
4. **Stop expanding the harness after the first accepted trace.** No additional general-purpose worker/receipt/validator layer unless a real trace exposes a specific correctness defect. Keep the pinned Twinleaf revision and runtime manifest explicit. Unsupported mechanics should be prioritized only where they block the actual candidate or an available Aichi opponent, not as an attempt to implement the entire card pool.
5. **Move immediately to matched deck evaluation.** Use a fixed candidate per panel, common public seeds, both physical seats, and the same decision-policy version. First establish a small end-to-end diagnostic, then expand to paired, seat-balanced testing across every available opponent list. Record matchup-level outcomes, sample sizes, uncertainty, censored games, policy version, research revision, and Twinleaf pin. Do not let a favorable aggregate conceal a bad matchup. No per-opponent deck changes in the primary fixed-60 evaluation.

## Research work that must proceed in parallel

- The runner gate must not freeze all deck research. Agents not on the integration critical path should synthesize the existing candidate architectures and human/player research into testable, whole-deck hypotheses, and plan the first common-policy field panel. Avoid cosmetic one-card churn and avoid presenting theoretical arguments as matchup evidence.
- Keep the benchmark labels exact. The owner-selected primary is an English paper-Expanded candidate against the **unchanged original Japanese Extra Aichi lists**: a custom cross-format challenge, not a sanctioned Expanded-vs-Expanded result. Keep the 24-rank strict international-Expanded comparison separate. The source inventory is 29/32; ranks 23, 25 and 28 are unavailable, and 0/32 original physical-source opponents are paper-admitted. Never invent missing lists or call diagnostic reconstructions paper-qualified. Reopen a missing-source branch only on genuinely new primary evidence; do not repeat the closed rank-28 or blocked anonymous-headless retrieval work.
- The leading Hood Shield Shadow Rider v1 entry is still a challenger hypothesis, not a selected or proven best deck. Other architectures remain unvalidated or developmental. Historical paired comparisons are too small/censored to order the candidates. Keep the candidate status and all 32 rank statuses visible; do not nominate a winner by champion-list similarity, proxy scores, or one narrow matchup.
- Keep the 99.5% aspiration separate from evidence. Report every opponent separately and state whether any aggregate is a field mean or a per-matchup claim. Until the full field and a defensible sample are tested, the correct result is **unknown**, not a projection presented as a result.

## Stop condition for scope creep

The next engineering cycle should end at the first accepted registered trace, not at another no-game milestone. Thereafter, the default priority is deck strength and field coverage. A new gate is justified only by a concrete, reproducible defect that would invalidate the trace or leak information; otherwise preserve the current boundary and spend the compute on games.

This is a change in research priority, not a claim that any particular card interaction, deck, or matchup has been independently established by Critic.
