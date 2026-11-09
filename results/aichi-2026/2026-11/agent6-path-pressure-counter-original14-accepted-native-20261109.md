# Owner-held Stadium recovery from Path to the Peak: actual original-source matchup result

**Agent 6 | 9 November 2026 | Development-only.** Shadow Rider Calyrex VMAX gained a strictly optional, owner-visible `Sky Field ROS` or `Dimension Valley PHF` Stadium displacement line when a publicly live Path to the Peak suppresses its `Underworld Door` Ability. The code change is now reproducibly accepted inside actual pinned-Store source-dealt play. **No new winner reversal, paper-qualified game or proven competitive win-rate improvement.**

## First, the physically correct line

The common Shadow Rider policy now refuses illegal Underworld Door under either player's live Path; `simulation/twinleaf/agent31-underworld-door-owner-frontier.cjs`. The additional opt-in `simulation/twinleaf/2026-11/agent6-path-underworld-stadium-counter.cjs` recognizes the owner's known held replacement, unused per-turn Stadium quota, live printed Path, an available Psychic target and Psychic Energy, and the owner-specific unspent native Underworld marker. It then proposes the physically payable `PlayCardAction`. Only the genuine Store may settle it; the next native root must independently accept the Ability. The default and fixed 60-card deck inventory are unchanged.

The shared native root, evaluator flag and public-effect witness reside in `simulation/twinleaf/agent34-actor-only-root-policy.cjs` (`pathUnderworldStadiumCounter`), `simulation/evaluation/agent41-bilateral-v2-development.cjs` (`actorPathUnderworldStadiumCounter`), and `simulation/twinleaf/agent5-owner-root-slice.cjs` (physical Stadium witness). The witness now requires the actual new Stadium to occupy a public slot, the owner hand to decrease by exactly one card and the previous Path to disappear from *both* Stadium zones. It refuses to label a surviving Path as confirmed.

The pinned physical `tests/2026-11/agent6-underworld-path-native-stage.test.cjs` and pure owner-policy tests test the line in both seats, including actual opponent Path play, owner Sky Field replacement, native Underworld ability restoration, and a negative still-live-Path witness. All proposed new roots remain source-independent and opt-in.

## Registered genuine original-source native games

The frozen [14-group declaration](../registrations/agent6-path-pressure-counter-14-original-20261109.json) fixes **seven authentic Aichi source 60s that contain Path**, ranks 5, 9, 12, 15, 20, 21 and 27, with two separate newly randomized physical deals for each rank and contender in both physical seats. Candidate stays the fixed champion-reference 60. Both arms apply the same printed-card compatibility hooks and the same symmetric owner-public adversarial Path-playing policy; the treatment alone additionally enables the Stadium counter. A maximum of 260 native actions is imposed.

The initial [run 42561187689](https://github.com/FlareZ123/experiment-01/actions/runs/42561187689) preserved a real rank21 turn-5 source-dealt encounter with owner Mimikyu Active, Shadow Rider VMAX Benched, own replacement available and opponent Kyurem Active with Path in its public Stadium. At action ordinal 24, the owner selected `play-path-underworld-stadium-counter` and dispatched `PlayCardAction`. Native Store returned, then the *shared physical-effect witness* incorrectly asserted every unrecognized kind must be `attack`, aborting before an outcome could be recorded. The immutable [archive artifact 13649796149](https://github.com/FlareZ123/experiment-01/actions/runs/42561187689/artifacts/13649796149) and the read-only [cause analysis 42561974503](https://github.com/FlareZ123/experiment-01/actions/runs/42561974503) establish the exact missing classification at `agent5-owner-root-slice.cjs:496`. This was a research adapter failure, not evidence that Path displacement was impossible.

**Correction:** commit `e71c977f2b0d919ba3a872e4f2d970e5260fbe99` added the new physically supported Stadium action to the shared witness. A stricter print-displacement check followed in `85b4c90e3565faa8d5183260dd0125f9e6e73886`. The native regression now checks both witness confirmation and a negative retained-Path variant.

The identical frozen-seed replay [CI42562112272](https://github.com/FlareZ123/experiment-01/actions/runs/42562112272) completed successfully; raw full preserved A/B records are in [artifact 13650420579](https://github.com/FlareZ123/experiment-01/actions/runs/42562112272/artifacts/13650420579).

| Prespecified evidence | Corrected matched replay |
| --- | ---: |
| Authenticated original source ranks with Path | 7 |
| Independently pre-frozen physical deal groups | 14 |
| A/B native game attempts | 28 |
| Matching entire physical A/B deal fingerprints | **14/14** |
| Real owner Path-displacement roots selected in treatment | **1** (original rank21, candidate seat A) |
| Same root selected in controls | **0** |
| Natural native terminal games | **18/28** |
| Full A/B pairs both terminal | **9/14** |
| Native root-capped games | **10/28** |
| Native engine/adapter errors | **0** |
| Natural native winner reversals | **0** |
| Competitively qualified paper games | **0** |

The recovered rank21 line continued through a native natural terminal, with the **same rank21 source winner** in both arms. A deck-control or matchup-strength improvement has therefore **not been demonstrated**. This also demonstrates why theoretical associativity or a staged available action must not be scored as a win. The native bot still makes substantial unqualified decisions, and many games remain action-censored; all Top32 claims remain outside statistical admission.

A prior independently fresh standard-policy [14-pair field run 42560225495](https://github.com/FlareZ123/experiment-01/actions/runs/42560225495) produced **zero** selected recovery roots, zero naturally terminal winner changes, 14/14 physically paired deals and zero engine errors. The adversarial pressure run therefore adds one actual reachable action to an otherwise dormant branch; it did not turn the strategy into a winning matchup yet.


## Matched root-level causal evidence from the preserved native result

[Read-only archive reduction 42562488045](https://github.com/FlareZ123/experiment-01/actions/runs/42562488045) establishes the exact original-rank21 A/B first-difference at **native Store action ordinal 24, global turn 5**, while preserving the same full physical deal. Source rank21 played `Path to the Peak CRE` at global turn 2, with actual Store acceptance and a confirmed public Stadium transition. On turn5 the candidate selected owner-held **Sky Field ROS**, replaced Path and obtained `nativePhysicalEffect:'confirmed-public-effect'` from the shared root witness. The next acting-owner root selected `Underworld Door` from its Benched `Shadow Rider Calyrex VMAX CRE`; a genuine `UseAbilityAction` was accepted, while its immediate native receipt correctly remained **unconfirmed until the subsequent Attach Energy prompt resolved**. The public owner attached-Energy total then increased, with the engine progressing through later root decisions.

The identical rank21 source won in both arms; the control ended after **150 native actions**, the recovered-Stadium treatment after **139 actions**. Faster action termination alone does not establish better decisions, and this native game is not a match win for the contender. The detailed action and physical-receipt evidence is generated by `scripts/agent6-path-recovery-causal-archive.cjs` from the immutable corrected artifact, without replaying or reconstructing hidden cards.

## Research consequence

Use the conservative **Path suppression** in future pinned native gameplay to prevent false impossible Ability actions. Keep the recovery **default off** in the shared comparative policy pending proof it improves actual full-game outcomes. More repetitive 14-group sampling with weak active opponent play is lower priority than improving material decision choices and physical opponent reply fidelity. The fixed 60-card selection remains open, with 29 authenticated source opponents, three missing exact 60s, zero paper-qualified matches and no demonstrated 99.5% win rate.
