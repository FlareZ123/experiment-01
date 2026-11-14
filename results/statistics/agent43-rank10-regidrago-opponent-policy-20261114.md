# Aichi rank-10 Regidrago opponent-policy prototype

**Status: prototype only. Not ready for benchmark games; no Twinleaf match results or matchup-strength claims.**

## Scope and source

This module targets the rank-10 Regidrago list in the normalized diagnostic field artifact:

`results/aichi-2026/2026-11/agent39-ranks8-16-expanded-normalized-inputs-20261113.json`

The rank-10 list includes Regidrago V/VSTAR, Budew ASC 16, Latias ex SSP 76, and Dragon attack payloads Dragapult ex TWM 130, Dialga-GX UPR 100, Koraidon ex TEF 120, Kyurem SFA 47, and Hisuian Goodra VSTAR LOR 136. The exact printing matters; the module's attack-choice helper ranks only choices exposed by the native Apex Dragon prompt.

## Artifacts

- Policy: `simulation/evaluation/2026-11/agent43-rank10-regidrago-opponent-policy.cjs`
- Attack-choice helper: `simulation/evaluation/2026-11/agent43-regidrago-apex-choice.cjs`
- Tests: `tests/2026-11/agent43-rank10-regidrago-opponent-policy.test.cjs` and `tests/2026-11/agent43-regidrago-apex-choice.test.cjs`
- Policy version: `agent43-rank10-regidrago-opponent-v1`

## Implemented policy priorities

The actor-view-only heuristic covers the main rank-10 lines:

- Early Regidrago V / VSTAR setup, Battle VIP Pass, Battle Compressor payload setup, and Legacy Star recovery.
- Budew's zero-Energy Itchy Pollen Item lock, with Latias-based pivot priority toward a ready Regidrago attacker.
- Apex Dragon attack choice through the shared evaluator.
- Gust priority for visible Mimikyu and Lillie's Clefairy ex. Mimikyu receives extra priority when the opponent's public discard contains Dialga-GX UPR 100, because that exposes a possible Copycat/Apex Dragon retaliation line.
- Wonder Tag / VS Seeker Supporter choice, draw Pokémon, Raihan/Crispin, Faba, Marshadow, Parallel City, Muscle Band, and Super Rod recovery.
- Super Rod recovery is restricted to Pokémon and Basic Energy; it does not select Double Dragon Energy.

The policy reads only the acting player's observation, legal action frontier, prompt choices, and public event receipt. It does not inspect hidden opponent hand/deck state.

## Validation

The focused policy suite has **22/22 passing tests**. Together with the Apex evaluator's **17/17 tests**, the two local Node suites pass **39/39**.

The tests cover role/seat binding, opening setup priorities, Budew/Latias sequencing, Apex prompt delegation, attack payload setup, Mimikyu/Clefairy gust priority, target-seat-aware switching, Quick Ball discard/search, Wonder Tag, Super Rod card-type restrictions, and fail-closed handling of unsupported prompts.

## Explicit gaps

- This is not integrated into a completed 32-rank opponent bundle and has not been exercised in a Twinleaf match.
- The heuristic score weights are not calibrated from game outcomes.
- **Phantom Dive damage-counter allocation deliberately abstains** until the native prompt's allocation semantics are implemented and tested. It must not be used as a game-ready policy while this prompt remains unsupported.
- Some search, supporter, and effect prompts may still be unsupported or only heuristically handled. Unknown prompt types abstain rather than guess.
- The module does not certify the rank-10 list's paper legality or establish that this policy is a strong opponent.
- Parallel City, Faba, and gust sequencing are heuristics; no matchup result currently validates them.

## Next work

1. Implement and test Phantom Dive's actual damage-counter allocation prompt using the pinned Twinleaf interface.
2. Exercise every prompt path through the contract-only policy worker; remove any path that fails validation.
3. Run the policy against the fixed Hood candidate only after prompt coverage is complete, pinning engine/policy/deck revisions.
4. Reuse the Apex evaluator for the other Regidrago ranks only where their native prompts offer the corresponding Dragon attacks.
