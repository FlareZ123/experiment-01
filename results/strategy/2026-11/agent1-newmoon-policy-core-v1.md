# New Moon Policy Core v1

**Agent 1 · 27 November 2026**

**Decision target:** the unchanged 60-card New Moon Lockbreaker v1 retained for the next non-Shadow-Rider policy-investment slot.

**Contract target:** `results/aichi-2026/2026-11/agent1-newmoon-candidate-policy-acceptance-v2.json`, currently 105 actor-visible cases spanning every authenticated Aichi source rank.

This document is the implementation order. It replaces matchup-specific if/else sprawl with a small number of state transitions and exact constraints.

## 1. Terminal layer: win now / survive now

Before setup value, search value, lock value or resource preservation:

1. take an immediate legal final-Prize win;
2. if the opponent has an actor-visible immediate win, choose any legal action that removes that forced loss before optimizing anything else;
3. do not override a final-Prize attack with a promotion-trap or long-horizon heuristic.

## 2. Knowledge layer: K0 -> K1 continuation viability

On the first legitimate deck search, infer exact own Prizes by elimination and switch to K1.

At K1 recompute which continuation families actually exist:

- Gengar donor: Horror House / Poltergeist;
- Trevenant & Dusknoir donor: Night Watch / Pale Moon;
- Solrock + Lunatone pair: asymmetric Path;
- Articuno V + Forest Seal Stone: Star Alchemy;
- Clefairy ex: rank-2 Stoutland and rank-19 Dragon breakpoints;
- Duskull -> Dusclops chain: Cursed Blast / Stage-1 attack.

Then recompute discardability. Do not preserve a dead singleton pair component while discarding the only surviving live continuation.

## 3. Lock-scope layer: delete only the action class actually prohibited

Classify every active lock by exact scope:

- Basic Ability suppression;
- Rule-Box Ability suppression;
- Active-only Ability suppression;
- global Ability suppression;
- Basic attack suppression;
- Item lock;
- Supporter lock;
- hand-play lock;
- normal-retreat prohibition.

Do not collapse these into one `locked` Boolean.

After applying the exact scope, recompute the surviving native attacks. Perfection suppression still leaves printed attacks such as Miraculous Duo-GX, native Horror House/Poltergeist, Night Watch/Pale Moon, Rondo, Eon Blade, Psyray, Moon Press and Stage-1 Dusclops.

## 4. Stadium / Ability sequencer

Before playing Path or another Stadium:

1. identify every Ability suppressor and whether Lunatone New Moon is currently live;
2. if the current Stadium itself suppresses Lunatone (Silent Lab), recompute after that Stadium leaves play;
3. apply the new Stadium only to Pokémon not protected by New Moon;
4. recompute Perfection, Fairy Zone and other downstream Abilities;
5. compare a direct/native attack line that avoids the contested Ability.

Important exact branch: opposing Iron Thorns Initialization does not suppress non-Rule-Box Lunatone. With Solrock + Lunatone, Path can suppress opposing Initialization while candidate ignores the Stadium, restoring Perfection.

## 5. Prize-transition layer

Self-KOs and effect KOs must settle before the next decision.

For candidate Dusclops Cursed Blast from Prize state `(P_c, P_o)`, if the Blast also takes `q` opponent Prizes:

- candidate remaining = `P_c - q`;
- opponent remaining = `P_o - 1`.

Recompute:

- Ace Trainer legality;
- Reversal/Counter Energy multipliers;
- Bloodmoon Ursaluna Seasoned Skill;
- Altered Creation extra-Prize eligibility by KO cause;
- final-Prize win conditions.

Do not value 'gifted Prizes' without the resulting cost/legality transitions.

## 6. Bench decision layer

For every optional Bench action, enumerate every legal target cardinality first. For TPE, that means 0, every 1-target choice, and every 2-target combination.

Compute the Bench Exposure Vector:

`BEV = (immediate Prize ceiling, Rondo lethal margin, movable-counter mass, trap exposure, own continuation value)`.

Use exact discrete tests:

- Raichu: 30-damage packet knapsack over public/established Energy;
- Clefairy mirror: +20 Rondo damage per extra Bench body;
- Koffing/Roxie: +1 movable counter per candidate Pokémon per Koffing trigger;
- Snorlax: gust + Block escape burden.

Before passing, run a compression pass: Farewell unneeded Benched Unown when legal; evolve Duskull to Dusclops when the 60->90 HP / Stage-1 change improves the reply frontier.

## 7. Horror House layer

Horror House removes **hand-play roots**, not the opponent's turn.

Blocked: Pokémon/evolution/Trainer/Stadium/Tool/Energy played from hand.

Still score before choosing Horror House:

- already-funded attacks;
- in-play Abilities;
- ordinary retreat;
- forced promotion;
- existing Stadium effects;
- automatic already-attached Tool effects.

Only after constructing the best board-only reply should the policy credit denied hand plays.

## 8. Lock-resilient resource ladder

Under Item and/or Supporter denial, do not fall back immediately to topdecking.

Preserved channels can include:

1. already-funded attack;
2. Forest Seal Stone on Galarian Articuno V -> Star Alchemy;
3. TPE normal Energy attachment -> Basic Psychic deployment;
4. Powerglass -> Basic Psychic from discard after attack;
5. Stadium replacement;
6. direct Pokémon play/evolution when not otherwise prohibited.

Track exact custody:

- FSS needs the only Pokémon V host, Articuno V;
- Powerglass needs **Basic** Psychic in discard, not TPE;
- one Pokémon can hold only one Tool.

## 9. Attack-effect / mobility layer

When an attack places a future restriction or delayed KO, ask whether the affected Active can legally leave the Active Spot before it matters.

Examples:

- source Mew VMAX can free-retreat to remove copied Techno Blast's next-turn attack restriction;
- candidate Latias can clear Eon Blade's restriction by moving to Bench when Skyliner is live;
- Pale Moon's delayed KO is not guaranteed if the Defending Pokémon can retreat/switch/evolve before turn end.

Retreat cost, permission to retreat, and switch-effect access are separate variables.

## 10. Connector / discard layer

Only after the layers above establish a selected continuation should the policy pay Secret Box, Mysterious Treasure, Ultra-style or Reconstitute discard costs.

Every discard candidate must be scored against:

- K1 continuation prerequisites;
- current Bench / Energy / Tool needs;
- Prize recovery impossibilities;
- whether the discarded card becomes useful in discard (Basic Psychic for Powerglass, donor Pokémon for Perfection, etc.);
- whether another connector use dominates the proposed search.

`access != success`: a connector is only valuable if the continuation still exists after paying its cost.

## 11. Supporter layer

New Moon has a small Supporter set and one Supporter per turn.

Before playing Lillie's Determination or Ace Trainer:

- recompute Prize legality after any self-KO/effect KO;
- compare the Supporter against a no-Supporter line that preserves another future Supporter window;
- do not spend a draw Supporter if the same turn needs a gust/other Supporter in a hypothetical redesigned line; in this exact 60 there is no Guzma, so preserve the actual fixed-card constraint rather than reasoning from generic Expanded options.

## 12. Decision trace contract

For every meaningful root, expose:

- selected continuation;
- strongest immediate opponent reply from actor-visible state;
- K0/K1 state and any Prized prerequisite that changed viability;
- exact lock scopes applied;
- Prize state before/after self-KO or effect KO;
- Bench Exposure Vector deltas for optional bodies;
- resources protected from discard;
- why any connector or Supporter was chosen over its competing use.

Do not expose hidden opponent zones or turn decklist membership into hand knowledge.

## 13. Stop conditions for policy readiness

The policy is not ready for expensive native/full-game evaluation merely because it can take legal actions.

Before such investment, it must satisfy the unified actor-visible acceptance surface or explicitly produce a reviewable alternative continuation for any intentional failure.

Current architecture decision remains: retain exact New Moon 60; do not change cards until a specific reopen condition is demonstrated.

No competitive matchup or 99.5% claim follows.