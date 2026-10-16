# Agent 35: source-locked rank-2 and rank-10 bounded-game policy diagnostic

**Date:** 16 October 2026 (UTC). **Evidence class:** pinned-engine action and policy diagnostics, not matchup win-rate measurements.

## Fixed comparison provenance

The same immutable campaign plan `22c25a00dc7e51cff54ed93cd9d1111128a3085e20236d10c4b84a09e9d18890`, independent-slots-v2 physical seeds, three published or candidate fixed 60-card inventories, two engine slots each, and a 600-action limit were used.

- **Rank 2, Vileplume Control:** [manual CI run 38845279762](https://github.com/FlareZ123/experiment-01/actions/runs/38845279762), source locked to commit `3d8b743d052eb1da728e554a47adab5fcf754f9c`, artifact `aichi-campaign-diagnostic`, ID `12022408910`.
- **Rank 10, Regidrago:** [manual CI run 38845310012](https://github.com/FlareZ123/experiment-01/actions/runs/38845310012), same repository revision and test conditions, artifact ID `12023057359`.

A separate [Agent 39 combined-rank run](https://github.com/FlareZ123/experiment-01/actions/runs/38845353476) used the same frozen ranks, decklists and seeds. Its matching observations are useful independent execution corroboration, but those repeated deterministic trials **must not be added as independent games or extra statistical sample size**. [Agent 39's action and integrity analysis](agent39-rank2-rank10-policy-diagnostic.md) gives complementary first-turn, Energy-placement and full trial-matrix findings.

Both used a documented opt-in Supporter correction, Double Dragon attachment recovery, separate speculative randomness, trace capture and narrower engine correction hooks. Neither used the experimental `expanded-action-fidelity-probe-v1` profile during these baseline runs.

## Quality screen

| Opponent | Engine games completed | Actual first/second per candidate | Zero candidate attack games | Zero opponent attack games | Empty-deck terminal markers | Independently qualified |
| --- | ---: | --- | ---: | ---: | ---: | ---: |
| Rank 2 Vileplume Control | 6 / 6 | 1 / 1 | 0 | 0 | 0 | 0 |
| Rank 10 Regidrago | 6 / 6 | 1 / 1 | 2 | 0 | 0 | 0 |

All 12 sampled action traces passed the archive's SHA-256 integrity check. No trace covers every prompt and engine action, and the player policies lack competitive qualification. These records cannot certify a winning deck or a win-rate estimate.

## Rank-2 opponent ALS observations

Across the six games, the Vileplume opponent played `Technical Machine: Evolution` on three recorded `PlayCardAction` events, across two game records. **No opponent `AttackAction` had attack name `Evolution`.** In `pilot:2:0:hood-shield-v1:B`, the opponent attached Jet Energy and Technical Machine: Evolution at action ordinals 339 and 340 on turn 56, then the same player's action ordinal 346 was `PassTurnAction`. The public snapshot at that pass contained **Active Bunnelby with Jet Energy and Technical Machine: Evolution attached**. The trace lacks a full legality proof for that exact moment, so this is a targeted decision-policy investigation, not a claim that the bot refused a legal attack.

The source rank-2 list contains two Bunnelby and two Technical Machine: Evolution. The repository already has a staged source-realistic bot fixture proving that an experimental Tool-aware/Bunnelby policy can choose the Evolution attack and resolve its prompts: [Bunnelby TM policy replay](../../simulation/twinleaf/bunnelby-tm-policy-replay.cjs). The original fixed-campaign main function bypassed that opt-in policy wrapper, explaining why this needs a whole-game controlled counterfactual.

## Post-decision deck-target evidence in the exact rank-2 turn-56 pass

To distinguish a missing remaining-deck evolution target from a plausible missed attack, Agent 35 added [read-only TM Evolution pass telemetry](../../simulation/twinleaf/tm-evolution-pass-evidence.cjs) and [four pure tests](../../tests/tm-evolution-pass-evidence.test.cjs). [Manual CI run 38846735893](https://github.com/FlareZ123/experiment-01/actions/runs/38846735893) **passed**. Its `aichi-campaign-diagnostic` archive is artifact ID `12023213750`.

**Key observed fact:** the original `pilot:2:0:hood-shield-v1:B` Bunnelby `PassTurnAction`, ordinal 346, turn 56, had **one eligible Bench evolutionary target**. The recorded target was Benched **Gloom**, and the actual ten-card remaining deck contained **Vileplume AOR**. The Active Bunnelby still held Jet Energy and Technical Machine: Evolution. Thus, a *missing evolution card in deck* cannot explain this particular pass. This is an observation about card inventory and payment; a complete legal-action proof must still consider applicable effects and the precise evolution-attack resolution.

**Trace noninterference check:** All six rank-2 trial records repeated with identical source-locked identities and unchanged ordered meaningful action signatures (action ordinal, selected action, played card, attack name) after telemetry was added. The extra evidence was gathered only after the bot selected its pass, so it supplied no decision input. The SHA-256 trace hashes changed because additional read-only fields were recorded, but the physical actions did not change. Only one of the six games produced a TM Evolution-equipped Active pass, this exact Hood/B observation.

**Important distinct concern:** the existing opt-in Bunnelby Evolution tactical gate scans the *true remaining deck* to decide whether it contains evolution targets. Before the first deck search (K0), that knowledge can reveal which cards are Prized. The [separate information-set characterization](../twinleaf/bunnelby-k0-prize-partition-observation.md) documents this source-level issue. It does not imply K0 was active on turn 56.

## Rank-10 opponent attack observations

Regidrago VSTAR was played in all six opponent traces. `Apex Dragon` was observed in **four of six** games, totaling **ten attacks**. The remaining two opponent trajectories used other attacks, including Koraidon ex and Budew. Recorded Double Dragon Energy plays totaled nine, distributed across five of six games. These events demonstrate partial archetype expression under the current generic bot, without establishing what actions were available but unchosen.

The champion reference and Temple candidate each had one zero-attack game as the first-acting candidate. Each nevertheless recorded multiple Shadow Rider Calyrex VMAX and Psychic Energy `PlayCardAction` events. The pass-board audit confirms VMAX turns with no Energy attached and Energy on other Pokémon. This motivates positioning and attachment policy review; the published printed-Basic-Energy cost audit cannot certify actual attack feasibility under all effects.

## Controlled follow-up enabled

Agent 35 added an explicit `researchPolicyProfile` to each fixed-trial record and the parent archive, with validation of the two permitted labels. The manual [bounded-game workflow](../../.github/workflows/aichi-first-game.yml) now offers `expanded_action_policy`, default false. When true, the existing [expanded action wrapper](../../simulation/twinleaf/policy-profiles.cjs) is applied around exactly the same `runMatch` call, including Tool-aware attacks, Bunnelby Evolution, Temple response, and prompt fallback. This is experimental and shared by both seats. It preserves the original candidates and seeds while clearly separating policies. A regression rejects invented policy labels and checks all six identities.

[Expanded rank-2 replay run 38845878919](https://github.com/FlareZ123/experiment-01/actions/runs/38845878919) **completed successfully**, archived as artifact `aichi-campaign-diagnostic` ID `12022209933`. It retained the same three candidates, six physical trial IDs, deck fingerprints and independent-slot-v2 seeds. All six were `completed-engine-game` with `researchPolicyProfile=expanded-action-fidelity-probe-v1` (the baseline predates the explicit profile label and ran the fixed core).

### Exact rank-2 full-game policy contrast

The table describes recorded attacks in baseline → experimental runs. These are action counts in six deterministic paired counterfactual trajectories, not independent game wins.

| Candidate / engine slot | Candidate attacks | Opponent attacks | Opponent TM: Evolution attacks | Recorded engine winner changed? |
| --- | ---: | ---: | ---: | --- |
| Champion / A | 11 → 12 | 2 → 1 | 0 → 0 | Yes |
| Champion / B | 6 → 3 | 8 → 3 | 0 → 0 | No |
| Hood / A | 2 → 2 | 1 → 1 | 0 → 0 | No |
| Hood / B | 4 → 1 | 13 → 5 | 0 → 0 | No |
| Temple / A | 3 → 3 | 4 → 4 | 0 → 0 | No |
| Temple / B | 17 → 11 | 3 → 7 | 0 → 0 | Yes |

**Negative conversion finding:** Both baseline and experimental ranks show **zero TM Evolution attacks by the Vileplume opponent across all six games**, even though the experimental bot is equipped with the tested Tool-aware/Bunnelby extension. In the baseline Hood/B game the opponent played two Technical Machine: Evolution and passed later with Active Bunnelby and Jet Energy; in the experimental counterpart its actions diverged much earlier and it did not play that Tool. The original turn-56 state was therefore not recreated, so this contrast does not prove whether the new policy would choose Evolution from the original exact board. The expanded wrapper changed early choices for both seats; engine winners differ in two games, without competitive interpretability.

**Next isolate:** reconstruct the original decision-state from a source-preserving replay or stage that full public/hidden state, then compare the exact generated action and its legality with and without the opt-in tactic. Validate whether the remaining deck had eligible Pokémon to evolve and whether any other effects prevented the move. Merely attaching the Tool and sufficient Energy does not establish a fully legal target in the actual state.

## Next actions

Inspect whether the experimental rank-2 run actually chooses the `Evolution` attack with the Active Bunnelby + Tool + Energy condition, and isolate any differences in real Store actions from altered starting hands or search order. If it does, retain a small first-class regression from that exact observed decision state. Independently verify Regidrago's two non-Apex trajectories with actual Energy and discarded Dragon attack options before interpreting them as policy mistakes. Preserve all 12 baseline games as unqualified engine diagnostics.
