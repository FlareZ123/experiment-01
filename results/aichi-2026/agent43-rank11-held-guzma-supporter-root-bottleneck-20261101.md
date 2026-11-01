# Root Supporter opportunity bottleneck behind zero Guzma exposure

**Agent 43 | 1 November 2026 | matched native forensic replay, 16 already-used arms**

## Critical observation

The original-source rank-11 prospective 32-arm Guzma comparison produced **zero accepted Guzma roots**, so its opponent-gust improvement had no opportunity to activate. I then ran the already implemented **read-only** `agent2-native-owner-supporter-opportunity.cjs` observer on **the same 16 existing baseline arms**, expressly as *retrospective forensic analysis*. Every first native own turn and every native accepted Pass recorded the acting player's privately held Supporters, native `canPlay(null)` result and actual Supporter quota.

The observation reveals a **substantial upstream Supporter-root coverage gap**. Both players' bots executed **zero accepted Supporter root actions of any printing** in these 16 arms, while held Guzma appeared repeatedly in genuine owner-turn hands.

| Retrospective actual owner-turn receipts | Original rank-11 source seat | Candidate seat | Combined |
| --- | ---: | ---: | ---: |
| First owner roots observed, one per physical player-turn | 359 | 362 | 721 |
| First owner roots with held printed Guzma | **236** | **86** | **322** |
| Accepted Pass roots observed | 161 | 255 | 416 |
| Passes where the owner held Guzma | **116** | **30** | **146** |
| Accepted native Supporter roots, all printings | 0 | 0 | **0** |

For all 322 observed first-root held-Guzma records, `supporterTurn===0`, the coarse player Supporter-lock flag was false and a native `Guzma.canPlay(null)` probe reported true. The same three bounded indicators held for all 146 Pass-with-Guzma records. **These checks do not certify full target legality or tactical merit.** Guzma requires an appropriate opposing Bench recipient and own switch, and `canPlay(null)` may be permissive for target-dependent card text. This observer did not certify both Bench geometries, opponent future response or the optimal Supporter competing line.

**These are repeated within-game owner-turn observations across 16 arms sharing eight source seed groups, not 322 independent games or independent drawn hands.** Large counts can arise from bots passing and retaining the same Supporter through many turns. The 260-root cap censored six of the underlying 16 matches.

## Integrity and provenance

- [Original eight-seed immutable registration](registrations/agent43-rank11-fresh-guzma-gust-20261101.json) and [16-pair prospective result](agent43-rank11-fresh-guzma-nominal-gust-null-exposure-20261101.md). Both are the same exact preexisting seed IDs; **there was no new fresh random tranche for this forensic replay**.
- Replay was run through the original `actorOnlyComposition`, rank-11 source and candidate 60s, `AGENT2_HELD_GUZMA_MOBILITY_DEV=true`, pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, and the same configured root policies. The sole additional switch was the already tested `nativeOwnerSupporterOpportunity:true` observer, which does not feed collected private cards to opponent decisions.
- [Forensic 16-arm CI run 41346675143](https://github.com/FlareZ123/experiment-01/actions/runs/41346675143) passed pinned compilation, immutable registration preflight, and a strict digest assertion. The [full forensic audit artifact 13099537128](https://github.com/FlareZ123/experiment-01/actions/runs/41346675143/artifacts/13099537128) includes actual owner-hand receipts and entire native rows (stored as postgame research diagnostics). Do not expose these private owner snapshots to the opposite player's game policy.
- All **16** source/full initial physical deals, starting seats, terminal statuses, native action-ledger hashes and terminal winners replayed unchanged. The exact vector digest of the original baseline and forensic observed runs was **`4c2981a904eb939ba32301038514ef269d7c8a07d883b5c90bae903dfbc82216`** on both. The extra observer did not alter accepted native play in this sample. Zero observer sample truncations.
- [Reproducible observer runner](../../simulation/evaluation/agent43-guzma-held-root-retrospective.cjs), [manual pinned workflow](../../.github/workflows/agent43-guzma-held-root-retrospective.yml), and [original raw 32-arm source artifact](https://github.com/FlareZ123/experiment-01/actions/runs/41345527378/artifacts/13099267292).

## Implications for the collective objective

The shared bot behavior has an observed **Supporter-use blind spot** in this matchup. The tactical Guzma selector cannot affect native games until there are accepted matching Guzma roots. Expanding the downstream target heuristic or running more of the same symmetric candidate seeds without resolving this upstream bottleneck has low expected information value.

Useful next test: instrument and cross-tabulate **both native recipient Bench geometries**, hand-held Guzma, own Bench attack funding, the current Active attack/funding, the Supporter resource, and competing root actions in the actual actor-only root view. Distinguish geometry-illegal hands from the conservative current `chooseHeldGuzmaMobility` refusal and genuinely dominated Supporter plays. Then develop and test a source-agnostic **legal, payoff-backed Guzma root** path with native two-prompt physical receipts. The current emergency-mobility selector declines when the Active already has a funded damaging attack and demands a strictly closer Bench Energy path; that is a deliberately narrow trigger, with no general gust-for-KO policy. This proposed direction is a hypothesis for root-policy experiments, not an assertion that indiscriminate Guzma play improves wins.

The data supports prioritizing **Supporter root competence** before claims of full-match deck optimization. A held `canPlay(null)` is a bounded native affordance signal; absolute competent-paper win rates remain unverified.

**Qualified competitive games: 0. Known original source 60s: 29/32. The 99.5% fixed-deck target remains undemonstrated.**

## One particularly actionable first-turn exception: held Carmine, then Pass

The same read-only retrospective archive contains a sharply identifiable **target-free Supporter** case, outside the ambiguity of whether `Guzma` had two legal Bench recipients. Frozen registered trial `11:0:A:champion-reference`, source seed `996430014`, has candidate physically seated **0**, taking **global turn 1**. The first genuine owner-root record had `Carmine TWM` physically in the owner's hand, Supporter quota `0`, lock flag `false`, **46 deck cards**, and native `canPlay(null)===true`. The bot then made one accepted `PlayCardAction` for another card and subsequently accepted `PassTurnAction` at global turn 1 with `Carmine TWM` **still held**, quota still `0`, native target-free `canPlay(null)` still `true` (first-root dispatch ordinal 10, Pass dispatch ordinal 11). There were **zero** accepted Supporter root actions in that trial.

This example is more discriminating than the Guzma counts because the pinned source `ptcg-server/src/sets/10-scarlet-and-violet/set-twilight-masquerade/carmine.ts` explicitly marks `public firstTurn=true` and states that the card **may be used going first on that first turn**, then discards the remainder of the hand and draws 5. Its `canPlay` requires only unused Supporter quota and a nonempty deck, both established in the observed root. There is no opposing Bench-gust or target-prompt precondition. The exact original first-turn owner **passed while holding a native-available, first-turn-exception Supporter**, an identified *missed action opportunity* under the engine. Whether playing Carmine would improve that game's outcome remains untested because discarding other held resources is strategically costly. This makes it a clean target-free native decision-policy regression candidate and a direct practical test of state-dependent discardability / Supporter contention.

The rest of the held-Guzma table retains its `canPlay(null)` and Bench-geometry caveats. This Carmine witness is selected after inspecting retrospective data, so must be labeled a **postobserved diagnostic**, never an independent prospective hit rate or proof of card value.
