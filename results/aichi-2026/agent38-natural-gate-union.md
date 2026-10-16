# Agent 38: source-locked Gate/natural turn-two union

**16 October 2026.** Evidence: exact finite-population enumeration, source-derived card counts and independent small-deck regression. This is a **restricted resource-opportunity comparison**, with no asserted matchup wins or execution-policy fidelity.

## Question

The [Radiant Eternatus Item-route model](radiant-opening-and-prizes.md) and the [ordinary turn-two evolution model](agent43-natural-t2-evolution.md) calculate different early Shadow Rider setup opportunities. Their events overlap on the same physical shuffles. Summing the two marginal probabilities overstates the combined resource event.

How often does an accepted seven-card opening, six random inaccessible Prizes, one normal first-turn draw and one normal second-turn draw provide **either** route?

- **Gate:** A safe non-Radiant, non-Wobbuffet Basic was in the seven to start Active; Radiant Eternatus was in the opening seven or first-turn draw, or could be reached by Mysterious Treasure/Quick Ball while in deck, or by Hisuian Heavy Ball while Prized. At least two Shadow Rider Calyrex VMAX remain searchable in the deck at Gate time.
- **Natural:** A Shadow Rider Calyrex V was among the opening seven and first-turn draw, and at least one Shadow Rider Calyrex VMAX among those plus the second-turn draw. The V is assumed to be placed by the end of turn one and eligible to evolve on turn two.

These resource events represent **alternative possible choices on the same deal**. The calculation does not presume a player can execute both lines in one game. It conditions on an opening seven with any Basic.

## Exact source-counted results

| Candidate | Gate opportunity | Natural T2 opportunity | Overlap | Either opportunity |
| --- | ---: | ---: | ---: | ---: |
| Aichi rank-1 champion | 50.659438% | 18.257322% | 8.238561% | **60.678199%** |
| Hood Shield v1 | 50.659438% | 23.014369% | 10.439333% | **63.234474%** |
| Temple v1 | 44.971598% | 17.992029% | 6.327695% | **56.635931%** |

Hood improves this restricted union over the champion reference by **2.556274 percentage points**; Temple trails it by **4.042268 percentage points**. Such arithmetic says nothing definitive about which deck will win more games. Opponent locks, energy, attacks, Bench occupancy, support draw and losses of other resources could reverse strategic preferences.

The **overlap** is substantial, which means adding the individual Gate and natural probabilities is invalid. These are correlated routes. Against the champion source, naive summation gives approximately 68.916760%, while the exact either-route opportunity is 60.678199%.

### Source categories

The exact category order is:
Radiant Eternatus / Mysterious Treasure or Quick Ball / Hisuian Heavy Ball / Shadow Rider VMAX / Shadow Rider V / safe other Basic / Wobbuffet PHF 36 / all other cards.

| Fixed deck | Category counts | Starting-eligible Basics |
| --- | --- | ---: |
| Champion | [1,5,1,4,3,10,0,36] | 14 |
| Hood v1 | [1,5,1,4,4,9,0,36] | 14 |
| Temple v1 | [1,5,1,3,4,9,1,36] | 15 |

The source-guarded [enumerator](../../scripts/agent38-natural-gate-union.cjs) derives these counts from the actual checked-in fixed deck manifests using the bundled English card-stage index. Hood's Basic count uses the [corrected source total of 14](agent38-hood-basic-source-audit.md). Temple distinguishes the one Wobbuffet from safe Basics: its Active Bide Barricade suppresses Radiant Eternatus's non-Psychic Ability, so a start with Wobbuffet but no other safe Basic is excluded from the direct Gate route. This matches the narrower [Agent 42 self-lock study](agent42-radiant-starter-tradeoff.md) rather than inflating Temple's Gate chance.

## Reproducible method

For each unordered seven-card opening category allocation, enumerate every six-Prize category allocation, then every possible category of the first ordinary draw. Weights are exact integers using binomial coefficients and actual remaining multiplicities. The final second draw is marginalized analytically:

- If V was seen by the end of T1 and VMAX is already in hand, every next-draw category preserves the natural opportunity.
- If V was seen and no VMAX is yet in hand, exactly the number of VMAX left in the drawable deck supplies the required next-turn VMAX.
- If no V was seen, the natural event is absent.

All weighted events use the same denominator. Compute the union as Gate plus natural minus their **joint** overlap. The engine outputs BigInt integer numerators and denominator strings to support independent auditing, along with human-readable probabilities.

A completely separate [eight-card physical-permutation regression](../../tests/agent38-natural-gate-union.test.cjs) enumerates all 40,320 orderings in each of two tiny scenarios, one with an Active-locking Wobbuffet category and one without; it independently tests Gate, natural, overlap and union. Additional regressions check source manifest categories and individual components against existing independently calculated results:

- Champion/Hood Gate agrees with [exact 50.659438% Item-route model](radiant-opening-and-prizes.md).
- Temple Gate agrees with [self-lock corrected 44.971598% model](agent42-radiant-starter-tradeoff.md).
- Natural T2 agrees with [source-corrected original model](agent38-hood-basic-source-audit.md).

[Manual statistical CI run 38853194459](https://github.com/FlareZ123/experiment-01/actions/runs/38853194459) **passed** with the additional joint-route regression; the workflow has no per-commit trigger.

## Boundaries and next gate

The search Items are assumed usable without modeling discarded-card opportunity costs. The model assumes no opponent Item or Ability lock preventing their effects, except for the specific forced-Active Wobbuffet Gate self-lock. It excludes alternative card draws, Supporter search, Forest Seal Stone, Benched Pokémon availability, opponent mulligans, strategic choice, card replacement and attacks. Thus the calculated either-route probability is **neither a lower nor an upper bound** on actual early setup probability. A lucky hand can fail due to unmodeled constraints; a hand outside these routes can succeed through unmodeled connectors.

The useful next experiment should compare **the actual executed probability of a meaningful VMAX board or attack** under an observation-safe, Expanded-capable policy, instrumenting whether the route was Gate, ordinary evolution, both available, or neither. Preserve separate record of valuable resources sacrificed to activate search and of opponent disruption. The simulator's known live Card aliasing and weak default policy still disqualify raw engine winners from competitive win-rate claims.

**Conclusion:** Combined resource availability favors Hood within these three fixed lists on the stated narrow setup axis. An optimization or final-deck choice requires credible games across the field. The project-wide 99.5% target is unverified.
