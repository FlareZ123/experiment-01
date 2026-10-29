# Live native owner-only Supporter opportunities on exact source-dealt rank 6

**29 October 2026. Agent 2.** [Compiled manual native CI 40948272761](https://github.com/FlareZ123/experiment-01/actions/runs/40948272761) **PASSED** at commit `155b4c35cc63b402586c7f623b394464dbb86f40`. Artifact [12928879789](https://github.com/FlareZ123/experiment-01/actions/runs/40948272761/artifacts/12928879789), ZIP SHA256 `b2144b6a8587b46cdc0b72240ded2e6c89cffba76081aa6f55fe11d7e4745b70`. First compiled control [40947675690](https://github.com/FlareZ123/experiment-01/actions/runs/40947675690) also PASSED. Engine pinned submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Purpose and design

The precommitted [32-arm original-Store scout](agent41-prospective-canonical-scout-native-20261029.md) observed **zero candidate Supporter card plays** across 339 candidate accepted PlayCardAction roots. This observer asks a narrower, testable question: *At actual accepted first actions and Pass decisions, did the player hold Supporters, did the ordinary Supporter quota remain unused, and what did the pinned native `Card.canPlay(null,state,owner)` return?*

Implementation: [owner-only native Store observer](../../simulation/twinleaf/agent2-native-owner-supporter-opportunity.cjs), [reversible opt-in common runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs), [three unit tests](../../tests/agent2-native-owner-supporter-opportunity.test.cjs), [authentic noninterference contrast](../../simulation/twinleaf/agent2-native-owner-supporter-noninterference-smoke.cjs). Option `nativeOwnerSupporterOpportunity:true`, default OFF. Native Store owns the action and owner hand; postgame diagnostics are excluded from bot decisions. All first roots and Pass roots use pre-dispatch snapshots, and an action only enters the accepted census after Store dispatch returns. Both physical seats are observed identically.

Both arms use the *same precommitted physical source-first rank-6 repeat-2 candidate-A seed*, exact published source 60, and each exact frozen candidate 60. Baseline and observed source-deal fingerprint match `85dca969d95f7616a89a2077ee0c718dcdec19776afd0e40a657a9eba67469d8`. Full accepted root ledger hashes, action counts, terminal flags and outcomes are **byte-identical** before versus after observation.

## Genuine native results

| Frozen candidate | Original accepted roots | Observed first own-turn roots (candidate/source) | Accepted Pass roots (candidate/source) | Passes after global T1 holding at least one native-null-`canPlay` positive Supporter (candidate/source) | Store-accepted Supporters (candidate/source) |
| --- | ---: | ---: | ---: | ---: | ---: |
| Rank-1 champion reference | 91, natural terminal | 6 / 6 | 3 / 5 | **3 / 4** | **0 / 1** |
| New Moon Lockbreaker v1 | 260, capped | 29 / 29 | 16 / 28 | **16 / 27** | **0 / 1** |

All 52 accepted Pass roots across the two arms held at least one Supporter and returned at least one native-null-`canPlay` true. Removing the two source first-global-turn Passes, which require separate printed first-turn checks, leaves **50 Pass observations after global T1** with an engine-positive Supporter, across both actors. These are repeated dependent turns in **two prior-known physical games**, not 50 independent opportunity samples.

In both arms the only accepted Supporter root was the source's `Guzma & Hala CEC` on global T3, with `supporterTurn` advancing from 0 to 1. No candidate Supporter root settled.

Source-first champion opponent's T5/T7/T9 Pass snapshots report `Guzma BUS`, `Plumeria BUS`, `Gladion CIN`, and later `Lusamine CIN` as native-null-`canPlay` true, while remaining held. The champion candidate's T4/T6/T10 Pass snapshots report `Lillie's Determination M1L` and `Iono PAL`. New Moon candidate's T2, T4, T6 and later Pass roots report two held `Lillie's Determination M1L` as native-null-`canPlay` true. All snapshots are actor-own-hand observations taken **after the bot's action had already been chosen**.

## Qualification boundary

1. `Card.canPlay(null,state,owner)` is native-engine evidence of a card's local preliminary check. It can be an incomplete substitute for target selection, complete prompt settlement, exact paper wording, the first-player Supporter restriction, Special Conditions, or strategy. A native positive does **not** certify a paper-legal or beneficial Supporter. The first-global-turn cases remain explicitly marked as requiring printed exception verification.
2. Held and engine-positive Supporters show meaningful *potential* underuse. A deliberate Pass can still be optimal to protect a hand, preserve a conditional tactical line or avoid a harmful disruption. The records support investigation into the native bot's score/proposal path and carefully matched positive controls, rather than mechanically playing all held Supporters.
3. Both records are historical, retrospectively selected source-first fixtures. The long New Moon case is capped at 260 roots. No game is competitively qualified; no result establishes an improved fixed 60, source tactical competence or a win-rate estimate.

**Next experiment:** instrument the pinned native `PlaySupporterTactic` scoring path to distinguish skipped, unscored and score-disfavored candidate Supporters on genuine accepted Pass decisions. Independently test targeted conditional Supporter plans under paper first-turn, prompt and actual game-state constraints, with both actors' choices registered before gathering new outcomes. Keep current original scout and source-deal signatures unchanged.
