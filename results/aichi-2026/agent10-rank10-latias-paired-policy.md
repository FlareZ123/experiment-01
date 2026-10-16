# Agent 10: same-head v3 rank-10 Latias Energy-completion policy A/B

**16 October 2026, 09:33–09:38 UTC.** Evidence class: bounded paired pinned-engine gameplay diagnostic, fixed six source-locked campaign trials. Both manually dispatched Actions runs completed **successfully**.

- [Control, no Latias completion tactic: run 38881304003](https://github.com/FlareZ123/experiment-01/actions/runs/38881304003), uploaded artifact \`aichi-campaign-diagnostic\` ID \`12038066237\`.
- [Experimental Latias completion tactic: run 38881310669](https://github.com/FlareZ123/experiment-01/actions/runs/38881310669), uploaded artifact \`aichi-campaign-diagnostic\` ID \`12038096301\`.
- **Same exact repository head** \`22137e108e23e1bd434d7d8870c6ea6c05766046\`, the same three frozen candidate decklists, same published rank-10 Regidrago opponent, same manually requested \`pilot_ranks=10\`, \`seat_seed_protocol=decorrelated-slots-v3\`, \`audit_passed_attacks=true\`, \`prototype_safe_simulator_isolation=false\`. The dispatched parameter deliberately varied **only** \`latias_attack_ready\`: false in control and true in experimental run.
- The CI workflow \`.github/workflows/aichi-first-game.yml\` passes this option to \`AICHI_LATIAS_ATTACK_READY\`, which is passed as \`latiasAttackReadyAttachment\` to the headless policy through \`simulation/evaluation/aichi-campaign-execute.cjs\`. It enables the opt-in \`simulation/twinleaf/latias-attack-ready-attach.cjs\` tactic that prioritizes third Basic Psychic attachment to Active Latias ex against Koraidon ex while Sky Field is in play. All unchanged policy corrections and engine toggles follow the common manually dispatched workflow defaults.
- Engine pin, as documented in \`simulation/twinleaf/headless.cjs\`, is \`twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05\`. Full deck digests and per-trial seed identities remain in the uploaded machine-readable workflow artifacts.

## Directly observed six-game contrast

Printed by the two jobs' quality-screen steps. A and B identify *the candidate's engine slot*; columns report the candidate/opponent attack counts and terminal **remaining** Prize counts, in candidate/opponent order as exposed by the screen. Both jobs completed all six engine matches, and neither recorded any independently qualified games.

| Trial | Control attacks C/O | Experimental attacks C/O | Control terminal Prizes C/O | Experimental terminal Prizes C/O |
| --- | ---: | ---: | ---: | ---: |
| champion-reference:A | 3 / 4 | 3 / 4 | 2 / 0 | 2 / 0 |
| champion-reference:B | 4 / 3 | 4 / 3 | 0 / 4 | 0 / 4 |
| hood-shield-v1:A | 3 / 2 | 3 / 2 | 0 / 6 | 0 / 6 |
| hood-shield-v1:B | 5 / 3 | 5 / 3 | 6 / 0 | 6 / 0 |
| **temple-v1:A** | **0 / 7** | **3 / 2** | **6 / 0** | **0 / 6** |
| temple-v1:B | 5 / 0 | 5 / 0 | 6 / 0 | 6 / 0 |

Temple A changed from a candidate zero-attack engine loss to three candidate attacks and an engine win when enabling the source-specific attachment policy. Its logged final deck counts also changed from \`[19,17]\` to \`[26,26]\` in physical engine seat order. Matching *summary metrics* in the other five rows do not, by themselves, certify byte-identical action traces or every internal state.

## Other observed blockers persisted

The baseline audit captured **50** Pass events, probed **23**, skipped 27; the experimental audit captured **49**, probed **23**, skipped 26. In each, **two** opponent-side source rank-10 Pass choices in the champion:A and Hood:A games still missed a pinned-Store-accepted \`Retribution Strike\` declaration by Active Koraidon ex at global turn five. Audit errors were zero in both. The tactical selector did not fix that opposing policy defect.

All six records in **both** runs were assigned the \`unvalidated-simulator-alias\` and \`not-a-complete-replay\` blockers. Control Temple A additionally had \`zero-candidate-attacks\`, removed in the experimental Temple A record. Temple B retained \`zero-opponent-attacks\` in both. These are *quality-gate failures*, even when the game reached an engine terminal state.

## Interpretation and next acceptance gate

This is a reproducible **fixed-seed policy sensitivity**, concentrated in the named Temple A case. It is stronger than the preceding staged [Latias Energy-contract test](../twinleaf/latias-energy-attachment.md) or printed-cost inference because real headless matches completed and the opponent took subsequent actions. It is **weaker than a fully replayed and verified counterfactual**: the campaign capture is an ordered action summary rather than complete prompts/reducer events; the experimental one-case winner reversal alone cannot prove correct strategic causality, source-action replay fidelity, or robust improvement.

In particular, the unmodified pinned Simulator can alias mutable Card objects into live games during speculative action scoring. That defect has already caused phantom damage and a separate fixed-seed game-winner reversal. The experimental prototype-safe clone is also not qualified. Neither of these paired CI runs is game-win-rate evidence, and these results do not establish that the 99.5% target is closer.

For adversarial replay qualification: recover both exact trial traces and original public/hand attachment decision, dispatch the intended third-Psychic-to-Active action on an isolated representation of the *same genuine game state*, resolve Eon Blade and the real Koraidon response, and establish the unmodified source state is unaffected by every speculative policy branch. Run with cloned-state isolation appropriately tested, reproducible seed and full action/prompt record, then extend to both candidate seats and independent seeds. Separately fix or characterize the two opponent-side missed legal Retribution Strikes.

This finding should inform \`results/aichi-2026/policy-qualification-matrix.md\`, with the rank-10 row still **No** until opponent competence and fidelity gates pass.
