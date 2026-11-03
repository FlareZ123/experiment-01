# Agent 25: rejected Item dispatch contaminates later legal Stadium play in the pinned Store

**3 November 2026 | native original Store action differential | artificial midgame boards | zero qualified games.**

## Why this matters

The exploratory [Dhelmise v2 60](../als/agent25-dhelmise-mixed-lock-answers-v2.json) has one PokéStop PGO 68 Stadium as an alternative random discard outlet. Original Aichi source rank **2** includes Vileplume AOR 3 and Stoutland BCR 122. Original source rank **15** includes Vileplume AOR 3 and Silent Lab PRC 140. Vileplume prevents the playing of Items; Stoutland, if Active, prevents the opponent from playing Supporters. Neither effect prohibits the candidate from playing a Stadium.

An initially mysterious native failure to play PokéStop is attributable to a preceding deliberately invalid Item action. **Do not interpret this as paper Stadium illegality.**

## Constructed Store differential

- Exact pinned Twinleaf commit: **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**. No upstream files modified.
- Candidate Active Dhelmise M5, one attached Psychic Energy, one Shuppet M5 in discard. The candidate's owner hand contains PokéStop PGO, Battle Compressor PHF, and Arven SVI.
- Rank 2 prepared board: original-source Lillipup CEC → Herdier SUM → Stoutland BCR in Active; Oddish UNB → Gloom UNB → Vileplume AOR on Bench.
- Rank 15 prepared board: original-source Bunnelby PRC in Active; identical original-source Oddish/Gloom/Vileplume evolution chain on Bench; original-source Silent Lab PRC in Stadium.
- All other cards are placeholder native fixtures. This is **not** a naturally dealt original-sixty match. All source printings used in the prepared board occur in their respective authenticated original 60s.
- Both candidate seat indices, 0 and 1, were executed. Within each source-rank-and-seat pair, one arm first attempted PokéStop directly. The contrasting arm first deliberately dispatched Battle Compressor despite live Vileplume Item lock, caught the expected CANNOT_PLAY_THIS_CARD exception, and then attempted PokéStop. The rank-2 invalid-first arm also tried Arven after the rejected Item; the second thrown action is not independently isolated as a cause because the Store already experienced the invalid Item.

| Prepared board | Candidate seats | Direct PokéStop without invalid Item first | Rejected Item before PokéStop |
| --- | --- | --- | --- |
| Neutral, no lock | 0 and 1 | **2 of 2 settled Stadium placements** | Not tested |
| Rank 2 Vileplume + Stoutland | 0 and 1 | **2 of 2 settled Stadium placements** | **2 of 2 silent Stadium no-ops** |
| Rank 15 Vileplume + Silent Lab | 0 and 1 | **2 of 2 settled Stadium replacements** | **2 of 2 silent Stadium no-ops** |

A clean native action removes PokéStop from the player's hand, puts it in Stadium and records StadiumPlayedTurn=4. Against rank 15 it removes Silent Lab and restores the discarded Shuppet's Hide 'n' Sneak Ability. These are **genuine printed-card PlayCardAction effects** in the constructed Store; the Stadium's subsequent three-card discard effect was **not** activated.

In the four invalid-Item-first arms, the native Item root raised an expected CANNOT_PLAY_THIS_CARD exception; the test caught the exception and continued using the **same Store**. The later Stadium action did **not throw**, but PokéStop remained in hand, Stadium and turn-use flag stayed unchanged, and no corresponding new Stadium log appeared. The paired clean Store controls distinguish this from ordinary Vileplume/Silent Lab restrictions. The exact internal mechanism of the poisoned dispatch lifecycle remains untraced.

## Evidence and reproducibility

The [research-only ten-arm fixture](../../simulation/twinleaf/agent25-vileplume-pokestop-native-stadium.cjs) returns all ten attempted statuses, retaining unsuccessful arms. The existing manually dispatched [native workflow 41590900592](https://github.com/FlareZ123/experiment-01/actions/runs/41590900592) compiled the pinned original Store and archived [artifact 13210695485](https://github.com/FlareZ123/experiment-01/actions/runs/41590900592/artifacts/13210695485). The ZIP was independently downloaded and decoded:

- ZIP SHA256: 604149ee9a7b7125e001923167d684167df9a1150b32907c850329374718ace1.
- Uncompressed JSON: 16,310 bytes; SHA256: 47129993867acbc567df477b97d9a6a5ed3cd698d3b7ae850c90de4518b4c3dc.
- **Exactly six successful clean placements and four silent no-ops after a prohibited Item.** Both physical seat indices are represented.

The workflow and artifact's successful test stage mean the observations were captured. The JSON deliberately reports allStagedNativeStadiumActionsPassed=false. The original abort-on-no-op runs are retained as [41589323177](https://github.com/FlareZ123/experiment-01/actions/runs/41589323177), [41589737156](https://github.com/FlareZ123/experiment-01/actions/runs/41589737156), and [41590062746](https://github.com/FlareZ123/experiment-01/actions/runs/41590062746) with simpler or earlier fixtures.

## Consequence for research

**Never score or continue a native game after catching a forbidden root dispatch on its live Store.** Reject that arm and restart from a fresh, physically audited state to evaluate any alternative legal action. Legal owner-root preflight or detached clone testing is preferable to sending an invalid action to the source Store in the first place; see [existing AOR Vileplume preflight](../../simulation/twinleaf/agent8-aor-vileplume-item-preflight.cjs).

A future source-level inspection may identify how the dispatched invalid action leaves native state unusable and whether a safe adapter repair is possible. This report makes **no claim that a real paper player may choose an invalid action**, that all caught exceptions have the same effect, or that any full game has been won. It identifies a local native simulation-integrity hazard affecting the interpretation of later legal actions. The Aichi field remains 29/32 original printed sixties and **zero competitively qualified games**, so the 99.5% objective is unverified.
