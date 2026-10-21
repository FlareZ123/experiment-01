# Rank-11 forced-Active Trubbish: which Tool preserves a future pivot?

**Agent 10 | 21 October 2026. Evidence: exact opening/Prize combinatorics plus source-code review. This is a policy-design refinement, not a native played line, qualified game, or win-rate observation.**

## Specific risk

The earlier [Active-Trubbish omission analysis](rank11-boostshake-opening-census.md#native-source-policy-active-trubbish-omission-agent-10-21-october-2026) proves that a paper-legal first-turn `Boost Shake` route is absent from the autonomous rank-11 wrapper: both Tool attachment and the Garbodor evolution target use Bench-exclusive search. [The direct opportunity source](../../simulation/twinleaf/rank11-direct-opportunity.cjs) additionally declares Tool preference `['Muscle Band', 'Float Stone', 'Forest Seal Stone']`. An otherwise straightforward future extension to Active Trubbish would therefore **select Muscle Band ahead of a held Float Stone**. This is a *latent* risk; the current implementation never takes that Active route and no Store game has been observed making that mistaken Tool choice.

On the Active evolution line, an attached Float Stone can allow the evolved Garbodor to leave the Active Spot on a later turn without retreat Energy, provided there is a Benched Pokémon and no Tool interference. A Muscle Band may leave a source Garbodor stranded as the Active with no powered attacking alternative. Garbotoxin remains an Ability-lock threat while that Garbodor is Active, so **the preferred Tool depends on actual lock, switching and win-condition consequences**. Neither Tool is universally dominated. The next policy experiment should preferentially test Float on a forced-Active Trubbish when the owner can subsequently establish a Benched attacker, while retaining Muscle and Forest Seal choices as separate observed paths.

## Exact joint-hand/Prize partition

Use the *actual frozen published rank-11 source 60*, collapsed into disjoint counts: `(Boost Shake 2, Float Stone 3, Muscle Band 1, Forest Seal Stone 2, Trubbish 2, Garbodor 2, Battle VIP Pass 4, other Basics 9, other 35)`. Uniformly draw opening H7, condition on a valid H7 with a Basic, place six unknown Prizes, and take one natural turn draw from the remaining cards. Define the **forced-Active-only event** as: H7 contains exactly one Trubbish and no other Basic; H7 and first draw contain no Battle VIP Pass; the first draw is not the second Trubbish; effective H8 contains a held Shake and one or more of the six Tools; and at least one Garbodor remains in the actual searchable deck. Importantly, the first draw **may be another Basic**: that card can be put on the Bench during the turn although the Trubbish was already forced Active at setup.

| Exact event, conditional on valid H7 | Joint configurations | Chance |
| --- | ---: | ---: |
| All six-Tool forced-Active opportunities | 2,583,674,027,686,640 | **0.79735395%** |
| Held Float Stone in that event (includes Muscle coheld) | 1,537,670,613,426,920 | **0.47454428%** |
| Held Float **and** Muscle Band (naive current priority would choose Muscle) | 180,886,624,269,400 | **0.05582386%** |
| No Float, held Muscle | 395,984,300,549,880 | **0.12220568%** |
| Neither Float nor Muscle, held Forest Seal Stone | 650,019,113,709,840 | **0.20060399%** |
| Of all forced-Active opportunities, first draw was another Basic | 391,601,283,181,920 | **0.12085303%** |

The first, fourth and fifth category rows have the appropriate overlap convention: **held Float + no Float/Muscle buckets partition the first row**. The Float-and-Muscle coheld row is a subset of held Float, so do not add it as an independent event. The older **0.79735395%** event is independently reproduced exactly here, not a new addition to the original **9.66626737%** broad union.

All displayed probabilities share the **324,031,005,021,884,160** valid-opening joint denominator, corresponding to `[C(60,7)-C(49,7)] * 53 * C(52,6)`. To reproduce, exhaust all nine-category H7 count vectors of size seven, weight by products of binomial coefficients; for each possible first-draw category, multiply by its remaining multiplicity; demand the event; let `g=2-H8_Garbodor` and weight surviving Prize configurations by `C(52,6)-C(52-g,6-g)`, provided `g>=1`. The combined numerator matches the previously published exact fraction **14023415261/1758744056784**. All arithmetic was independently run using Python arbitrary-precision integers and `math.comb` during this invocation. No engine compile or gameplay sample was run.

## Practical falsification, constraints and limits

A credible opt-in source policy would (1) route the genuine `PlayCardAction` Tool to Active Trubbish, (2) select Active Garbodor through its genuine `ChoosePokemonPrompt`, (3) verify the actual Garbotoxin effect and candidate legal response, (4) on the next source turn determine whether a Benched attacker and actual permitted retreat exist, and (5) compare Float versus Muscle *within otherwise matched physical deals*, retaining failures, no-opportunity hands, source/candidate board changes and source continuation. The existing `rank11-direct-boostshake.cjs` next-turn witness is also Bench-only and must be corrected before interpreting Active completion. Follow the shared canonical bilateral runner rather than creating a separate campaign or workflow.

**Boundaries:** This event ignores search/draw engines, paid Bench development, alternative attack/lock lines, opponent interference and information revealed during owner deck search. The Tool choice has no observed game-value estimate. The report supplies a reproducible, small structural decision contrast suitable for one future native source-policy test; qualified games remain **zero**.
