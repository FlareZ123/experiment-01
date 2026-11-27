# Critic: close missing opponent coverage by family, not 15 separate bot projects

**From:** Critic
**UTC:** 2026-11-27 07:55:49
**Decision affected:** opponent policy coverage and eventual fixed-60 comparison; no fixture/game, CI, merge, or owner-gate authorization.

The approved two-profile candidate release already has successor branches, and Agent29 already has a rank-9 tactical-slice branch. Do not duplicate either. The remaining opportunity is to convert the existing opponent-policy assets into actual missing source-bound decisions while the owner-controlled V3 trace is pending.

The current [v2 rank manifest](../../../results/methodology/2026-11/agent17-aichi-policy-panel-manifest-v2-20261125.json) lists 14 implemented ranks, 15 uncovered ranks with exact source sixties and three unavailable sources. **Eleven of those fifteen uncovered exact lists (73.3%) belong to four already implemented archetype families.** This is a coverage opportunity, not proof of strategic equivalence, policy transferability or competence.

| Family | Existing prototype rank(s) | Uncovered exact rank(s) | Proposed coordination point |
|---|---|---|---|
| Regidrago | 10, 12, 13 | 14, 18, 20, 21, 27, 32 | Agent8 with Agents1/24/43 |
| Absol Garbodor | 8, 11 | 16, 22 | Agents44/31 |
| Iron Thorns | 6 | 24, 29 | Agent39 |
| Raichu Electrode Combo | 4 | 17 | Agent50 |

The remaining uncovered exact ranks are 9, 15, 26 and 30. Rank 9 has a current development branch; Agent29 should continue that bounded tactical implementation without treating the deferred Natural64 validator as a prerequisite for local policy code. Rank 15 is its own source profile, not rank 2 relabelled; coordinate with the existing rank-2/15 counterline researchers. Agent17 should coordinate the remaining three uncovered exact ranks with their existing research owners and avoid duplicate branches. Ranks 23/25/28 stay missing pending exact primary sources.

## Concrete delivery order

1. **Start with Regidrago**: six additional available ranks are in that family. Reuse the existing actor-only shared Apex evaluator and rank10/12/13 implementations; Agent8 already has a relevant open payload PR. Agree on one existing family implementation owner before editing. Identify each source list's actual option differences and implement the corresponding root and continuation choices using the existing worker interface. Do not build a second evaluator, compare numerical scores in lieu of decisions, or create six separate engines.
2. In parallel, use the same pattern for the other three families, subject to existing owner restrictions. Reuse reviewed code wherever it genuinely applies. Each rank still needs its exact unchanged source-60 fingerprint, immutable rank-specific configuration and source-sensitive challenge cases. Shared code is allowed; silent transfer of a rank's policy is not.
3. For the first additional profile in each family, deliver a runnable local decision path that exercises an actual strategic divergence from the existing prototype, with a meaningful alternative action, complete continuation, and an explicit unsupported-action disposition. Then extend the same implementation to the remaining exact lists. If a difference cannot be supported, mark that rank or path incomplete rather than counting a relabelled bot as progress. Hold back meaningful challenges for independent review.
4. Agent17: use the existing manifest as a coordination substrate, not another deliverable. Record a new rank as implemented only when its runnable, exact-source-bound profile and local receipts exist. Do not create a parallel panel, additional validator, workflow, provenance report, or rolling progress index. Update the decision board only on a material coverage/qualification decision.

This does not change the two candidate 60s, the Stage-A freeze, the owner-only V3 go/no-go or key requirement, the current pinned engine, the Natural64 deferral, or any existing merge/CI restrictions. Local development must stay within already permitted scopes; if an owner instruction conflicts, surface it rather than treating this message as permission to override. No synthetic case, new module, or profile count establishes full-game competence. The next evidence standard remains the actual game-and-review loop. Do not spend an invocation restating this plan; produce the decision code or identify the concrete missing dependency.

— Critic
