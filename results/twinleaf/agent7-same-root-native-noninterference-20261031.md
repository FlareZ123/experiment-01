# Same-root independent proposer read-only original Store parity: 196 genuine owner roots

**31 October 2026 | Agent 7 | developmental, explicitly unqualified for competitive inference.**

## Question

Can independent owner-root Action proposers all run before the historical first-return action while leaving both physical seats' actual pinned-engine game execution entirely unchanged? The earlier shared collector counted an always-synthesized terminal hold as an independently discovered alternative. The existing canonical development summary also read the new audit at the wrong object path and falsely reported zero audited arms.

## Code, pinned source and exact CI

- All-proposer collector: [same-root selector](../../simulation/twinleaf/agent41-same-root-proposal-choice.cjs), v14 `agent41-same-root-proposal-choice-v14-independent-opportunity-denominator`; committed accounting repair `19916b038217ab91955c987c9e821f23a0d34215`.
- [Seven focused independent-offer regression tests](../../tests/agent7-same-root-independent-opportunity.test.cjs), manual **[successful statistics CI 41158319996](https://github.com/FlareZ123/experiment-01/actions/runs/41158319996)**.
- [Strict native OFF/ON parity comparer](../../scripts/agent7-same-root-native-parity.cjs). It strips the top-level same-root observer switches and the composed actor's expected observer-version string, plus the per-row actor audit envelope. All other row evidence and top-level report content are compared literally, including native real-game decisions and censors. It additionally compares each source/full physical deal fingerprint, actual starter, root-action ledger SHA, native accepted target receipt and accepted energy prompt receipt. Actor audit per-seat and root-level counts are asserted separately.
- [Manual-only original Store parity workflow](../../.github/workflows/agent7-same-root-native-readonly.yml), no on-push trigger. **[Fully passing native run 41158909254](https://github.com/FlareZ123/experiment-01/actions/runs/41158909254)**, head `b3df6f801e07a79e65b4b45dadd2cbb2c0cf54dd`, [full raw OFF/ON/comparison artifacts](https://github.com/FlareZ123/experiment-01/actions/runs/41158909254/artifacts/13026480914).
- Pinned Twinleaf server commit **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**, compiled from the existing `vendor/twinleaf` Git submodule in that workflow.
- Actual source opponent decks: published Aichi ranks **6** and **11**, exactly as recorded by the canonical historical development trial registration. The two separate candidate 60s are `champion-reference` and `new-moon-lockbreaker-v1`. Each source rank uses its existing historical seed and one physical candidate seat; thus the four arms are a retrospective *development* batch, **not prospectively sampled or the complete Top 32**.
- Exactly the same pre-existing shared paper Supporter quota and native mandatory-option wrappers, with accepted physical target sidecars enabled, were used on **both** OFF and ON runs. ON enabled `AGENT41_SAME_ROOT_PROPOSALS_DEV=true` and `AGENT41_SAME_ROOT_ALL_PROBES_DEV=true` with `AGENT41_SAME_ROOT_SELECT_DEV=false`; OFF disabled them.

## Direct native result

| Source / candidate 60 | Owner roots | Roots with independently proposed options | Selector-error roots | Native game disposition |
| --- | ---: | ---: | ---: | --- |
| Rank 6 / champion reference | 9 | 2 | 0 | Engine terminal |
| Rank 6 / New Moon lockbreaker | 56 | 53 | 0 | Engine terminal |
| Rank 11 / champion reference | 68 | 52 | 0 | Censored at 260 actions |
| Rank 11 / New Moon lockbreaker | 63 | 49 | 0 | Censored at 260 actions |
| **All four** | **196** | **156** | **0** | **2 terminal, 2 censored** |

By physical seat, there were **99** owner-root evaluations at seat 0 and **97** at seat 1. **79.59184%** of all owner roots had at least one independently discovered structurally supported option; this is a *proposal exposure* fraction, with unknown native legality and tactical desirability.

The observer recorded **378 proposed independent alternative offers**, counted per kind rather than per distinct root:

| Independently offered kind | Total |
| --- | ---: |
| Special Energy attachment | 104 |
| Basic Energy attachment | 80 |
| Printed positive-damage attack | 73 |
| Natural evolution | 71 |
| Quick Ball | 32 |
| Sky Field | 18 |

These offers can overlap within one root, and several selectors may offer near-identical actions, so 378 should not be interpreted as distinct legal branches or 378 independent trials. All proposal action kinds retain `nativePlayability:'unverified'` in the audit.

**Strict paired equality passed:** `samePhysicalDeals:true`, `identicalRootLedger:true`, `identicalNativeTargetAndPromptEvidence:true`, `gameAndFullNonActorAuditsIdentical:true`. The selected action changed on **zero** roots by design. Every original arm's physical deal digest, actual first player, full root-action ledger, accepted physical targets and accepted Energy-prompt observations, prompt decisions, outcome/censor and all other nonactor fields were identical after removal of the known metadata-only instrumentation fields.

The aggregate counter previously looked up `actorOnlyDecisionCoverage.sameRootProposalChoice` instead of the real `actorOnlyDecisionCoverage.detailedComponentAudits.root.sameRootProposalChoice`. Commit **`73d6a2b4a3d7ad6fe9c7c99978efdc389a7dc3b0`** fixed the canonical source, and the passing second run correctly reports `sameRootProposalAuditedArms:4`. The **first native run 41158616800 failed** its honest counter assertion `0 !== 4`; its preserved [raw artifact](https://github.com/FlareZ123/experiment-01/actions/runs/41158616800/artifacts/13025952758) independently exposed 196 true root audits and the reporting defect. The failure was not hidden or recategorized as successful.

## Evidence gates and next research

**Physical integrity:** The development runner's strict `physicalZoneQualificationSummary` remains `PHYSICAL_INTEGRITY_UNVERIFIED` on all four arms, despite real accepted target sidecars. The unmodified Twinleaf engine and shared partial bot do not yet justify paper-rule parity.

**Action quality:** Each independently offered attachment, attack, Bench slot, search cost and evolution still needs a genuine native Store fork at the same actor-owned root, with action/recipient/prompt settlement, subsequent owner root and actual opponent reply. A structural screen alone does not establish playability or improvement. The source accounts for the one Supporter quota, search connector costs and matchup-dependent DCI, which remain only partially represented by the candidate proposer set.

**Win rate:** `competitiveQualifiedGames=0` and `winRateCertified=false` in the exact passing artifact. The global task remains **29 of 32 original opponent decklists recovered, missing ranks 23/25/28, no proven 99.5% fixed-60 performance**.

A useful next experiment is a *predeclared same-physical-deal owner-root A/B selection* on a naturally exposed action, demonstrating one genuinely Store-accepted changed decision, physical resources, and the opponent's next response. Do not promote proposals or winner fractions before this gate is satisfied.
