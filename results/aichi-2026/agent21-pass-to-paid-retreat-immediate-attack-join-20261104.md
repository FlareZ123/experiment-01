# Agent 21: exact bot Pass to paid Mew retreat to settled attack and Prize

**4 November 2026. Retrospective archive analysis, development evidence only.** This report joins three previously separate receipt layers in one *already executed* native experiment: (1) the actor's originally tagged Pass root, (2) an actual native Store RetreatAction with an exact physical Double Colorless Energy payment, and (3) the immediate settled source attack, Prize changes and first opponent reply. It does not introduce a new policy, a new run, or a candidate win-rate estimate.

## Frozen provenance

- Historical rank-5 source registration, 8 existing trials, original registration Git blob `268023063cfcd1af2312b892e7a1eefd04e28c49`; historical selected-profile blob `841b1bc65584c0cf2643c679e5ceffa204263a25`.
- **Changed-code v2 diagnostic** GitHub Actions run [41609500893](https://github.com/FlareZ123/experiment-01/actions/runs/41609500893), checkout `6280a6de10e1a1a43e23ba6533d57bb68064851e`, artifact [13218322355](https://github.com/FlareZ123/experiment-01/actions/runs/41609500893/artifacts/13218322355).
- Artifact ZIP SHA-256 `3f607082c1c6a447521d439b76d1f96ba11b8b7c77a962f459ac2ccf20f6df6c`; inner `agent21-stranded-mew-historical-native-replay.json` SHA-256 `7c8979d9560aa13f0056a701a1d997d503c8a2bf7a6495d5c9074847237cb6cb`.
- Pinned vendor revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Executed research component `simulation/twinleaf/agent21-root-anchored-fusion-retreat-v2.cjs` via `simulation/evaluation/agent21-root-anchored-mew-historical-diagnostic.cjs`. Changed-code status is explicit in the archive. This is **not** the original frozen selected release.
- Independent archival checks: `botPassToStoreRetreatJoin.joins`, `hookAudit.records`, `rawNativeRows[].rootActionLedger`, `rawNativeRows[].sourceAttackSettlement.attacks`, and `rawNativeRows[].candidateRepliesAfterSourceAttacks`. Pair each record using actual game ordinal, actor seat, original root ordinal, turn and attack ordinal. The source's Prize reduction is calculated from the same seat's `prizesBefore` and `prizesAfter`.

## Verified exact chain

The hook observed **208 genuine anchored Pass roots** across 8 historical native trials. In three roots it substituted a real RetreatAction, and the original Store accepted all three. Exact card-object identity receipts establish that the prior Active moved to the Bench, an independently energized Mew VMAX became Active, the original DCE card left the former Active and entered discard, and the once-per-turn retreat quota was consumed.

| Historical source-rank-5 trial | Actual source seat and turn | Original bot Pass root -> next attack root | Physical source deal prefix | Source Prizes gained during that attack | Immediate opponent turn |
| --- | --- | --- | --- | ---: | --- |
| `5:1:A:new-moon-lockbreaker-v1` | seat 1, turn 21 | 96 -> 97 | `ab12d66bd7b1` | 1 | Pass |
| `5:1:B:champion-reference` | seat 0, turn 64 | 236 -> 237 | `2d69c60f712d` | 1 | Bench Dialga-GX, Pass |
| `5:1:B:new-moon-lockbreaker-v1` | seat 0, turn 64 | 222 -> 223 | `2d69c60f712d` | 2 | Bench Gengar & Mimikyu-GX, Pass |

The three immediate attacks are real `AttackAction` **Cross Fusion Strike** declarations at the exact next native root ordinal after the original bot Pass, with settled prompt chains before the next player turn and source-side Prize changes of **1, 1 and 2** respectively. The before-attack public board shows Mew VMAX Active with its own DCE and a separate Genesect V Bench donor. Its previously stranded Active is on the Bench without its original DCE. These effects occurred in the already modified replay. No assertion is made here about which copied attack the game chose without a separately checked attack-choice receipt.

The three source attacks all have `nextSourceSameEpochProven: true` in their settlement records, and the opponent-return observer separately recorded a same-epoch immediate reply in each trial. None of those first opponent turns contained an attack. The last two entries share **one exact source physical deal** despite different candidate matchups. The three events span **two distinct source physical-deal fingerprints** and must not be represented as three independent randomized matchup samples.

## Interpretation and limits

This is a positive **one-decision native resource-to-attack-and-Prize witness**. It falsifies a broad assertion that rank-5's stranded DCE Mew states never occur or that the real Store cannot accept a paid retreat and immediate attack from those states. It does not establish that the retreat is optimal against the best alternative, or that the opposing bot's Pass is competent play.

The archive itself reports `newPolicyReleaseSelected:false`, `officialPaperClockVerified:false`, `paperEffectVerified:false`, and `competitivelyQualifiedGames:0`. The hook reports `verifiedSelectedRootLedgerJoin:false`; a separate retrospective reconciliation reports 3/3 exact bot-Pass-to-Store-Retreat aliases. This proves the *archival join* only. The change was on known historical seed groups, with a source-deal mismatch between candidates in another group. Preserve the prior frozen studies and all failed/capped rows; do not use these three attacks as a win-rate numerator.

## Shared bilateral integration handoff

For [Issue #25](https://github.com/FlareZ123/experiment-01/issues/25), reuse these three original actor-root ordinals as a **small positive resource-chain regression** alongside the existing native negative controls. The release steward must select the component on both real seats, attest actual running feature and code hashes, recheck owner-information isolation, independently validate paper payment, and compare the full decision's competing legal roots. Keep opponent continuation and the official paper clock in the qualification gate. Existing retrospective receipts cannot substitute for a new preregistered, truly selected common-policy run.
