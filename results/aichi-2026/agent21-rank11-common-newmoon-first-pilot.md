# Rank11 common-campaign four-arm diagnostic: New Moon opening policy veto

**Agent 21, 18 October 2026. Evidence class: compiled pinned-engine weak-policy diagnostic; zero competitive games qualified.**

## Frozen execution

[Manual CI 39089293026](https://github.com/FlareZ123/experiment-01/actions/runs/39089293026), research revision `b3ed1ac7f0bbe4111c110935639c57aafdc5eda7`, pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Both candidate 60s and the opponent are full printed-source resolver products. Four selected IDs compare unchanged rank1 Shadow Rider reference against provisional New Moon Lockbreaker v1, each in physical seat A and B versus published rank11, under `expanded-action-fidelity-probe-v1`. Experiment uses strict prompt guard, separated per-seat policy RNG, first-draw starting-turn verification, and `decorrelated-slots-v3` seeds shared across the two candidates. Source plan digest: `21fd5c47f6168f127f2e3dcad4b9d42bd79ed0c4b3801b261b5d8d667ef10cbf`.

A downloaded copy of [artifact 12121888221](https://github.com/FlareZ123/experiment-01/actions/runs/39089293026) has ZIP SHA256 `4271395b5fbfa19870e43c5865600f35d0960f0a9eeb18dcd739479176aaa23e`. The CI evidence envelope reports 4 completed source-identity matches, zero internal failures, **four candidate-started-first / zero candidate-started-second**. Physical seat changes did not provide turn-order strata; independently rerun candidate-second openings.

| Candidate | Physical seat | Seed | Candidate attacks observed | Engine terminal winner | Final Prize cards (A/B) |
| --- | --- | ---: | --- | --- | --- |
| Rank1 reference | A | 747246684 | 0 | Candidate | 6 / 6 |
| Rank1 reference | B | 83934472 | Max Geist ×1, Night Watch ×1 | Opponent | 0 / 5 |
| New Moon v1 | A | 747246684 | Solrock Scorching Light ×7; Gengar & Mimikyu-GX Poltergeist ×2 | Candidate | 3 / 6 |
| New Moon v1 | B | 83934472 | **0** | Opponent | 0 / 6 |

All four engine games passed technical checks. The A-seat engine wins had the rank11 opponent at **zero deck cards** and candidate with ten deck cards, with no winning Prize completion; the results may reflect deck exhaustion and cannot be interpreted as favorable attacking conversion. In the B-seat New Moon game, the challenger executed **zero attacks throughout 50 engine turns** despite later playing Mewtwo & Mew-GX and one Field Blower. A played only the two printed attack names above. **The original selective root attack trace did not establish a Perfection-copy or Horror House-GX/Night Watch resolution.** Later compiled delegated-attack observability work proved that copied attacks may resolve without a root `AttackAction`; absence in this archived trace is therefore inconclusive. The intended defining archetype line remains unqualified. Card names in the aggregate play ledger cannot establish whether an Item was optimally timed or whether an Ability was actually available.

## Inference and next test

The immediate result is a **source-visible policy-execution veto** for interpreting this pilot as a competitive comparison. The New Moon shell's headline ALS has no exposure under the shared experimental bot. The printed source mapping passed, but a strong real player might produce a radically different outcome. Treat its one engine win and one loss as debugging trajectories only.

Next, gate the source rank11 conditional first-turn VIP → Back Order → Forest Seal Stone → Float Stone → Boost Shake sequence using a portable, independently versioned **autonomous opponent policy** (Agent 6's existing adaptive source experiment may supply this). Measure a New Moon first-turn and second-turn response in identical independently dealt source states. Add explicit attack/Pass legal-option probes, and compare the same challenger under the same policy against rank1 reference. Do not silently replace seeds or count paired variants as independent qualification samples.

**Global benchmark remains unchanged:** 29/32 exact opponent inventories, missing ranks 23/25/28; zero independently qualified competitive games. No demonstrated 99.5% deck.


## 18 October addendum: confirmed first-turn decision miss and an exact access ceiling

[Agent 2's source-dealt first-turn VIP counterfactual](agent2-newmoon-real-vip-firstturn-counterfactual.md) verifies that in a **separate candidate-first physical B seed 2809154458**, the unmodified New Moon bot passed while retaining two legal Battle VIP Pass cards and two Bench vacancies. An opt-in policy legally played a physical VIP, then selected Mewtwo & Mew-GX and Gengar & Mimikyu-GX through the actual owner-facing deck-search prompt. The same source deal still produced early Passes after that intervention. This proves one omitted setup action; it does not establish an attacking response or successful matchup.

An exact, narrow independent combinatorial screen quantifies how frequently this specific **direct natural-draw plus both-targets-still-in-deck** route can even be available. The frozen 60 contains four VIP, two Mewtwo & Mew-GX, one Gengar & Mimikyu-GX, fourteen other Basic Pokémon, and thirty-nine other cards (including two Stage-1 Dusclops). Model a random seven-card opening **conditioned on containing at least one Basic**; sample six face-down Prizes and the first turn's mandatory draw without opponent mulligan bonus draws or any search/draw effects. The deck-search targets must both still have at least one copy in the actual deck after those 14 observed or set-aside cards; a VIP must be in the first seven or the first-turn draw.

Using the five disjoint categories `(VIP=4, Mewtwo=2, Gengar=1, other Basics=14, others=39)`, enumerate all valid multivariate-hypergeometric first-seven hands; then condition on the next draw from the 53 remaining cards and six Prize selections from the remaining 52. For one remaining Mewtwo and one Gengar after the first eight seen cards, the probability neither is Prized is `C(50,6)/C(52,6)`; for two remaining Mewtwo and one Gengar it is `[C(51,6)-C(49,4)]/C(52,6)`. Weight by the first-seven and next-draw category frequencies. The exact resulting joint conditional probability is

`503051702979 / 1594692541030 = 31.5453725427%`.

The corresponding probability merely to **see at least one VIP by the first turn** in a valid opener is `479458943 / 1103593454 = 43.4452507182%`. Conditional on seeing VIP, the narrow two-targets-in-deck condition holds in **72.6094843999%** of these deals. An independent 200,000-shuffle seeded Monte Carlo gave 31.5453% for the joint event, agreeing to sampling error.

This is a **necessary-inventory exposure screen for precisely the two-target deck-search route**, not the probability of legal VIP play, an optimal setup, or successful attack. Mewtwo or Gengar already drawn/Benched could permit a stronger alternative with fewer deck targets; conversely insufficient Bench space, Item lock, an inconvenient Active Pokémon, Supporter or Energy contention, and damage/Prize considerations can make the two-target route undesirable. Future first-turn policy claims should report those visible constraints explicitly and test source-real outcomes. No new engine game or qualified competitive result accompanies this mathematical addendum.


### Early resource concurrence against a first-turn Tool Garbodor

The source-tested rank11 policy can establish a Tool-bearing Garbodor before the New Moon player's **first** turn when rank11 starts. The fixed New Moon 60 has four VIP, two Field Blower, six Psychic-providing Energy cards, and 17 Basic Pokémon. Under the same valid-seven plus natural first-draw model above, all of VIP, Field Blower and Energy are disjoint from the 17 Basic cards. Thus a direct first-eight joint screen can be computed by inclusion-exclusion, without multiplying independent marginal probabilities.

For a forbidden subset totalling `k` of those non-Basic resource cards, define
`Q(k) = [C(60-k,7)-C(43-k,7)]/[C(60,7)-C(43,7)] × (53-k)/53`.
This is the conditional probability that the opening seven and first-turn draw **avoid every card** in that subset. The intervening six random Prizes do not alter this draw marginal, by exchangeability.

- **VIP and Field Blower both directly seen:** `1-Q(4)-Q(2)+Q(6) = 5581553/58083866 = 9.6094722758%`.
- **VIP, Field Blower and at least one of six Energy cards directly seen:** `1-Q(4)-Q(2)-Q(6)+Q(6)+Q(10)+Q(8)-Q(12) = 25913413/551796727 = 4.6961882396%`. Here the two different six-card exclusion groups (VIP plus Blower, and Energy alone) are distinct subsets despite having the same `Q(6)` value. Equivalently use the full eight-term inclusion-exclusion over resource group sizes (4, 2, 6).

An independent 250,000-shuffle source-count Monte Carlo gave approximately 9.5542% and 4.7346%, within sampling fluctuation. These direct conjunctions are **neither full first-turn attack probabilities nor access upper bounds once legal searches, deck cycling, attack costs, Board positioning and Supporters are modeled**. They reveal why comparing independent individual-card access marginals obscures the real, compound setup barrier. An actual held Field Blower must also be playable and targeted correctly under the opponent's live lock.
