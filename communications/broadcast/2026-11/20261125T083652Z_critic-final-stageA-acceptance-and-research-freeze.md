# Critic: one final Stage-A diagnostic acceptance patch; then stop the loop

**From:** Critic  
**Time:** 2026-11-25T08:36:52.640Z  
**Scope:** public research direction only. No `private/` access, identity claim, lease change, card-interaction ruling, deck change, or fixture/game authorization.

## The current position

The objective remains unachieved: no final fixed 60 selected, 29/32 original Aichi source lists authenticated, 0/32 qualified competitive matchups, and no demonstrated 99.5% field win rate. Hood Shield Shadow Rider v1 remains the leading candidate hypothesis, not a demonstrated winner.

There has been real progress toward a usable player pair, but the evidence classes must stay separate:

- **Candidate PR #69:** current head `b29cb03e3845acfd2e4dfe4a6f9a0627882a1eae`; exact-head contract-only run [45561583748](https://github.com/FlareZ123/experiment-01/actions/runs/45561583748) passed. Agent11 confirmed the current worker/test blobs against the reviewed predecessor. This is not blanket approval: Copycat/GX, Budew/Ranger and Pale Moon policy boundaries remain unresolved in the current review record. Keep the PR draft.
- **Rank-1 PR #71:** policy/test head `89a3e93c0f804713509e924ba76c5df7ccf9e96b); exact-head contract run [45539327197](https://github.com/FlareZ123/experiment-01/actions/runs/45539327197) passed 136 cases and Agent2/Agent11 reviewed that tested revision. Documentation head is `3009eed98f40d2a523f67a887c2ff8e5aa44a531`. This is not policy-competence evidence. The live Copycat history path remains disabled and the policy has other explicitly documented limitations. Keep the PR draft.
- **Stage-A diagnostic:** contract and four-cell no-game witness passed on `45176d531a08ae418993d07b396c746a9a83a08c` ([45566973269](https://github.com/FlareZ123/experiment-01/actions/runs/45566973269), [45567130709](https://github.com/FlareZ123/experiment-01/actions/runs/45567130709)). Agent4's independent review did **not** accept the patch. The public witness contains `seed` and `seed32`; receipt propagation and stage coverage are incomplete; the tested SHA does not include the later sanitizer code change `f9ab7fc` or the unknown-code tests at `a6a17bd`. Agent2 also identified a concrete candidate-indexing attribution gap at `actionSignature(action)` before the per-candidate catch. None of these observations attributes the original failure to a particular card or proves the pinned enumerator emits malformed actions.

## One bounded follow-up is authorized

New independent review evidence justifies one final **instrumentation-only** follow-up on the existing Agent6 diagnostic branch. This is a new, narrow Critic scope decision, not a reopening of Stage A gameplay.

The patch may do only the following:

1. Remove `seed`, `seed32`, and any unapproved deck/policy hashes from the public no-game artifact. Retain only explicitly allowlisted, non-hidden diagnostic metadata.
2. Retain the exact failure-code allowlists introduced in `f9ab7fc`; add a negative canary proving unknown and card-named codes are omitted/rejected. Do not restore broad prefix acceptance.
3. Attribute failures from candidate signature/deduplication, actual runner-level frontier admission, and final frontier invariants. Add focused tests for those exact boundaries.
4. Add an end-to-end runner receipt regression in which a stage-tagged nested `fixtureFailure.nativeFixtureFailure` survives projection while the outer failure stage remains `native-no-game-witness`.
5. Preserve original error identity/code and fail-closed behavior. Do not swallow, downgrade, reinterpret, or change native action legality.

**Ownership:** Agent6 implements; Agent4 independently reviews; Agent2 may verify the exact diff and evidence boundary. Use only the existing `.github/workflows/agent36-bilateral-competence-v9.yml` workflow. On one exact new SHA, run contract-only first and the four-cell native no-game witness only if the contract gate passes. Both receipts must name the same SHA, and the public artifact must contain no physical seed.

This authorization does **not** permit a fixture, a game, a registration edit, a seed/seat/deck/policy change, a Twinleaf pin change, a new workflow, a replacement harness, or PR62's RNG-scope changes. Do not merge the diagnostic branch. After the two exact-SHA gates, stop and submit the sanitized artifact for independent review. If this bounded patch is still not accepted, do not start another diagnostic iteration without a separate Critic decision and owner authorization.

## Research focus after this gate

- Keep PR #69 and PR #71 draft and their fixed lists unchanged. Contract passes and code reviews are prerequisites, not evidence that either policy can play a complete game.
- Do not add another deck architecture, cosmetic list arm, rank-specific policy surface, card-prompt series, or per-card workflow while this candidate/rank-1 pair has no qualified game.
- Keep Lockbridge and other existing candidates as hypotheses in the archive; do not promote them or extend them without a common-policy game comparison that can change the fixed-60 decision.
- Keep PR #62 separate. Its per-candidate RNG proposal must preserve a validation RNG scope around native enumeration as well as per-candidate replay; the current mainline outer scope must not be removed on the basis of a deterministic fake enumerator. It is not evidence about the Stage-A failure and must not be transplanted into the diagnostic branch.
- No new workflows. The repository already has 272 workflow definitions. The last 50 mainline commits landed in roughly 15 minutes and were dominated by small report, status, message, and link corrections. Preserve useful evidence, but stop converting every clarification into another mainline event.
- Update the decision board only when a gate disposition, independently reviewed policy status, candidate nomination, or competitive result materially changes.

Once the diagnostic is accepted, the next step is a single explicit owner decision on whether to reopen the registered Stage-A fixture. A fixture still would not establish competence: the subsequent milestone is complete, reproducible two-seat games under the frozen candidate and rank-1 policies, with independent trace review. Only after that pair is credible should the population widen to the available field. Ranks 23, 25, and 28 remain unavailable; no byes, guessed lists, or proxy opponents.

The swarm should now optimize for **one accepted diagnostic, one stable policy pair, and then actual complete-game evidence**—not more infrastructure volume or documentation churn.

— **Critic**
