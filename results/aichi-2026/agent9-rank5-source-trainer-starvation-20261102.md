# Rank-5 source-bot deficiency: zero Trainer cards among 160 accepted native card plays

**Agent 9 | 2 November 2026 | read-only original printed-source Store reconciliation | development, unqualified**

## Stronger explanation than the prior Ability count

The authenticated original Aichi rank-5 Mew/Genesect 60 contains **14 Pokémon, 42 Trainer cards and 4 Double Colorless Energy**. Trainers include **4 Quick Ball, 4 Ultra Ball, 3 Battle VIP Pass**, as well as Supporters, Tools and Stadiums. Yet across two archived native experiment families, all **160** source-owned accepted `PlayCardAction` were one of its six Pokémon printings or Double Colorless Energy. **Zero** used a Trainer card from hand. This is source-policy/decision-coverage evidence, and does not show that any particular Trainer was legal and strategically superior on every turn.

| Authenticated native cohort | Source native plays | Pokémon | Energy | Trainer | Opposing accepted Fog Crystal plays |
| --- | ---: | ---: | ---: | ---: | ---: |
| [Agent13 corrected v3.1 control](https://github.com/FlareZ123/experiment-01/actions/runs/41387484608) | 43 | 30 | 13 | **0** | 25 |
| Agent13 corrected v3.1 integrated | 59 | 44 | 15 | **0** | 20 |
| [Agent37 prospective fusion control](https://github.com/FlareZ123/experiment-01/actions/runs/41409175394) | 29 | 19 | 10 | **0** | 12 |
| Agent37 prospective fusion enabled | 29 | 19 | 10 | **0** | 12 |
| **Total across 24 archived native attempts** | **160** | **112** | **48** | **0** | **69** |

## Why this matters

A direct audit of every archived mode's recorded opt-in flags found `ownerVipAfterPassOptIn=false`, `ownerVipBeforeAttackOptIn=false`, `quickBallRootOptIn=false`, `mysteriousTreasureRootOptIn=false`, `lowHandLillieRootOptIn=false`, `strandedMarnieRootOptIn=false`, and `conservativeShuffleBeforeAttackOptIn=false`. Those explicit policy configurations explain why the current archive is not a direct test of a Trainer-competent original-source opponent. The independent Agent9 native VIP replay deliberately enabled a separate VIP hook and verified four accepted searches, so native source VIP use is already feasible outside these frozen profiles.

The native opponent *did* select Fog Crystal as an Item on the other physical side across the same games. Therefore the missing source Trainers are a source-policy coverage problem in these particular policy profiles rather than evidence that the pinned engine cannot handle Trainer actions generally. The original source's 42-Trainer package is an integral portion of its printed 60. A bot that never deploys it is unlikely to supply a strategically credible opponent against a supposed 99.5% field-winning fixed candidate.

Related [actual hand/board count audit](agent9-rank5-genesect-ability-native-action-deficit-20261102.md) found **638** original-source accepted actor-root decisions where owner hand count was at least four cards above **the maximum possible number of Fusion Strike Pokémon in play**, even under a generous board upper bound. Thus the observed zero Genesect Fusion Strike System activations can be explained without claiming the bot declined currently productive draws. The Trainer-starvation finding identifies a specific source of limited hand reduction and card search, but does not prove the unique cause of all high-hand states.

## Reproducibility

[Source-only native census](../../scripts/agent9-rank5-original-trainer-source-plays.cjs) reconciles each original source `rootActionLedger` PlayCardAction count with the **independently captured accepted-target printing** from `nativeAcceptedTargetSidecar.events`. It rejects inconsistent root ledgers, missing source-seat identifications, unknown played printings and incomplete mode arms. Every played card matched the exact known original source physical Pokémon and Special Energy printings; no silently classified or missing cards were counted. Directly runnable [unit tests](../../tests/agent9-rank5-original-trainer-source-plays.test.cjs) cover both archive schemas and negative print-capture cases, locally **4/4 passing** under Node 22. Genuine archive reads verified all 24 attempts with no exclusions.

The immutable source archive IDs are **13115652707** for Agent13 corrected v3.1 and **13124612279** for Agent37 fusion mobility. Their ZIP SHA256 are `62201010d3930bfa47ae7927fe960b22ff38fba1aa053a53b419bc0a3aaab69d` and `5e30e2d97db783c00e160a8fd8b2962a22d552544868aae14b4c085843711c0c` respectively. Both use pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

These 24 archived attempts are **not independent tournament games**, include shared physical-seed comparisons, and are not qualified for game-win estimates. The source cannot be labeled strategically weak because this bot failed to play its Trainers. The actor requires genuine source-owned Quick Ball/Ultra Ball/VIP/Supporter root selection, native payment prompts and actual subsequent game continuation before its behavior supports competitive deck comparison.

**Field status:** 29/32 authenticated original source 60s, ranks 23, 25, 28 missing. **Zero competitively qualified games. No 99.5% fixed-deck claim.**
