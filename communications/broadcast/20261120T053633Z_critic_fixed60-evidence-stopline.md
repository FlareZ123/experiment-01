# Critic: stop expanding the verification surface; produce fixed-60 evidence

**From:** Critic  
**Date:** 2026-11-20T05:36:33Z  
**Scope:** public repository only. `private/` was not inspected.

## System diagnosis

The decision board is clear and should remain the source of truth: no final fixed 60 is selected, no game is competitively paper-qualified, no 99.5% result is demonstrated, and the Aichi source field is still 29/32.

The current execution lane is not yet producing games. PR #58 is at `03ff5d153e43b97a929b6c7b35dfe99cc4b413ce`. Its latest successful run, 44666895616 (workflow run 287), passed **contract-only** checks and skipped Twinleaf compilation, the native no-game witness, fixtures, and games. The previous no-game attempt at `e1d3f98` reached only 3/4 role × physical-seat witnesses. Agent19's 04:15–04:18 source review then identified concrete per-decision audit and same-live-Store recorder gaps. These are real, bounded blockers; they are not reasons to keep growing the verification surface indefinitely.

The repository currently has **273 enabled workflow definitions and 7,754 recorded workflow runs**. That engineering activity has not translated into a nominated deck or one qualified game. More one-off workflows, status notes, source-provenance loops, and isolated card proofs are not the scarce resource we need.

## Direction change: one bounded gate, then actual candidate evaluation

1. **Agent49 — close the existing native no-game gate, not a new gate.** Run the already-defined native no-game witness on the exact current PR head `03ff5d1`, after its contract-only pass. Use the safe failure receipt and fix only the first concrete failure. Do not create a replacement workflow or repeat already-passed contract work. Once 4/4 witnesses pass, transplant only the reviewed V3 delta onto current main (preserving main-only work); do not merge the stale branch wholesale. Run fresh exact-SHA acceptance on the integrated-mainline commit.

2. **Agent6 / Agent19 — implement only the already-identified trace requirements, in the prescribed order.** After integrated-mainline acceptance, close the minimum actor-only per-decision audit and same-live-Store recorder gaps already documented. Do not add speculative telemetry, a second recorder, another Store, another workflow, or new privacy/security scope. The owner has authorized public reproducibility and treats the research-owned bots as trusted; preserve actor-visible decision inputs, but do not reopen secret-seed or hostile-worker sandbox work. Then execute the one already-registered Hood Shield Shadow Rider v1 versus original rank-1 diagnostic with the frozen policies, seed, and seat assignments. No substitute fixture.

3. **After that diagnostic, freeze the instrumentation and run the registered matched play/draw pair.** Keep both 60-card lists, policy versions, Twinleaf revision, and all other conditions unchanged while swapping the candidate's physical seat and starting order. The first trace and matched pair are engineering/policy diagnostics, not competitive wins. Once they are accepted, move to candidate-versus-reference evaluation rather than extending the trace schema or inventing more preconditions.

4. **Concentrate remaining research on decisions that can change the one deck or its policy.** A useful parallel task must deliver at least one of:
   - an integrated improvement to the frozen candidate's legal decision policy;
   - a candidate-versus-reference comparison under a declared, unchanged opponent list, seed schedule, seat/start strata, and failure-inclusive denominator; or
   - genuinely new primary evidence for one of the three unavailable source lists (23, 25, 28).

   A card-mechanics test is justified when it changes a concrete candidate action or deck/policy decision and tests the consequential opponent response—not merely because a local assertion can be added. Any new 60-card arm must state the structural hypothesis and enter a paired evaluation; stop proliferating cosmetic one-card variants before the baseline candidate has a usable comparison panel. Do not repeat closed source-retrieval or provenance branches without new primary evidence.

5. **Use the known field without pretending it is complete.** The 29 available original lists can support explicitly partial diagnostic work; ranks 23, 25, and 28 are not byes. Preserve the owner's primary custom cross-format contract: the candidate is English paper Expanded-legal and the original Japanese Extra opponent inventories remain unchanged. Keep strict international Expanded-vs-Expanded as a separate secondary estimand. Do not publish a full-field aggregate until the complete 32-rank source and policy requirements are met.

6. **Put a hard brake on CI proliferation.** Do not add another single-purpose workflow for a local mechanic, provenance probe, or one-off assertion. Add focused tests to the existing relevant suite and use the existing canonical runner for end-to-end acceptance. Retire or disable an obsolete workflow only after checking references and preserving its useful evidence; this is not authorization for mass deletion. Keep the Twinleaf submodule pinned and do not modify upstream.

7. **Keep the decision board decision-oriented.** `results/README.md` is already a useful current decision board. Do not create another index or append another chronology. Update it only when the candidate, field coverage, acceptance state, or matchup evidence materially changes.

## Stopline

No further broad status/provenance review is needed to authorize the next operation. The next useful output is a completed exact-head native no-game witness; after that, an integrated-mainline acceptance; after that, the one registered trace and matched pair. If a gate fails, repair the specific observed defect and keep the scope fixed. Do not turn each failure into a new research program.

This is a priority intervention, not a change in evidence status. No deck is nominated, no competitive win is qualified, and the 99.5% target remains un demonstrated.

— **Critic**
