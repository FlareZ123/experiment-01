# Publicly conditional printed damage: Fan Rotom defeats a nominal-KO Energy heuristic

**Agent 9 | 21 October 2026 | evidence: exact published opponent printing, bundled card text, rulebook and existing pure code inspection. No engine match executed; competitively qualified games: 0.**

## Concrete counterexample

The frozen 2026 Aichi source field records **Fan Rotom SCR 118** in the exact rank-2 Vileplume Control 60 (one copy) and rank-15 Lopunny Vileplume 60 (two copies). These are two of the 29 recovered source 60s; do not infer frequency or win impact from the counts.

The bundled English print `sv7-118` has `Assault Landing`, **one Colorless Energy**, **70 printed damage**, and exact effect text: **"If there is no Stadium in play, this attack does nothing."** Under Advanced Player's Rulebook section **II-D-01**, an attack that does nothing has no damage or effects; printed bonus damage cannot rescue it. Both players' Stadium zones are publicly visible.

The shared `simulation/twinleaf/agent9-actor-immediate-ko-energy.cjs` version v1 proposes an Active Basic Energy if it makes a printed fixed-damage non-GX attack payable and the numerical base damage reaches opposing Active remaining HP. The selector checks payability, public attack restrictions and Basic Energy status. It does **not** read `attack.text` or the publicly observable `ownPublic.stadium` / `opponentPublic.stadium`. Those fields already exist in the detached `actorObservation` representation.

### Minimal falsification case

Construct an owner-root observation, with Fan Rotom SCR118 Active, zero attached Energy, a held Basic Energy, opponent Active on **60 remaining HP**, neither side with a Stadium in play, unspent Energy attachment and no other attack restriction. Version v1 will nominate the held Basic Energy to fund Assault Landing as a purported immediate KO. Its output `projectedBaseDamage=70` is mechanically inconsistent with the printed conditional effect: the attack does nothing in this state. Store acceptance of the **attachment** would not validate the predicted attack damage.

A two-control pure regression should establish:
- No Stadium: fail closed (no nominal-KO intent).
- Stadium present in either publicly visible stadium zone: printed conditional veto cleared and intent may be considered.
- Unknown or stochastic text of the form "this attack does nothing": refuse **deterministic-KO** priority unless the necessary public condition is independently proved.
- The existing rank-11 Mega Absol ex Claw of Darkness native historical case remains unaffected.

This is a conservative score veto for **one class of nominal direct-KO override**, not a global declaration that conditional attacks can never be strategically correct. A 50%-success attack may be best in some losing positions. That requires expected-outcome modeling and a real Store continuation rather than a guaranteed-KO score.

## Suggested narrowly scoped implementation

Inside the actor-visible selector, before considering `attack.damage >= remainingHP`, examine `attack.text`. The precise Fan Rotom Stadium predicate can be evaluated using **only public Stadium occupancy**. For other unknown self-nullifying clauses, defer override pending an explicit parser / rules evaluator. Keep ordinary printed fixed-damage attacks unchanged. Regression should check no mutation of the detached owner view and invariance to hidden opponent hand/deck/Prize substitutions.

This proposed guard has **not** been merged or compiled. Do not count a hypothetical prevented poor attachment as improved game strength. Evaluate on paired original deals and later independently frozen source-first/second strata if the owner integrates it.

## Sources and reproducibility

- `results/aichi-2026/full-decklists.json`: ranks 2 and 15, exact `SCR 118` quantities 1 and 2.
- Bundled `card-list.zip` snapshot: `cards/en/sv7.json`, `sv7-118` `attacks[0]` cost/damage/text.
- `resources/manual/` and supplied Advanced Player's Rulebook §II-D-01; attack `does nothing` is a zero-damage result.
- `simulation/twinleaf/actor-observation-contract.cjs`: `visiblePokemon` includes attack text, `publicPlayer` exposes Stadiums.
- `simulation/twinleaf/agent9-actor-immediate-ko-energy.cjs`: `chooseImmediateKoEnergyIntent` v1 is a one-Basic-Energy, printed-damage heuristic.
- `results/aichi-2026/agent6-generalized-nominal-ko-native-20261021.md`: matched rank11 generic KO funding gain, developmental and historically selected, should be retained as a positive regression.

## Initial implementation status, 21 October

A reusable isolated public-condition helper was committed at `simulation/twinleaf/agent9-public-conditional-attack-guard.cjs` (version `agent9-conditional-printed-damage-priority-v1`). Seven locally replicated Node 22 assertions passed: no Stadium veto, either side's Stadium clearing it, unknown condition veto, coin-tails veto, plain Claw unchanged, and opponent-affecting text unchanged. These were a **standalone replication of the helper function**, rather than a CI run of the repository module, and no native Store game or fully integrated selector decision was tested. A proposed repository `tests/` file and integration edits did not complete; retain the status as unmerged until tested with the actual module and native source continuation.

### Subsequent exact-file test

Exact Git blobs (helper `f6e138d8`, test `23b5cb8e`) were run locally on Node 22 with 3/3 tests passing. This validates the new standalone module; the common game policy remains unchanged and untested with this filter.
