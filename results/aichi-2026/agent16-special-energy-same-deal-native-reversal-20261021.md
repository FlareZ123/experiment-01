# Rank-6 source attack changes at the first same-deal Special Energy policy fork

**Agent 16, 21 October 2026. Authenticated native development replay only.**

## Exact experiment and inputs

Using the existing **manual-only** `.github/workflows/agent7-canonical-actor-bilateral.yml`, I dispatched two executions from the **same repository revision** `1263d3053ab77ac8a15242cd9bf2917798494532`. Both used `source_first_retrospective=true`. The sole workflow input difference was `special_energy_root`:

| Treatment | GitHub Actions | Result | Artifact and immutable SHA-256 |
| --- | --- | --- | --- |
| **ON** (`true`) | [39548160559](https://github.com/FlareZ123/experiment-01/actions/runs/39548160559) | **Failed closed** at the historical four-arm audit, 3/4 rows audited | [12322452090](https://github.com/FlareZ123/experiment-01/actions/runs/39548160559/artifacts/12322452090), ZIP `9a2489ccfbcdb2d9e8aa77d137238ab127f080259c57c882166ffa0ce3b8f669` |
| **OFF** (`false`) | [39548263940](https://github.com/FlareZ123/experiment-01/actions/runs/39548263940) | Passed all four historical audits and all four subsequent source-first retrospective audits | [12322637052](https://github.com/FlareZ123/experiment-01/actions/runs/39548263940/artifacts/12322637052), ZIP `65b5822779a642d17e4d03dc8623809e982f5719e196973a106bb49a0c31efcd` |

Both checked out the pinned vendor Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, compiled it under Node 22, and executed the same source-registered rank-6 and rank-11 physical decks and candidate 60s. Every first-episode source deal was independently equal across treatments; rank-6 source-deal SHA-256 `2ce05954cf7a87661c3dc42c242ec6c10f8c9caa9a4a60c0d3580f23613744d1`, rank-11 `9bc69d70743d1c2d0e1406076a817309a0ae1fd73a68da3c27e1e76900d2b5f5`. These are **historical development fixtures**, not random held-out matchups.

## Actual earliest root divergence, and its significance

The native root ledgers matched exactly before the first difference in each rank-6 case:

| Historical rank-6 fixture | First divergent actual Store root | OFF choice | ON choice |
| --- | --- | --- | --- |
| Champion Shadow Rider reference, candidate actual seat A | Ordinal **33**, global turn **4**, source seat B | `PassTurnAction` | **`AttackAction: Volt Cyclone`** |
| New Moon Lockbreaker, candidate actual seat A | Ordinal **37**, global turn **4**, source seat B | `PassTurnAction` | **`AttackAction: Volt Cyclone`** |

Both rank-11 candidate rows were **root-identical**, capped at 260 actions per treatment. In the rank-6 New Moon ON row, the root adapter recorded a genuine accepted source-owner `Volt Cyclone` at turn 4, and native attack-declaration/settlement observers counted **six source attack declarations, six settled public attacks, zero candidate attacks**. The second settled source Volt Cyclone at root 37 left Prize counts **[6,4]**, compared with [6,6] after the earlier turn-2 Volt Cyclone. The OFF row recorded only **one source attack declaration**, four candidate attacks, and 200 root actions. The ON row ended after 75 roots. Their engine winners differed: source seat B with ON, candidate seat A with OFF.

This is a **policy-induced native comparison reversal** for one already chosen deal; it is not evidence of matchup win rate or strength under rational play. The existing rank-6 scripted source ALS had already attached its lone Double Colorless Energy and established Thunder Mountain in the pertinent historical state. The original actor-only root's normal Basic Energy accounting missed the payable Volt Cyclone. Opting into Agent 3's `specialEnergyRoot` gave the same root scorer numerical Double Colorless Energy units and the applicable public Thunder Mountain cost reduction. There was **no accepted `attach-special-energy` actor-root intent in the rank-6 New Moon ON row**; therefore the result establishes *attack recognition*, not a new autonomous two/three-turn Speed/Capture/Spiky attachment sequence.

## Native sudden-death game reset was preserved as a failure, correctly

In the champion ON row, accepted source `Volt Cyclone` at ordinal 33 instead of an OFF Pass was followed by a native sudden-death restart at **ordinal 38**: `ResolvePromptAction / WaitPrompt` changed global turn **4→0**, phase **3→1**. The native audit found one restart and two authentic physical episode openings with six Prizes each, distinct first-episode and second-episode deal fingerprints. Its marker says `nativeMarkersAuthentic=true`, `crossEpochBilateralPacketAllowed=false`, `paperTiebreakAndClockAuthenticated=false`. The shared `buildBilateralReplyPacket` chronological assertion properly refused to concatenate turn 4 and turn 0 as one continuous turn stream; the archive records a specific engine-error row with all 121 Store roots and the episode partition rather than treating it as a completed game.

This failure is **not** a claim that the Special Energy attack itself was illegal. It is an evidence-processing and paper-tiebreak qualification boundary. The OFF counterpart ended at 35 roots without a native restart. The workflow's historical four-arm fail-closed assertion `actorOnlyCellsWithAudits===4` consequently stopped the ON job **before its requested source-first retrospective panel**. No ON source-first DCE-Prized claims may be inferred from this run.

## Interpretation and next falsification

1. The opt-in root cost model closes a concrete **source policy** omission at an already powered Iron Thorns source turn. The same exact first-episode shuffle and identical earlier actions isolate the decision fork. This does not generalize the source bot's competence or qualify the changed outcome.
2. **The originally desired DCE-Prized multi-turn fallback is still unproven.** An appropriate next native trial must show actor-owner legal attachment of Speed Lightning plus Capture/Spiky across turns with an authentic hand/deck search and genuine Store acceptance, followed by a settled Volt Cyclone. Never swap in an accessible-DCE retrospectively selected deal.
3. Epoch-aware bilateral packets must carry per-episode source deal and separate turn/action indexes; cross-episode source/candidate continuation is vetoed until paper tiebreak rules are validated. A tiebreak should remain archived as a censored outcome even when it occurs in a different treatment.
4. Before promoting a comparison, independently attest legal and observation-safe decisions by **both** players, contemporaneous source pressure, intervening responses, full clock and rule fidelity, plus a registered prospective denominator. This experiment has **zero competitively qualified games**.

The project still has **29/32** exact published opponent 60s, missing ranks 23, 25 and 28, and no demonstrated fixed 60 achieving the target 99.5% win rate.

## Reusable, source-safe paired-archive verifier

To avoid treating matching action names as full state equality, [the reusable CommonJS first-root comparator](../../scripts/aichi-actual-root-policy-diff.cjs) enforces exact **complete physical first-episode deal fingerprints** for both seats, fixed trial IDs and pinned engine identity; it then finds the first differing public typed Store-root tuple and records every error/tiebreak row. [Six standalone pure regression tests](../../tests/aichi-actual-root-policy-diff.test.cjs) passed locally under Node 22.16.0, including a negative forged physical-deal pair, a native clock reset and equal public actions with unequal full ledgers. These are **pure deterministic tests**, not an integrated compiled CI game certification.

The complete first-episode physical deal fingerprints independently matched for all four candidate/opponent pairs: rank-6 champion `d185579d23f5678f3c7e7bd703878dd25a18717e1b5c66b9197927f69431078e`, rank-6 New Moon `0f0d8f7e4f24222481e26890a2a534109846bd0903cdf8b449c03d1cdb24b847`, rank-11 champion `5305f9ec73dfa86f0928fce32a7d73629ff37437b126cb7b9a568abd821bc6f6`, rank-11 New Moon `a283e4d52a534f405c6ab05303024d1631005bcd45b23b99fffc85158c91c74f`. Both native root ledgers and full-archive SHA hashes were identical for each rank-11 row; rank-6 original-versus-opt-in first differences remain exactly ordinals 33 and 37. Equality of displayed public root tuples, even with a common physical shuffle, **does not** independently certify identical hidden choices, prompt resolutions or all intermediate state.

**Reproduction:** download the two linked artifacts, extract their `agent7-canonical-actor-fourarm.json` files, verify the ZIP SHA-256 values above, and compare `rows[i].rootActionLedger` fields `action`, `playerSlot`, `turnBefore`, `turnAfter`, `card`, and `attack`. The failed ON row retains `sourceDealEpochs`, `suddenDeathClockResets`, `nativeEpochStructuralPartition`, `nativeEpochBoundaryEvidence` and `rootActionLedger` despite the missing normal `actorOnlyDecisionCoverage`.
