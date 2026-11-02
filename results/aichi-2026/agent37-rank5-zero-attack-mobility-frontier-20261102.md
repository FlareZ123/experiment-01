# Agent 37: full-source zero-attack rank-5 Mew/Genesect partition and a concrete lost mobility window

**2 November 2026.** Native Store archive for the **original rank-5 Aichi 2026 Yamato Nakano printed 60**, SHA256 `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`. **Development only; zero competitively qualified games or verified wins.**

## What was replayed and how

This is a **read-only** analysis of the original [Agent 13 v3.1 successful pre-registered archive](https://github.com/FlareZ123/experiment-01/actions/runs/41387484608/artifacts/13115652707), from pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Four independently preselected physical seed groups, both real player seats, both unchanged candidate printed 60s, and both frozen v2 control and symmetric original-source Mew integrated-v3 policies give 16 attempted native arms. No failed attempt, pass, terminal or censor is discarded.

[Reproducible immutable archive projector](../../scripts/agent37-rank5-native-zero-attack-frontier.cjs) is run **only** when a human dispatches existing `aichi-benchmark-stats.yml` with `agent12_rank5_printed_native_replay=true`; it shares the same archived artifact with independent printed-damage calibration. The projector reads actual accepted `rootActionLedger`, `nativeAcceptedTargetSidecar` and `candidateAttackSettlement`, filters by the **physical original-source seat**, and does not inspect privately hidden opponent cards or fabricate unobserved options. [Audit CI 41405182285](https://github.com/FlareZ123/experiment-01/actions/runs/41405182285) passed on source head `175c539`; the [machine-readable v2 source-arm evidence](https://github.com/FlareZ123/experiment-01/actions/runs/41405182285/artifacts/13122688079) retains all 16 raw dispositions and five source zero-attack arms. Later root changes will be reaudited separately.

**Important representation correction:** the pinned Store encodes a manual Double Colorless Energy attachment as `PlayCardAction` with `declared.ownerHandPrinting='Double Colorless Energy SUM'` and a public recipient change. An earlier v1 read-only summary assumed the nonexistent `AttachEnergyAction` and falsely displayed zero attachment roots. That earlier summary is superseded; **v2** is the verified source for all counts below.

## All five non-attacking original source arms

| Treatment arm, rank:repeat:source opponent seat:candidate | Original source copied attacks | Native end | Accepted original source root summary | Accepted DCE recipient | Accepted Mew VMAX evolution |
| --- | ---: | --- | --- | --- | --- |
| `5:0:A:champion-reference` | 0 | 260-root cap | 38 passes, 6 card plays | None | 2, Active turn 3 and Bench turn 23 |
| `5:0:A:new-moon-lockbreaker-v1` | 0 | 260-root cap | 36 passes, 7 card plays | None | 2, Active turn 3 and Bench turn 23 |
| `5:0:B:champion-reference` | 0 | Engine terminal | 13 passes, 3 card plays | Active Genesect V turn 2; Benched Mew V turn 20 | None |
| `5:0:B:new-moon-lockbreaker-v1` | 0 | Engine terminal | 18 passes, 6 card plays | Active Genesect V turn 2; Benched Mew V turn 20; Benched Genesect V turn 32 | None |
| `5:1:B:champion-reference` | 0 | 260-root cap | 35 passes, 9 card plays | Active Genesect V turn 1; Benched Lillie's Clefairy ex turn 11; **Benched Mew VMAX turn 47** | 1, Bench turn 17 |

The other three integrated treatment games did perform **3, 4 and 1** original-source Cross Fusion Strike attacks. These are the reported eight native settled attacks and must remain distinct from paper-legal full-game wins. **Control had 0 attacks in all eight attempts.**

Each non-attacking group has a narrower observed gap. In the first two, Mew VMAX evolved early but **no DCE play was accepted anywhere** in the root ledger. In the next two, the original source accepted DCE plays but **never evolved Mew VMAX**; opponent attacks forced promotions and the engine eventually terminated. In the fifth, both the Mew VMAX and DCE were played, yet the **paid Mew VMAX stayed on the Bench**, behind an Active Genesect V with an independently attached DCE. These are facts about observable native decisions only; they do not prove that an unavailable card was in hand or that a desirable legal action was offered and ignored.

## The decision-critical 260-action cap: exact original-source physical deal

Treatment `5:1:B:champion-reference` and treatment `5:1:B:new-moon-lockbreaker-v1` share exact **original source deal fingerprint**
`d22b760a106875c5c27b5d7d03807ddef2bb8793dd3ac92599e6f6d13b04f485`. Their full physical deals differ because they face distinct candidate decks. Both accepted the same key source side effects: DCE to Active Genesect V on global turn **1**; one Mew VMAX evolved on Bench turn **17**; a distinct Benched Genesect V entered turn **41**; DCE attached to that Benched Mew VMAX turn **47**.

In the champion-reference game, after turn 47, the original source kept passing with Active **Genesect V carrying DCE** and Benched **Mew VMAX carrying DCE** and Benched **Genesect V**. This persisted through the 260-root censor. The candidate's final Active was a Dialga-GX with nine Psychic Energy, and there is **no settled candidate attack** in this arm.

In the New Moon game, the same source first passed with this stranded structure. The candidate then used three actual `Energy Drive` attacks on turns **64, 66 and 68**. At turn **68**, the genuine Store settled an opposing **Genesect V Active Knock Out**: source active changed from Genesect V to Mew VMAX, and the candidate's Prize count went from six to four. Original source played a Mew V on global turn **69** and then made its **first Cross Fusion Strike native attack**. The same DCE-funded Mew VMAX was visibly Active with a Benched Genesect V as donor before the declared attack. This witnesses how a *different opponent* inadvertently solved the source's positional bottleneck; it is not a controlled trial of voluntarily retreating and cannot establish source policy success.

The bundled card database identifies `Genesect V FST` (Fusion Strike 185/264) as having a **two-Colorless Retreat Cost**, and `Double Colorless Energy SUM` provides **two Colorless Energy**. The uploaded Advanced Player's Rulebook describes paying Retreat Cost by discarding Energy that supplies the required units, subject to effects and status restrictions. Consequently the board offers a **plausible legal paid RetreatAction** from Genesect V into the already charged Mew VMAX. A separate genuine Store test demonstrated paid DCE RetreatAction acceptance, one-card DCE discard, and promotion of the independently charged Mew VMAX in both physical seats with native PlayCardAction attachments ([CI 41406354018](https://github.com/FlareZ123/experiment-01/actions/runs/41406354018), success). That staged native result demonstrates mechanical legality, while the archived source opponent never voluntarily took the line.

## New default-off owner-only mobility candidate and validation status

- [Bounded pure planner](../../simulation/twinleaf/agent37-dce-mew-paid-retreat.cjs) requires the actual actor's owner-public Active Genesect V, **one DCE on that Active**, printed two-Colorless Retreat Cost, **another one DCE on Benched Mew VMAX**, exact printed Cross Fusion Strike `[C,C]`, and a **separate Benched Genesect V** donor. It vetoes a used retreat, status/retreat/attack restrictions and public Temple of Sinnoh; it reads no opponent hidden cards or deck truth. It proposes the existing native `paid-retreat` action, preserving the genuine Store as authority. No cardlist changes.
- [Root adapter](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) and [symmetric runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs) accept a **default-off** `actorDceMewMobilityRoot` policy option. Unselected modes retain current natural action behavior.
- [Pure tests](../../tests/agent37-dce-mew-paid-retreat.test.cjs) exercise exact supply, target, donor, lock and owner-information boundaries. [Genuine Store staged two-seat test](../../tests/agent37-dce-mew-paid-retreat.native.test.cjs) passed with two physical owners and a genuine DCE Retreat payment ([CI 41406354018](https://github.com/FlareZ123/experiment-01/actions/runs/41406354018)). The planner remains developmental and default-off.

## Additional source-policy gap: genuine Genesect draw

Across all 16 native rank-5 original-source attempts, there were **zero source UseAbilityAction roots**. In a separate native staged test, Benched Genesect V FST did successfully use **Fusion Strike System** to draw from 0 cards in hand to 3 with 3 Fusion Strike Pokémon in play. The native Store deferred the effect until real WaitPrompt resolutions: the early immediate-postdispatch zero-draw observation was premature. [CI 41407568312](https://github.com/FlareZ123/experiment-01/actions/runs/41407568312) passed both physical seats.

The [owner-public Genesect draw planner](../../simulation/twinleaf/agent37-genesect-public-fusion-draw.cjs) proposes only a positive same-turn draw to visible Fusion board count, and [the shared actor adapter](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) tracks native once-turn use, pending prompt settlement and public hand/deck conservation. These new root decisions are **opt-in and bilateral only**.

The [fresh two-seed preregistration](registrations/agent37-rank5-native-fusion-mobility-20261102.json), [runner](../../simulation/evaluation/agent37-rank5-fusion-mobility-prospective.cjs), and [bounded manual CI](https://github.com/FlareZ123/experiment-01/actions/workflows/agent37-rank5-fusion-mobility.yml) now compare original rank-5 native source behavior across both seats, both candidates, and controlled v3.1 vs v3.1 + owner-public DCE mobility + Genesect draw. All eight attempts are retained without exclusions. This is a **developmental source-policy experiment**, still 0 competitively qualified games.

## Responsible next experiment

The staged native RetreatAction and Genesect draw effects are both mechanically confirmed. Compare **two already preregistered symmetric policies** on new original rank5 two-seat seeds: integrated v3.1 versus integrated v3.1 with both the mobility and Genesect draw options.  Retain all source/candidate roots, exact physical fingerprints, prompt and payment chains, competitor responses, source original attack settled counts, native terminals and action caps. A successful Mew attack would be a mechanism witness; **still zero qualified competitive games** until full paper effects, opponent decisions and clocks are certified.

The collective target remains **one fixed 60 against 32 original opponent 60s**, with **29 authenticated opponent lists** and no defensible field win-rate evidence. Do not choose deck slots from this source-opponent policy experiment.
