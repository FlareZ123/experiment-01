# Native paper Supporter quota: canonical bilateral integration and four-arm compiled contrast

**Agent 41 | 20 October 2026 | evidence class: genuine pinned Twinleaf Store development replay + unit regression.** This documents an integrated **mechanical paper-rules stop gate**. It does not establish a competitive game, deck ranking, matchup win rate, or the 99.5% target.

## The falsifiable defect

The paper Advanced Player's Rulebook v3.4 section B-03 normally permits one Supporter card during a player's turn. Agent 34 independently demonstrated that pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` resolves a second ordinary Supporter on the same owner's real turn, with card leaving hand, printed native log and `supporterTurn` counter advancing to two. Its selected authentic rank-24 source seed **2966203069** at owner seat B gives two distinct repeat events at global turns 2 and 14; see [native proof](../twinleaf/agent34-native-settled-multiple-supporters.md) and [compiled CI 39401726848](https://github.com/FlareZ123/experiment-01/actions/runs/39401726848). This selected witness cannot estimate prevalence among games.

Two independent boundaries require correction. Upstream `PlaySupporterTactic` treats `supporterTurn` as a global-turn timestamp rather than the count tracked by the reducer; the native `PlayCardAction` reducer accepts an ordinary Supporter once the play zone has been cleared even if quota is already consumed.

## Integrated, reversible research-owned gate

- [Both-seat tactic plus Store boundary](../../simulation/twinleaf/agent41-paper-supporter-discipline.cjs): `withNativePaperSupporterDiscipline` uses exact actor `supporterTurn` to suppress further ordinary bot proposals, then encloses gameplay in Agent 34's physical `withPaperSupporterQuotaGuard` and `withNativeSupporterTurnAudit`. The latter independently requires actual owner hand departure, quota advancement, and matching printed log. Rejected pre-dispatch actions are retained as errors; neither a silent favorable replacement action nor a winning outcome is constructed. Hook restoration uses `finally`, leaving the vendor submodule unchanged.
- [Canonical single comparison runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs): opt in with `AGENT41_PAPER_SUPPORTER_DEV=true`; `AGENT41_PAPER_SUPPORTER_TRACE_DEV=true` separately records bounded actual-root sequence for paired development comparison. Each row records `nativeSupporterQuotaQualified` (otherwise `unverified`) and a versioned native audit. The overall result fails closed if any guarded arm is unqualified. Frozen source and candidate 60s, historical physical seat, seeds, and default-off runner behavior are unchanged.
- [First-native-divergence comparator](../../scripts/agent41-paper-supporter-paired-replay.cjs): requires all four exact registered pairs and preserves every error and censored arm. Both policy versions are recorded; any actual root mismatch is shown at its first action ordinal. The comparator hard-codes zero competitive-qualified games.
- [Regression tests](../../tests/agent41-paper-supporter-discipline.test.cjs), [paired evaluator tests](../../tests/agent41-paper-supporter-paired-replay.test.cjs), and existing [pre-dispatch guard tests](../../tests/paper-supporter-quota-guard.test.cjs)/[postcondition tests](../../tests/native-supporter-turn-audit.test.cjs). Includes both physical actor seats, legal first play, next-turn reset, owner proposal suppression, direct bypass rejected before hand/log/quota change, hook restoration, explicit exception seam, and root identity preservation.
- Uses the existing manually dispatched [New Moon Compressor source partitions workflow](../../.github/workflows/newmoon-compressor-source-partitions.yml) with opt-in `agent41_paper_supporter_development`. No commit-triggered workflow or new campaign added.

## Verified compiled replay

[Successful pinned compiled Actions run **39405536198**](https://github.com/FlareZ123/experiment-01/actions/runs/39405536198) at research commit **`755f5d1d8569165d4c2226b8c99628af254a4a51`**, using the pinned Twinleaf revision stated above. All **31/31 Node tests** passed. Both baseline and guarded variants of the **same four retrospective canonical rank-6/rank-11 arms** completed; compared summary and all attempted root traces are in [artifact 12257680717](https://github.com/FlareZ123/experiment-01/actions/runs/39405536198/artifacts/12257680717), archive ZIP SHA-256 **`5d9f8c9e73a45a6a8185ae94b849b1d7daafd6080798002349fbb6e4fd0e7f77`**.

| Historical frozen arm | Baseline and guarded actual-root SHA-256 | First root divergence | Actual source physical deal identical? | Guarded quota audit | Guard bypasses |
| --- | --- | --- | --- | --- | --- |
| `6:0:A:champion-reference` | `df894ca4304355b937b515cc559dbacbf6c803a2c0b0fc23f47260889f900dbe` | none | yes | true | 0 |
| `6:0:A:new-moon-lockbreaker-v1` | `87ef423a77ec6aafd6063fd3ad054ce3f9d29806a52ab04f21c1c6bb0e1495e4` | none | yes | true | 0 |
| `11:2:B:champion-reference` | `dd2bfba15a260541405501c6f09b03e17d9140c908a8243132e5122e294c97b8` | none | yes | true | 0 |
| `11:2:B:new-moon-lockbreaker-v1` | `646c06f1d8a52f426689b877c1cc84f530ef22c36f0fd55ac34573ef6d8d4979` | none | yes | true | 0 |

**Interpretation:** the added both-seat policy plus native veto did not perturb these *particular* four original source-dealt histories. All selected guarded games satisfied the narrow Supporter root-audit postconditions, and there were no attempted illegal Store roots in these four selected histories. Thus this is a verified negative regression for noninterference, not a field-wide legality guarantee. The four arms do **not** recreate Agent 34's known rank-24 second-Supporter violation, so the bot-suppression branch's genuine pinned native rank-24 interaction remains a separate necessary acceptance test. The earlier rank-6 New Moon 260-action zero-attack censor is retained, not reclassified as competitive evidence. All four are retrospective and contain additional gameplay-policy and printed-mechanics defects beyond the Supporter quota.

**Qualified competitive games: 0.** Exact source lists: 29/32 (missing ranks 23, 25, 28). A fixed 60-card deck demonstrating the 99.5% target has not been identified.

## Independent rank-24 proposal suppression already compiled by Agent 8

After this canonical comparison, I inspected the existing [Agent 8 native proposal regression](../../simulation/twinleaf/rank24-paper-supporter-proposal-native.cjs) and its [reusable owner-visible Supporter tactic wrapper](../../simulation/twinleaf/supporter-proposal-paper-quota.cjs). These already exercise the exact frozen source seed **2966203069**, owner seat B, rank 24, with the original real game plus a pre-dispatch Store guard and filtered bot proposals. The native script requires `paperSafe===true`, `suppressionCount>=1`, identical deck hashes and actual first-player seat; it was executed in **successful** [compiled CI 39404261203](https://github.com/FlareZ123/experiment-01/actions/runs/39404261203) (20 October ~09:58 UTC), artifact [12256259059](https://github.com/FlareZ123/experiment-01/actions/runs/39404261203/artifacts/12256259059), archived ZIP SHA-256 `8a683f88fcc3103cc472415c862765b4c9bb861cd4414380d3a6e54183b24d8a`. This confirms a separate research-owned proposal wrapper can avoid submitting a forbidden Supporter through the actual pinned rank-24 Store fixture and can continue its bounded game without the selected veto. It does **not** establish the identity of every subsequent decision, other-actor seat parity, or whole-game competitive qualification. The no-action-divergence four-arm Agent41 result remains a distinct narrow gate.


## Consolidated adapter v2 directly reproduces rank-24 failure recovery

The initial versioned Agent41 integration had independently coded a narrow proposal filter. I then replaced that duplicate tactic implementation with the already verified Agent8 [owner-visible proposal filter](../../simulation/twinleaf/supporter-proposal-paper-quota.cjs), preserving the Agent34 real-Store guard and printed-log audit. The integrated wrapper is now `agent41-bilateral-native-paper-supporter-discipline-v2-shared-owner-tactic` ([source](../../simulation/twinleaf/agent41-paper-supporter-discipline.cjs)); the canonical runner's policy string resolves that implementation's exported version rather than hard-coding a stale suffix. **The four historical root hashes above were measured under the original v1 adapter, and must not be misrepresented as a new four-arm v2 replay.**

A direct v2 [rank24 native acceptance script](../../simulation/twinleaf/agent41-rank24-paper-supporter-canonical-native.cjs) now uses the same exact source 60, source seat B, source seed **2966203069**, original first-turn `k1ReplanAfterTagCall` strategy, and bounded 105-action native Store match. It runs alongside the independent Agent8/34 regressions in the existing manual [rank24 policy workflow](../../.github/workflows/aichi-rank24-prospective-policy.yml). [**Compiled CI 39407326297 succeeded**](https://github.com/FlareZ123/experiment-01/actions/runs/39407326297), pinned Twinleaf `a9905a76`, head `ead81247`. [Artifact 12256739148](https://github.com/FlareZ123/experiment-01/actions/runs/39407326297/artifacts/12256739148) contains all three original/replayed native reports, ZIP SHA-256 `15f4d3d31f537980a0835541abbea5d9cfc570a59343e3a6b78b640a492d802a`.

Actual printed Store facts from the run log:

- First source Supporter **Cynthia & Caitlin CEC**, source seat B, global turn **2**, settled.
- Owner-visible Supporter proposals suppressed by the reused filter: **7**.
- Rejected direct-root Supporter dispatches: **0**.
- Both-seat quota audit: **true** (narrow native Supporter mechanics only).
- The bounded game continued for **105** actual root actions beyond the original root-24 violation position; original source initial physical-deal digest was `90500a63f484f538a2f34d236493038a54d04aa014d741497666c0399d93fc54`.
- **Competitive-qualified games: 0.** Engine action cap means no recorded official paper-game victory.

This closes the **selected rank-24 native proposal-continuation acceptance** of the unified v2 adapter. Actual opposite physical actor/first-player and entire multi-archetype paper-fidelity remain to be tested. These are source-selected regressions, not estimated odds of paper legality or performance.

## Real source reversed into physical seat A: all three frozen rank-24 opening seeds

[The source-A compiled pinned CI **39408693904** succeeded](https://github.com/FlareZ123/experiment-01/actions/runs/39408693904), head `fba9443e`, using [opposite-seat native script](../../simulation/twinleaf/agent41-rank24-paper-supporter-opposite-seat-native.cjs) through the same manual workflow. The source is the **exact rank-24 published 60** at physical seat A, the candidate reference rank-1 60 at physical seat B; `withBroadThornsSourceAttack` uses its original *first-eligible* turn condition. This changes source deal and is **not** a pairable off/on treatment of the earlier source-B seed despite reuse of seed integers. All **three** prior rank24 source-opening seeds were retained without selecting favorable outcomes.

| Predeclared seed | Actual source starts first? | Physical source Supporters settled during 105 roots | Source-owner proposal suppressions observed | Full narrow native quota audit | Illegal Store roots |
|---|---|---:|---:|---|---:|
| `2966203069` | yes | 2 | 1 | true | 0 |
| `1150814608` | yes | 4 | 4 | true | 0 |
| `2804067880` | yes | 5 | 3 | true | 0 |

All attempts ran **105 actual native root actions** and passed verified-first-draw and whole-game both-actor Supporter postconditions. No game was treated as a competitive win. The original selected source-B seed puts the source second, so across the **different** authentic source-dealt specimens we have one real source-B-second and three real source-A-first bounded mechanical checks. This covers native actor seat routing with positive legal Supporter settlement and suppression, but does not furnish within-deal matched actual-first/second counterfactuals or uniform two-seat statistical evidence.

[Archived complete four-report bundle **12257839309**](https://github.com/FlareZ123/experiment-01/actions/runs/39408693904/artifacts/12257839309), ZIP SHA-256 `04b31da732b1aa2c514d034c8fafa6f99da5bfa21272e3dbaac2ecb9cb7b4fe7`. The combined Store guard + shared tactic filter is now *mechanically exercised* in both real physical seats, with native actual global-turn Supporter use and no illegal dispatch in these four selected rank24 specimens. Stage-wide complete game rule equivalence, adequate opponent competence, actor information-set fidelity and tournament-clock legality remain unproven; **qualified competitive games: 0**.

## Next failure-focused acceptance

Reuse Agent 8's already compiled proposal wrapper rather than replicate its rank-24 evidence. Move toward one shared native/audited integration boundary, and use an authentic native rank-24 actor-swapped fork with actual second-Supporter opportunity as a falsification test. The aggregate historical runner has no qualifying competitive games because hidden-information exposure, source-first lock/responses, official paper clock, and other rules defects are unresolved. Any future fresh evaluation must preserve all published field opponents, printed cards, both actual starting seats, and predeclared policy versions.
