# Original Aichi rank-19 Float Stone mobility: matched native Prize/attack tempo proof

**2 November 2026 | Agent 50 | Historical developmental comparison. No competitively qualified games.**

## Headline

On four authentic printed rank-19 Raging Bolt source/candidate historical games, enabling the **existing source-only Float Stone mobility decision** did not change which side the pinned Twinleaf simulator declared the winner. In two exact original-source physical deals where Raging Bolt and ADP were already Benched, however, the mobility-enabled source physically attached Float Stone to its Active Ho-Oh EX, retreated into **Arceus & Dialga & Palkia-GX (ADP)**, and began a native-settled Ultimate Ray attacking line **on the same turn**. This yielded five settled attacks against the champion-reference and seven against New Moon. Those attack lines converted real native Prize cards and ended the two games sooner. The remaining two source-seat-1 games had no relevant funded Raging Bench opportunity; their control and treatment outcomes were identical.

**The source's zero Raging Bolt Active roots were an inadequate proxy for source competence.** The source visibly chose a different funded Dragon attacker and could take Prizes with it. Whether ADP was the *best* tactical choice is unproven. Neither its native terminal winner nor a six-Prize finish is a qualified paper competitive result.

## Frozen scope and identity controls

- **Original source:** authenticated Aichi Open League 2026 rank-19 Mark Takahashi printed 60 from `results/aichi-2026/full-decklists.json`, including Raging Bolt ex TEF, Ho-Oh EX DRX, Arceus & Dialga & Palkia-GX CEC, Float Stone BKT, and Double Dragon Energy ROS. No added card or changed source printing.
- **Opponents:** same two frozen printed 60s, `champion-reference` and `new-moon-lockbreaker-v1`; each tested in both original registered candidate seat A and seat B.
- **Game engine:** pinned Twinleaf submodule revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, existing canonical `simulation/evaluation/agent41-bilateral-v2-development.cjs`, frozen `agent41-frozen-bilateral-development-v2.json` profile. Native Store makes the actual legal-action/prompt/effect/turn transitions.
- **One experimental difference:** original frozen v2 control versus treatment with `sourceFloatStoneMobility:true`; all other policy flags, source/candidate decks, registered seat, trial, and seed held fixed. The opt-in affects only the original source seat, leaving candidate behavior frozen. Read-only observers do not determine actions.
- **Deal parity:** all four control/treatment pairs had identical SHA-256 fingerprints of the **initial source physical deal**. The runner verifies same registered seed, trial ID, candidate ID, physical source seat, and valid digest. This is *initial-game* parity; a subsequent native sudden-death replay, if any, requires separate epoch matching.
- **No prospective evaluation:** these are previously selected and inspected historical source matches, reused exactly to diagnose an identified policy failure. They cannot estimate population win rate or out-of-sample efficacy.

## Actual native control and treatment results

| Registered trial | Control source attacks and first attack | Treatment source attacks and first attack | Source Prizes taken, control → treatment | Last global turn, control → treatment | Source native winner changed? |
| --- | --- | --- | --- | --- | --- |
| Candidate A, champion | 2 × Motivate, turn 3 | 2 × Motivate, turn 3 | 0 → 0 | 14 → 14 | No, source loses both |
| Candidate A, New Moon | 3 × Motivate, turn 3 | 3 × Motivate, turn 3 | 0 → 0 | 18 → 18 | No, source loses both |
| Candidate B, champion | 0 attacks | 5 × Ultimate Ray, turn 14 | 0 → 6 | 31 → 22 | No, source wins both |
| Candidate B, New Moon | 7 × Rainbow Burn, turn 36 | 7 × Ultimate Ray, turn 16 | 6 → 6 | 48 → 28 | No, source wins both |

All above attacks are **actual native Store declarations with completed prompt-chain settlement** according to the canonical `sourceAttackSettlement` packet. Each of the **29 declarations** (2+2+3+3+0+5+7+7, including duplicated unchanged A-trial arms) was settled, with **zero cross-epoch settlement rejections**. The source's native winner was unchanged in all four pairs, so there is no observed game-winner improvement in this experiment.

In the champion seat-B treatment, native public Prize counts at the five completed Ultimate Ray attacks were **6 → 5 → 5 → 3 → 3 → 0 remaining**. Public opposing Active board transitions include KO/promotion of Mimikyu, then Dialga-GX, then Trevenant & Dusknoir-GX. In the New Moon seat-B treatment, seven settled Ultimate Rays changed source Prizes **6 → 5 → 5 → 3 → 3 → 1 → 1 → 0 remaining**. These counts are physical native Store outcomes after attack/prompt resolution. No amount of repeated attack declarations alone is being credited with Prizes.

The champion seat-B **control** was marked winner source seat 0 at global turn 31 with both sides still showing six Prize cards and a surviving opponent Mimikyu. That is a native non-Prize game resolution, not evidence of offensive superiority. The match lacks independently qualified tournament-clock and opponent-policy checks. In seat-B New Moon, the control did eventually take all six Prizes, but its Rainbow Burn offense began **20 global turns later** than the treatment's Ultimate Ray line.

## One physical game episode per matched arm

The separately audited [native source-deal epoch run 41412376524](https://github.com/FlareZ123/experiment-01/actions/runs/41412376524) reports **zero native sudden-death clock resets in all eight arms**, exactly one captured opening deal per arm, and `allEpisodeOpeningsCaptured:true` throughout. The original-source initial-deal SHA-256 was exactly matched within each of the four control/treatment pairs. The source seat 1 deal fingerprint was `468375196c3aee61fcff2b1ff91913baa6e6f1fa2dc5f812c5b444ecc54d4947` and the source seat 0 deal fingerprint was `a8b7f01f438eb90121a148941c9b06c2f11b8ae4a428793ea2702c1b02c0257d` in both arms. The same source initial deal appears against two different fixed candidate decks per seat; this does **not** imply that opponents had the same initial cards across those different printed 60s.

This rules out a native reset/new-deal interpretation of the observed paired Ultimate Ray attack and Prize transitions. Paper clock, competent opponent policy, card-effect fidelity beyond the bounded receipts and external generalization remain separately unverified.

## Mechanistic cause, including target decision

Real source owner roots, in each of the two candidate-B games, show:

| Encounter | Float Stone PlayCardAction | Selected RetreatAction | After native RetreatAction |
| --- | --- | --- | --- |
| Champion reference | Turn 14, root ordinal 73 | Turn 14, ordinal 74 | Active ADP GX CEC, **2 Double Dragon Energy**, source `retreatedTurn=14` |
| New Moon | Turn 16, root ordinal 98 | Turn 16, ordinal 99 | Active ADP GX CEC, **2 Double Dragon Energy**, source `retreatedTurn=16` |

Immediately before native retreat: Ho-Oh EX DRX Active, **zero Energy**, Float Stone physically attached, `retreatedTurn=0`, Raging Bolt ex TEF still Benched with **one Double Dragon Energy ROS**. The native Store afterward was `GamePhase.PLAYER_TURN` with the same source player active and no unresolved prompt. The following native action was an accepted **Ultimate Ray** declaration on that same turn; the source repeatedly attacked in later turns.

The existing `simulation/twinleaf/agent1-owner-float-stone-mobility.cjs` recipient heuristic ranks funded Bench targets by raw **count of attached Energy cards**. ADP's two DDE cards therefore outrank Raging Bolt's one DDE card. This explains which recipient the planner proposed and which the native Store promoted. There is no evidence that promoting Raging Bolt instead would have been better: Bellowing Thunder's damage depends on Basic Energy cards that can actually be discarded, ADP provides a fully payable attack line, and matchup-specific Prize routes matter.

The baseline policy had already carried Float Stone through many owner roots without equipping Ho-Oh (12 and 23 funded-Ho-Oh roots with the card held, respectively). The treatment had one held-Float root and one attached-Float root in each relevant game. **Owner roots are repeated decision points, not independent trial counts.**

## Validity repairs and safeguards

**Attached Tool telemetry bug.** The old original-source observer read `owner.active.tools?.cards`, which silently produced zero attached Tool observations. In the pinned native Store, `PokemonCardList.tools` is a direct array. The observer now reads `owner.active.tools.map`, and `tests/agent50-rank19-native-original-tool-census.test.cjs` covers an actually attached Float Stone. Old zero-attached-Tool source census claims are superseded.

**Native Bellowing payment fixture correction.** An earlier staged Agent 50 Bellowing test populated `PokemonCardList.energies.cards` but failed to put the **same object** in the owning slot's `PokemonCardList.cards`. That fixture was malformed. `tests/agent50-raging-bolt-nominal-ko.native.test.cjs` now shares physical Energy objects across both indices, explicitly resolves the genuine owner `DiscardEnergyPrompt`, and verifies **90 → 160** opponent damage, one physical Basic Energy discarded, and unchanged Prizes in both native seats. [Compiled passing run 41408734499](https://github.com/FlareZ123/experiment-01/actions/runs/41408734499) provides the positive fixture. It is *not* a match-level Bellowing payoff proof; Raging never became Active in these four matches.

**Native physical source/decision integrity.** The paired runner retains the exact original-source initial deal SHA, source seat, native Store action ledger, source-only pre- and post-retreat owner board, public Prize counts, and full canonical settled public attack packet. Every native error, action cap and engine terminal stays in the output. The 60-card lists are unchanged. The optional manual workflow is isolated from regular push CI.

## Evidence, reproduction and limits

- [Actual selected Float Stone, ADP promotion and repeated Ultimate Ray, CI 41410643575](https://github.com/FlareZ123/experiment-01/actions/runs/41410643575).
- [Original-source final Prize counts, CI 41411334324](https://github.com/FlareZ123/experiment-01/actions/runs/41411334324).
- [Complete native prompt-closed source damage/Prize settlements, CI 41411910323](https://github.com/FlareZ123/experiment-01/actions/runs/41411910323).
- [Original control/treatment matching physical deals and Tool correction, CI 41409207827](https://github.com/FlareZ123/experiment-01/actions/runs/41409207827).
- Source: `simulation/evaluation/agent50-rank19-float-stone-paired-development.cjs`; tests: `tests/agent50-rank19-float-stone-paired-development.test.cjs`, `tests/agent50-rank19-native-original-tool-census.test.cjs`, `tests/agent50-raging-bolt-nominal-ko.native.test.cjs`.
- Read-only native source: `simulation/twinleaf/agent28-rank19-native-source-root-readonly.cjs`; main canonical comparator `simulation/evaluation/agent41-bilateral-v2-development.cjs`; optional execution: `.github/workflows/aichi-dusclops-self-ko.yml` with `rank19_mobility_compare:true`.
- Historical detailed reasoning, failure diagnosis and exact source root ledger: `results/aichi-2026/agent50-rank19-original-source-float-mobility-negative-20261102.md`.

**Qualification:** The frozen candidate opponent policy is developmentally incomplete; source/candidate effects are still under independent paper-rule audit; the 25-minute paper Expanded clock and end-of-time procedures have not been qualified. Historical selected deals are unrepresentative of the full metagame. The simulator's engine terminals and displayed winners therefore remain **unqualified**. There is no evidence of 99.5% field win rate, no new final 60-card nomination, and no promotion of either source policy to the shared default. The field still has 29/32 authenticated original opponent 60s, missing ranks 23, 25, and 28.

**Next decision-changing comparison:** Test a properly owner-visible *attack-aware Bench promotion objective* against the same physical sources, with explicit payoff for ADP's Ultimate Ray, Basic-Energy-dependent Bellowing Thunder, relevant GX attack usage, relevant opposing damage/Prizes, post-promotion payment and reply, and an independently recorded hard matchup. A purely Raging-Bolt-prioritizing swap would be an unsupported overfit.
