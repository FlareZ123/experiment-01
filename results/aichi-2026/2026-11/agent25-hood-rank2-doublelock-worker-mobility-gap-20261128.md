# Hood Shield candidate-policy blind spots: rank-2 double-lock mobility

**Evidence class:** paper card-text + pinned native source / frozen candidate-worker branch inspection. **No compiled post-fix native run, no completed game, and no win-rate inference.** This is an actionable tactical failure in a policy that has already been implemented, not proof that any alternative fixed 60 is competitively superior.

## The decisive position this policy must represent

A structurally reachable, **conditional** public position after Aichi rank-2 Vileplume/Stoutland's Guzma line:

- Opponent: **Stoutland BCR 122** Active (140 HP, Sentinel Supporter lock), **Vileplume AOR** Bench (Item lock active); neither side has Tool or Ability suppression in effect.
- Hood candidate: **Basic Shadow Rider Calyrex V CRE 74** Active with zero Energy, **Shadow Rider Calyrex VMAX CRE 75** ready on Bench, a separate Bench Pokémon V with an empty Tool slot; **Latias ex SSP 76** not on the Bench; **Forest Seal Stone SIT 156** in hand, VSTAR unused, **Float Stone BKT 137** still in the deck. Bench, energy, evolution timing, and resources are assumed valid.
- Existing Item and Supporter routes cannot play through the simultaneous locks, but **Tools, Pokémon V's Tool-granted Star Alchemy VSTAR Power, and a paid/free retreat** remain allowed absent a separate blocker. Forest Seal Stone -> Star Alchemy -> Float Stone -> attach Float to stranded Active -> free retreat into the VMAX is a real card-text route, **not** a guarantee it can be performed in an arbitrary game.

If the Benched VMAX already has **five Psychic Energy** and Stoutland remains on 140 HP with no relevant damage-modifying effects, `Max Geist` is `10+5*30=160` to Stoutland, which has 140 HP and no Psychic Resistance in pinned `stoutland.ts`. Promoting that VMAX creates a conditional immediate KO removing the Active-dependent Sentinel lock. **Do not confuse this explicit 5-Energy strategic state with Agent25's earlier native test staging, which initially has only one Energy on its VMAX**; the latter currently tests the escape mechanism, not this KO. Opponent retaliation and full game outcomes remain unknown.

## Three separate frozen-worker failures

1. **Forest Seal Stone root path never qualifies.** In PR #95's frozen worker blob `bd08b9bdb6207d8950027584f7524bb3336eb047`, `stoneSearchNeed(view)` checks only missing VMAX, Regidrago/Mimikyu counter, or low Psychic Energy. A pre-established VMAX plus five Psychic plus opponent Stoutland satisfies none. Therefore `scoreTrainerPlay(Forest Seal Stone)` becomes `-Infinity` and the later Star Alchemy root branch is also refused. The held card's legal connective route is invisible.
2. **Star Alchemy retrieval fails to value Float Stone.** Even if a future root fix activates Star Alchemy, `searchCandidates()` delegates to `searchNeedScore()`, which has no Float Stone line under `effectName='Star Alchemy'`. Float Stone scores `0`, while `Latias ex` scores `65` when absent, and `Psychic Energy` scores `5` when total Psychic is at least five. Searching Latias can be an **equally valid or superior escape** when it can be Benched and its Skyliner remains live, but it is not a universal substitute when Bench is full or Ability suppressed. Existing root-policy scarcity checks can also prefer attaching a Psychic to the stranded Active over playing an escape connector.
3. **Basic recognition for Skyliner is structurally false.** `freeRetreatKnown(view)` uses `active.printed.subtypes.includes('Basic')`. The actual pinned `actor-observation-contract.cjs` builds that field from `pokemon.subtypes??[]`; the pinned `PokemonCard` base class does **not** define subtypes, and `ShadowRiderCalyrexV` sets numeric `stage=Stage.BASIC` but not `subtypes`. At pinned SHA `a9905a76...`, `Stage.BASIC=2`. Thus a native Basic Shadow Rider V projects `printed.subtypes=[]`, so the frozen worker fails to recognize even a **live unsuppressed Skyliner** for a legal free retreat, and `chooseRetreat()` is gated off. This does not assert the native RetreatAction itself is illegal; the missing decision is a policy bug.

These are **exact, source-localized mismatches**, not measured match losses. Stage recognition may also affect other opposing matchups and individual Basic targets, not just rank 2.

## Bounded successor correction

The current candidate-policy release is frozen for the authorized first PR #104 Underworld Door no-game witness. Do **not** modify that frozen worker or interfere with the single CI gate. The approved successor owner (Agent46, with Agent31 review) has been sent both concrete issues:

- [Forest Stone root/search failure](../../../communications/agent46/2026-11/20261128T1304Z_agent25-rank2-lock-escape-candidate-vstar-policy-gap.md)
- [Numeric Basic Stage / Skyliner failure](../../../communications/agent46/2026-11/20261128T1306Z_agent25-candidate-basic-stage-skyliner-always-false.md)

Suggested narrow implementation: make a public `lockedMobilityNeed(view)` predicate (both locked, no currently free/paying retreat, a valuable Bench successor, Tool/VSTAR eligible, no known effect suppression); consult it both when playing Forest Seal Stone and when choosing a Star Alchemy search target. A still-decked and usable Latias ex may be the best target with a free Bench slot and unsuppressed Skyliner, else a still-decked Float Stone with a legal Active Tool slot; never infer unknown Prize locations from K0. Prioritize escape and same-turn KO above insignificant one-Energy Active attacks when a powered Bench attacker is available. Use the actual *pinned* native Stage enum (`Stage.BASIC=2`) instead of the absent synthetic subtype, or provide a properly typed/public `isBasic` observation in a coordinated protocol release. Add matched negatives: Latias already live, exhausted VSTAR, Tool lock/Jamming Tower/Tool Jammer, no replacement attacker, full Bench, inaccessible Float Stone, and evolved Active.

## Executable proposed decision correction — native-offered lethal retreat

The strongest correction is not merely replacing `active.printed.subtypes.includes('Basic')` with `active.printed.stage===2`. **The genuine typed native action frontier has already checked whether a retreat action is legal**, including actual cost, Ability/Tool suppression and Active retreat restrictions. In a candidate owner-root decision, the worker can evaluate the **existing offered `retreat` actions** directly using the actor-visible target index/printing and attack prospects. A separate synthetic `freeRetreatKnown` prerequisite risks false negatives and duplicates native semantics. Keep a source-bounded strategic score and check any required Energy/attack state separately, not native-retreat legality twice.

To make this actionable without altering frozen PR #95, a research-only two-seat tactical discriminator and eleven local `node --test` cases are committed on Agent25's branch:

- [Narrow actor-only, native-offered Stoutland lockbreak helper](https://github.com/FlareZ123/experiment-01/blob/agent25/rank2-duplicate-gust-target-20261128/simulation/evaluation/2026-11/agent25-native-offered-lethal-retreat.cjs) (commit `606fe0f4`)
- [11-case deterministic no-engine contract tests](https://github.com/FlareZ123/experiment-01/blob/agent25/rank2-duplicate-gust-target-20261128/tests/2026-11/agent25-native-offered-lethal-retreat.test.cjs) (commit `4910fd82`)

**Local result:** 11/11 pure Node tests passed on 2026-11-28, covering both physical seats, exactly-five/only-four Psychic damage boundary, unpaid attack cost, absent real retreat token, wrong target/index, role/seat/prompt mismatch, wrong opponent, missing Vileplume, uncertain Stadium/Tool/status, and stable tie-break. The helper only selects an already-offered legal retreat into a 3+ Psychic VMAX where total original Basic Psychic Energy is 5+ and Max Geist's printed damage floor is 160 against Stoutland's 140 HP. It *does not* establish native Store game-state generation, worker-integration/audit compatibility, all defensive damage modifiers, a KO actually taken, or a field win. Treat it as an executable test case and a **proposed source-local successor patch**, not a merged candidate policy or a benchmark admission.

## Native execution boundary

The original rank-2 original-sixty staged causal tests live at [Agent25's branch](https://github.com/FlareZ123/experiment-01/blob/agent25/rank2-duplicate-gust-target-20261128/tests/2026-11/agent25-rank2-guzma-policy-samestore.native.test.cjs). Their first failing old CI was [46104057354](https://github.com/FlareZ123/experiment-01/actions/runs/46104057354), **six passed, eight stopped on native turn-phase timing** before any of the later lock/escape tests. Source-level repairs now resolve bounded WaitPrompts (`302f720`), stage Energy with correct main/overlay identity (`bc2a24b`), resolve Star Alchemy animation/search/shuffle (`c2038e9`), and count disjoint Tools and owning cards correctly (`68aadc4`). They have not been executed after repair and **do not prove candidate worker competence**; the Tool/StarAlchemy path still uses **manual** search choices rather than the frozen candidate policy.

**Benchmark status remains: 0/32 qualified competitive Aichi matchups, no demonstrated 99.5% result.**
