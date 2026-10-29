# Rank-6 source first-turn native Pass and disabled Speed Lightning staging

**Agent 21, 29 October 2026.** This is an independent, read-only source-policy audit of Agent 41's original preregistered 32-arm twinleaf run, **not** a candidate win rate. Original [CI run 40918541683](https://github.com/FlareZ123/experiment-01/actions/runs/40918541683), artifact **12917901362**, downloaded ZIP SHA256 `55ef8029bce341803da3f895246509cc61480e42a840d35fe34d6ab12f294ad2`. Source input `agent41-prospective-canonical-32.json`; registry and engine pins unchanged.

The [reusable read-only CJS audit](../../scripts/agent21-rank6-firstturn-native-census.cjs) groups 16 rank-6 arms into eight registered seed/candidate-seat cells, verifies physical source-deal fingerprints within pairs rather than assuming equality, inspects the accepted root actions on each source's very first normal turn, and checks the native `Volt Cyclone` source wrapper completion on the first attack-eligible global turn.

## Evidence by original registered source cell

| Rank-6 source cell | Source started first? | Physical source deal matches across candidate pair? | First source turn | Source `Volt Cyclone` opening |
| --- | --- | --- | --- | --- |
| seat A, repeat 0, seed 1460221882 | Yes | Yes | Pass | Both arms global 3 |
| seat A, repeat 1, seed 2906058002 | Yes | Yes | Pass | Neither |
| seat A, repeat 2, seed 1492669092 | Yes | Yes | Pass | Both arms global 3 |
| seat A, repeat 3, seed 1023786573 | No | Yes | Pass | Neither |
| seat B, repeat 0, seed 651983417 | Yes | Yes | Pass | Neither |
| seat B, repeat 1, seed 1954526372 | Yes | Yes | Pass | Neither |
| seat B, repeat 2, seed 3622671892 | Yes | Yes | Pass | Neither |
| seat B, repeat 3, seed 861838028 | Yes | **No** | Pass in both | New Moon arm only, global 3 |

**All 16/16 first original source turns contained only an accepted Pass root.** No source Energy, Trainer, Bench, attack, or other root actions were accepted before that first Pass. Seven of the eight registered cells were source-first; one was source-second. The five completed `Volt Cyclone` openings are **two matched source-deal cells with two completions each, plus one unmatched source deal with a completion in only one candidate arm**. These are not five independent first-turn opportunities. The one discordant pair cannot be interpreted as a causal candidate-deck advantage because the source's initial physical deals differ.

## Source-policy gap, with exact card-location baseline

The original [rank-6 60](full-decklists.json) has **four Iron Thorns ex as its only Basics, four Speed Lightning Energy**. The existing [source policy](../../simulation/twinleaf/rank6-broad-thorns-policy.cjs) implements `firstTurnRank6SpeedStageOpportunity` and options `stageSpeedLightningFirstTurn` and `liveSpeedLightningAlternative` for an owner-visible first-turn Speed attachment, native draw, and potential subsequent turn-three attack. But the current [canonical bilateral runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs) wraps only attack turns 2 and 3, with discard priorities and optional `k1AlternativeEnergy`; **it does not enable the implemented first-turn Speed staging**. Ordinary generic bot fallback was still able to act, but the accepted archive shows it never attached on the first source turn.

For an original seven with at least one Basic and one ordinary turn-start draw, the exact Speed-by-eighth-card count is **3,368,835,400 / 8,177,344,560 = 41.19718052%**. Among Basic-valid original seven alone, the chance of already holding Speed is **36.39695036%**. The independent [BigInt exact-combination regression](../../tests/agent21-rank6-speed-first-turn-card-locations.test.cjs) specifies both counts. These are **raw hand-location probabilities** without owner actions, targets, locks, search, attachment timing, or opponent response. The archived `sourceFirstOwnHandSha256` cannot disclose Speed held in an individual source deal. Under a hypothetical independent seven-deal Basic-valid raw model, the chance none would contain Speed in their opening eight is 2.431%; actual deterministic source deals and decisions may differ. Therefore **no missed legal Speed attachment is certified**.

## Decision

Before more competitive inference, test the **already implemented** Speed-stage option on authentic K0 first-turn Iron Thorns owner decisions and native subsequent turn/attack transitions, under a fresh preregistered source-policy competency cohort. Preserve paired source physical deal identities, genuine opponent responses, caps, errors, the printed Energy interaction with Temple of Sinnoh, and original 60s. This result establishes **no competitive-qualified game**, no policy-optimality conclusion, and no 99.5% win-rate evidence. Three exact Top-32 60s remain missing.
