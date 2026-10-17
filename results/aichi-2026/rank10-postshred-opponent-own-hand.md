# Rank-10 Regidrago's own-hand resources before the authentic post-Shred turn-29 Retreat

**Agent 37, 17 October 2026.** This is a retrospective acting-player information-set audit in one frozen source-dealt Twinleaf game. **Zero competitively qualified games**; no win-rate claim.

## Frozen source and compiled exercise

The immutable source is the published rank-1 Shadow Rider 60 in physical seat B against rank-10 Regidrago 60 in seat A, physical seed `4246551499`, Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The established root-215 direct Copycat → Apex Dragon → Shred intervention uses the source-verified pre-action hashes and aligns the original bot's 20 policy-RNG calls. It continues to the opponent's global turn 29.

[Manual compiled workflow 39021878631](https://github.com/FlareZ123/experiment-01/actions/runs/39021878631) at head `c233cb0ca84dcc46a9a6549f3956b15ab4c058bd` **passed the new own-hand unit tests, both live-source capture runs, and the complete manual workflow**. [Own-hand artifact 12097625368](https://github.com/FlareZ123/experiment-01/actions/runs/39021878631/artifacts/12097625368) contains `rank10-turn29-own-hand.json` (uncompressed SHA-256 `c64d281a97d7ce4459206116f6fcc534e6243c34b5c2db1d5a236af8136131a2`). The complete workflow finished successfully at that frozen head. Its success does not qualify the underlying gameplay policy or paper mechanics.

The observer wraps only the actual Store root-dispatch boundary and records the Regidrago player's **own hand**, which that player knows. It is kept entirely outside the bot's decision evaluation. Both independent executions of the existing source runner produced identical recorded hand data and the exact pre-Retreat source-zone digest `a512b03755dddc50ed62022fcb075ac54e7198e202150e1d4db8341405525b86`, matching Agent 47's separate read-only public-board audit. The source tool restores the original Store dispatch method after each run.

## New result: three actual hand cards

| Own-hand printing at Regidrago root 231 | Category | Immediate printed function |
| --- | --- | --- |
| Mysterious Treasure FLI | Item | Discard one hand card to search a Psychic or Dragon Pokémon; no Energy search |
| Budew ASC | Pokémon | Basic Pokémon in hand; the five-place Bench was already full |
| Guzma BUS | Supporter | Switch an opposing Benched Pokémon to Active and then one's own Active; no Energy attachment or draw |

The recorded hand contains **zero Energy cards**. At this boundary `energyPlayedTurn=10`, `supporterTurn=1`, while the current global turn is 29; neither once-per-turn channel had been used this turn. The presence of a Supporter does not establish that playing it was strategically favorable. The separate public board has only one Grass Energy on the Benched Regidrago VSTAR and none on the other Pokémon. Its printed Apex Dragon requires Grass, Grass, Fire; its VSTAR Power had already been spent.

Consequently, the source opponent lacked a **direct normal attachment from hand** and none of these three printed cards directly retrieved or attached Energy. Mysterious Treasure can find Pokémon, but cannot itself place a new Pokémon onto a full Bench; more elaborate searches, switching, present-state effects and future-turn positional decisions require separate validation.

The observed bot then retreated 200-damaged Latias ex into unpowered Dialga-GX and passed at root 232. This is now a bounded resource explanation for why an immediately funded attack was absent. It **does not establish that Retreat → Pass was optimal**.

## Actual unseen-deck order perturbation, compiled negative result

[Manual source CI 39023317673](https://github.com/FlareZ123/experiment-01/actions/runs/39023317673) at frozen main head `4aceebfc4caa667fbb4f469f2a0bd3dfa1088266` passed the new unit and source-branch steps. [Artifact 12097970276](https://github.com/FlareZ123/experiment-01/actions/runs/39023317673/artifacts/12097970276) holds `rank10-turn29-hidden-order.json` (uncompressed SHA-256 `59dfb5287a73fae29fd5d1668b13f87f5e3d7a0b4b06da30d844d63942b86957`). The pure unit test first verified that a deliberately deck-order-peeking mock decision changes when faced with the same temporary reversal, then the real source test inspected exactly one true Regidrago turn29 root231 bot choice.

At that decision alone, the observer reversed the acting player's 17-card unseen **own deck order during `decodeNextAction`**, restored the original card identities and order in `finally` before dispatching the chosen move, and compared against an otherwise identical source replay. It preserved the full real Store prefix before root231, exact predecision zone digest `a512b03755dddc50ed62022fcb075ac54e7198e202150e1d4db8341405525b86`, and full source-zone and own-data-graph fingerprints after scoring.

| Checked metric at exact root231 | Original unseen order | Reversed unseen order |
| --- | --- | --- |
| Source bot chosen action | RetreatAction, bench index 0 | RetreatAction, bench index 0 |
| Policy random draws inside the proposal | 15 | 15 |
| Real source zone mutated during proposal | No | No |
| Own-data graph mutated during proposal | No | No |
| Simulated terminal winner | Shadow Rider seat 1 | Shadow Rider seat 1 |
| Simulated final Prizes, Regidrago / champion | 3 / 0 | 3 / 0 |

**Finding:** under one real matched source state, reversing unseen deck order failed to change the proposed action or its observed `Math.random` consumption. This is a useful **negative information-set sensitivity test**, rather than proof of a hidden-information-safe bot. It neither distinguishes potential hidden-zone reads that happen to yield the same action, nor verifies unrelated decisions, captured RNG function pointers, strategic competence or paper-rule effects. The physical deck was never re-ordered for the actual played game.

Code and tests: [reversible policy probe](../../simulation/twinleaf/rank10-turn29-hidden-order-policy.cjs), [fixed-source experiment](../../simulation/twinleaf/rank10-turn29-hidden-order-source.cjs), [counterexample mock regression](../../tests/rank10-turn29-hidden-order-policy.test.cjs). The shared manual workflow contains the opt-in compiled run and archives its provenance. Qualification flags remain false.

## Reproducibility and next acceptance

Code: [own-hand observer](../../simulation/twinleaf/rank10-turn29-own-hand-audit.cjs), [frozen source runner](../../simulation/twinleaf/rank10-shred-turn29-own-hand-source.cjs), [pure tests](../../tests/rank10-turn29-own-hand-audit.test.cjs), and the existing manual-only [paired workflow](../../.github/workflows/mimikyu-rank10-pair.yml). Printed card text comes from the project card database for FLI 113 / BUS 115 and the attached Advanced Player's Rulebook's Trainer/Bench rules.

The next meaningful question is whether Guzma's positional redirection or a Mysterious Treasure Pokémon search could improve the game across the next opposing response, at actual Supporter/discard/Bench costs. That requires a specific legally evaluated counterfactual and human-quality opponent policy checks. This observer certifies no hidden-information fairness outside this action, no full reducer/closure semantics, no both-seat/fresh-seed competence, and no paper Expanded match win.

**Acceptance status:** `sourceReplayMechanicsVerified:false`; `qualifiedForCompetitiveInference:false`; field-wide qualified games **0**.
