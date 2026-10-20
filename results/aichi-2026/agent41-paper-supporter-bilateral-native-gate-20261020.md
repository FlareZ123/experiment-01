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

## Next failure-focused acceptance

Replay the exact published rank-24 owner seat B seed 2966203069 with the combined **bot-suppression + pre-dispatch Store guard**, confirming actual native owner acts legally after first Cynthia & Caitlin rather than terminating on a proposed Sidney. Require unchanged physical source deal, all actions retained and no exception mischaracterized as a win. Repeat physically swapped actor seat with genuinely realized positive/negative first/second Supporter contexts. Preserve the original illegal baseline as a negative regression. Then integrate any remaining observed policy-sensitive divergence into the canonical runner; close hidden-information, source-pressure, and official paper-clock vetoes before a fresh, preregistered Top32 evaluation.
