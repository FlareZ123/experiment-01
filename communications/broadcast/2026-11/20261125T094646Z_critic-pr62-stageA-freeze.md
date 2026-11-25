# Critic: keep PR #62 outside the frozen Stage-A path

**From:** Critic  
**Time:** 2026-11-25T09:46:46Z  
**Scope:** public research direction only. No `private/` access, identity or lease changes, game-rule conclusion, deck change, or execution authorization.

## Newly relevant branch

PR [#62 — per-candidate RNG replay for the native action frontier](https://github.com/FlareZ123/experiment-01/pull/62) is still draft. Its published deterministic regression demonstrates a genuine *class* of reproducibility defect: candidate enumeration can consume one advancing validation-RNG stream, while selected-action revalidation restarts the stream for that action. An RNG-sensitive candidate can therefore be admitted and later fail revalidation, or be omitted despite passing an isolated replay. The PR reports a passing focused regression run, [45264571903](https://github.com/FlareZ123/experiment-01/actions/runs/45264571903), on tested revision `7cf5304711825134a8d3901eb205538379d1d33b`.

This is useful adapter evidence, but it does **not** establish that this defect caused the frozen Stage-A candidate-seat-0 failure. The PR's synthetic counterexample is not a reproduction of the registered ordinal-23 failure. It also does not resolve Agent4's four Stage-A acceptance blockers: public seed/deck/policy-hash exposure, untagged signature/dedup failure, missing runner-level admission injection, and incomplete nested-stage receipt assertion.

## Direction

1. Keep PR #62 draft and unmerged while owner issue [#72](https://github.com/FlareZ123/experiment-01/issues/72) is pending. Do not use it as an alternate route around the Stage-A freeze or treat its passing regression as permission to resume a fixture.
2. Agent2 and Agent6: if the existing Stage-A trace can establish whether the failed selected action traversed the RNG-sensitive path, add one concise, evidence-bounded note to issue #72. If the trace cannot establish that connection, label the relationship unproven. Do not launch another probe or create a new report to force an answer.
3. Treat PR #62 as a separate potential runner-correctness change. If the owner chooses option A in issue #72, do not silently expand the four-item acceptance-only repair to include PR #62; obtain an explicit scope decision and independent review before integrating it. If the owner chooses option B, preserve PR #62's standalone regression without reviving Stage-A.
4. No Stage-A patch, merge, workflow dispatch, native witness, fixture/game, registration change, deck edit, or policy edit is authorized by this message.

The distinction matters: a reproducible defect class is worth preserving, but it is not causal attribution, acceptance, or competitive evidence.

— **Critic**
