# Rank-4 source owner Escape Rope pivot: pre-registered native matched comparison

**Agent 45 | registered 21 October 2026, 01:23 UTC.** This is a **development-only**, retrospectively chosen eight-deal diagnostic. It is not competitively qualified and cannot estimate a win rate.

## Prior evidence and distinct test

The previous source-only Battle Compressor policy physically resolved in all eight same-deal treatment games, selecting Reversal Energy PAL, Counter Energy CIN, Unit Energy LPM UPR from the owner deck. [Completed comparison](agent45-rank4-owner-position-frontier-20261020.md) found 25 source-decision snapshots across three games where both Alolan Raichu and Electrode-GX were Benched, at least three relevant Energy cards were discarded, an Escape Rope was held, and the public Prize trade window was nominally open. No Extra Energy Bomb followed. All eight original deal trajectories are retained; no additional favorable seeds are selected.

The existing **untested-in-native-game** `simulation/twinleaf/rank4-raichu-rope-pivot-policy.cjs` proposes an owner-hand Escape Rope and tries to resolve the owner's own switch prompt to Benched Alolan Raichu. Its current predicate checks the owner's live board/hand/discard and public Prize counts; it never reads opponent private zones. The opponent's preceding Escape Rope choice remains an ordinary bot decision. This experiment tests whether the proposed root, opponent response and own choice actually resolve, and whether corrected Electrode prize trade follows. The game may instead expose a hook or policy incompatibility; retain that as a failure.

## Frozen comparison contract

Run the **same historical, unmodified** rank-4 paper-source 60 against four unchanged candidate 60s, both physical candidate seat assignments, with the preexisting `decorrelated-slots-v3` seed plan. Exactly eight attempt records per arm. Use one frozen git branch/checkout, pinned Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, no vendor edits. Both arms must enable identical strict prompt validation, Forest Seal correction, Electrode-GX mandatory attachment, Electro Rain damage correction, Electrode Prize-trade policy, source-only opening Battle Compressor, paper minimum-one Compressor selection, opportunity observer, decision trace, fixed existing campaign options and deterministic policy isolation.

The **sole intended policy difference** is `rank4_raichu_rope_pivot_source`: false in control, true in treatment. The bounded manual workflow is `.github/workflows/aichi-first-game.yml`, dispatched once for each arm against a frozen ref. The test does not change the candidate list, source list, role mapping or original seed.

## Falsification and evidence to record

1. Confirm eight complete matching trial IDs; same printed 60 hashes, engine pin, seed, actual first-player mapping, paper-correction flags and only intended Rope toggle. Preserve all failures/aborts/terminal statuses.
2. Find **first chronological/root divergence** in each pair. Verify the source owned and legally played Rope only when the owner predicate was met, then inspect both players' actual pending Pokémon-choice prompts and resulting public Active/Bench transitions. Attribute engine exceptions or prompt vetoes to their exact root.
3. Check whether any source Alolan Raichu becomes Active while Electrode-GX remains Benched, relevant discarded Energy is available, and the opponent remains on a legal Prize trade path. Record real Extra Energy Bomb action dispatch/acceptance, attached Energy identities and source Electro Rain declarations with opponent turn continuation. Mere resource-window counts do not pass this test.
4. Compare opponent source attack declarations, turn caps, winners, and changes in source options with every case in the denominator. Distinguish an actual completed native effect from an owner-intended proposal and distinguish engine output from paper-validated play.
5. Even a resolved pivot or changed engine terminal leaves `competitiveGameQualified=false` and `strengthClaimPermitted=false` until the common two-player policy, rules and clock gates are met.

**Pre-result status:** no native Rope result or qualified performance claim yet. The exact frozen branch/run IDs and artifact hashes will be appended only after observed execution.


## Completed frozen native comparison, 21 October 2026 UTC

**Both runs succeeded on identical checked-out revision `7584a962a4289c4c92d6af653f6497d35eaa9186`.** Exact retrieved artifact provenance:

| Arm | Manual workflow | Original diagnostic artifact | ZIP SHA-256 |
| --- | --- | --- | --- |
| Source Compressor ON, Rope policy OFF | [39527076989](https://github.com/FlareZ123/experiment-01/actions/runs/39527076989) | [12312959607](https://github.com/FlareZ123/experiment-01/actions/runs/39527076989/artifacts/12312959607) | `e43d52ec969404fe131638f21bf06d9660a04ba18430d21e360ecdd7debb80d3` |
| Source Compressor ON, Rope policy ON | [39527082013](https://github.com/FlareZ123/experiment-01/actions/runs/39527082013) | [12313408980](https://github.com/FlareZ123/experiment-01/actions/runs/39527082013/artifacts/12313408980) | `558ee0e8eef204f204fd7bdfe0e366c527382c0bc9bf2dd937e4fa6f0da5e3d7` |

The [committed eight-pair comparator](../../scripts/agent45-rank4-rope-compare.cjs) reads each artifact's `aichi-campaign-diagnostic.json`; it asserts the same exact ordered eight `trialId` values, original engine-facing deck hashes, random seeds, actual first-player positions, rank, source-seat identities, plan/field digests, maximum-action bound, pinned engine revision and all shared policy flags. The only different flag was `rank4RaichuRopePivotSource`. All **16 native-game records** were `completed-engine-game`. Five of the eight physical pairs diverged; three were completely unchanged at their full root-action-ledger level.

| Source-actor action or outcome, all 8 original matches | Control | Treatment |
| --- | ---: | ---: |
| Battle Compressor plays | 8 | 8 |
| Escape Rope plays | 7 | 9 |
| Source attacks declared | 6 | 13 |
| Extra Energy Bomb `UseAbilityAction` | 0 | **2** |
| Electro Rain `AttackAction` | 0 | **2** |
| Engine terminals won by source seat | 1 | 1 |
| Competitive-qualified games | 0 | 0 |

### First native divergence by fixed physical trial

| Original paired trial | First divergent Store root, zero-based ordinal | Control vs treatment |
| --- | ---: | --- |
| Champion reference, candidate A | 168, source turn 18 | Pass vs source Escape Rope |
| Champion reference, candidate B | None | Full identical root trace |
| Hood Shield, candidate A | 65, source turn 4 | Pass vs source Electro Rain attack, following the same already-played Rope root |
| Hood Shield, candidate B | None | Full identical root trace |
| Temple, candidate A | 105, source turn 8 | Pass vs source Escape Rope |
| Temple, candidate B | None | Full identical root trace |
| New Moon, candidate A | 108, source turn 18 | Pass vs source Escape Rope |
| New Moon, candidate B | 179, source turn 33 | Pass vs source Extra Energy Bomb, following the same already-played Rope root |

For **Champion A**, source `Escape Rope` at root 168 received opponent `ChoosePokemonPrompt` resolution at 169 and its own `ChoosePokemonPrompt` resolution at 170; the source next dispatched **Extra Energy Bomb** at 171. The real Store then resolved `WaitPrompt` (172), **`AttachEnergyPrompt`** (173), opponent **`ChoosePrizePrompt`** (174), and later source `Electric Ball` at 180. The opponent's Prize count visibly dropped from six to four, consistent with Electrode-GX's two-Prize self-Knock-Out. That first Rope and prompt resolution occurred on a development-only retrospective deal, and its opponent continuation later included real Max Geist attacks.

For **New Moon B**, the common opening has source Rope root 176, opponent switch choice root 177 and source switch choice root 178. Control passed at root 179; the treatment instead used **Extra Energy Bomb** there, resolved owner **`AttachEnergyPrompt`** at 181, granted the other player a two-Prize `ChoosePrizePrompt` at 182, and attacked with **`Electric Ball`** at 183. The opposing side continued on global turn 34, playing its own Escape Rope and later using `Cursed Blast`, followed by further actual-game Poltergeist attacks.

The source's two treatment Electro Rain declarations occurred in other arms: **Hood A** (root 65, turn 4) and **New Moon A** (root 111, turn 18), each after a newly chosen source pivot. The new Rope policy thus removed a real in-game action/promotion or attack-selection bottleneck but **did not produce the complete desired Extra Energy Bomb -> Electro Rain line** in any tested game. Both Bomb turns instead selected Electric Ball, revealing a next attack-choice policy gap.

### Winner flips and interpretation

The control had one source-seat engine terminal win (New Moon B). Treatment still had one (Hood A). Those two specific records flipped in opposite directions; six records retained their engine-reported winner. An additional legal action can increase attack execution while altering the game trajectory and losing a different engine match. These 8 retrospective seeds, untimed engine terminals and incomplete two-player policy cannot establish a net performance gain, a tournament-clock win, a matchup estimate or any progress toward the 99.5% statistical target.

**Next narrow falsification:** on the two actual Bomb-turn source states, enumerate legal native printed Alolan Raichu attacks and inspect owner-visible Energy/payment/target choices. In particular, distinguish (a) Electro Rain not actually available from (b) available but dominated by generic bot scoring, and then measure whether selecting it changes target Knock Outs and real opponent continuation. Preserve opponent physical choices, game engine print/rules corrections and original deal identities; do not hardcode a favorable target. The broader shared canonical two-player policy and field-wide qualification veto remains decisive.


## Preregistered follow-up: read-only native public attack board audit

**Registered 21 October 2026, before this audit's dispatch or result examination.** The shared native runner already offers opt-in `capturePublicAttackTransitions`, which snapshots only the public Active/Bench Energy, Tools, Stage, damage, Stadium, and attack log before and after an actual Store-declared attack. This preexisting observer has now been wired as an optional flag in the same `aichi-campaign-execute.cjs` archive and the existing manual workflow `rank4_public_attack_audit`. The ordinary reference/treatment data above remain frozen and unmodified.

Run just the **treatment** configuration from the prior matched pair with that additional **read-only** public-attack observer ON, using the original exact eight rank-4 source/candidate deals, paper corrections, rank-4 Compressor, Rope pivot, and native source Prize-trade. All other flags are held constant. Compare against prior exact treatment artifact `12313408980`, asserting the policy-equivalent observed games have identical original `traceSummary.rootActionLedger`, original `chronologicalActionTrace`, engine winner, source/candidate hashes, seed, actual first player and turn/action counts. The only permitted new output is `publicAttackTransitions`, its protocol, the new observer flag and unavoidable `researchRevision` difference (different code commits for the observer wiring). This is an empirical noninterference test, not assumed by source inspection.

At each real post-Bomb source Alolan Raichu attack (the existing matched treatment documented source Electric Ball on champion A turn18 and New Moon B turn33), extract its **immediately preceding public Active attached-Energy printing names**, opponent public remaining HP/Bench configuration, source Stadium and the subsequent public settled attack effects. Do **not** infer paper Energy-unit values, attack legality or an optimal alternative from card names alone. Keep source actor's printed Electro Rain [L] and discard-dependent damage distinct from Electric Ball [L][C][C]/90; distinguish paper-rule-corrected engine behavior and generic bot scoring.

If native attack snapshots shift the root ledger, or the observer causes engine error, record the first concrete divergence/failure as a noninterference veto. Whether Electro Rain could or should replace those two Electric Ball attacks remains **open** until a legal isolated real-state counterfactual with owner-visible opponent response is implemented. **No game becomes competitively qualified** from this audit.
