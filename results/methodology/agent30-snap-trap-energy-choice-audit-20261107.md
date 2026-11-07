# Agent30: Snap Trap energy-choice heuristic audit

**Date:** 7 November 2026  
**Reviewed implementation:** `simulation/twinleaf/agent36/snap-trap-energy-choice-v1.cjs`  
**Reviewed tests:** `tests/2026-11/agent36-snap-trap-energy-choice-v1.test.cjs`  
**Scope:** deterministic policy objective and card-text coverage; no native policy execution or competitive result.

## Finding

The current selector is a useful public-information baseline. It evaluates which attached Energy removals make currently energy-payable printed attacks unaffordable, sums the base `attack.damage` values of those attacks, then breaks ties by Prism Star, Special Energy, unit count, type count, and parent-list order.

That score is an explicit proxy. It is not equivalent to minimizing the opponent's strongest remaining attack or expected future payoff. It also omits card-specific attack damage modifiers.

## Source-grounded modifier gap

The supplied card pool's `resources/cards/en/sm6.json` entry `sm6-117`, Beast Energy ◇, says:

- it provides Colorless normally;
- while attached to an Ultra Beast it provides every type, one Energy at a time;
- the attached Ultra Beast's attacks do 30 more damage to the opponent's Active Pokémon;
- if it would be discarded, the Prism Star rule sends it to the Lost Zone.

The selector's attack-payability calculation can potentially account for the current `provides` array, but its damage score reads only `attack.damage`. It does not explicitly account for Beast Energy's +30 modifier. The Prism Star tie-break may choose Beast Energy in some tied cases, but that is incidental and does not quantify the modifier.

## Minimal counterexample to the score objective

This is a **synthetic policy fixture**, not a claim about a particular printed Pokémon:

- Ultra Beast Active has attack A: cost [Grass, Grass], base damage 130.
- It also has attack B: cost [Fire, Fire], base damage 120.
- Attached Energy: Grass, Grass, Fire, Beast Energy ◇.
- Beast Energy can pay one Fire Energy and grants +30 to both attacks while attached.

Both attacks are initially payable.

| Energy removed | Current selector's denied base-damage score | Strongest remaining attack |
|---|---:|---:|
| Beast Energy ◇ | 120 (attack B) | 130 (attack A, with Beast bonus gone) |
| One Grass Energy | 130 (attack A) | 150 (attack B, still boosted by Beast Energy) |

The current summed-denied-damage score prefers removing Grass (130 > 120). A one-attack-per-turn best-response objective prefers removing Beast Energy, because the opponent's strongest remaining attack is 130 rather than 150. The example isolates two choices of objective: aggregate disabled-option value versus best remaining attack value. Neither should be silently treated as the other.

## Aichi Top 32 relevance

A cross-check against the repository's 29 authenticated full lists (`results/aichi-2026/full-decklists.json`, blob `ae773f6201d7aa69d31914dbfee66f3fba692200`) sharpens the priority:

- Rank 3, Haruto Miki's Snorlax Stall list, contains **2 Galarian Stunfisk SSH**.
- Rank 1, Yasunori Kato's Shadow Rider Calyrex list, contains **1 Marshadow UNB** and **11 Psychic Energy MEE**.
- The v7 source/zone receipt's Marshadow with eight attached Psychic Energy is consistent with that actual rank-1/rank-3 card pairing.
- A cross-match of the 29 lists against the card pool's Ultra Beast Pokémon names and Beast Energy finds **no Ultra Beast Pokémon and no Beast Energy** in those authenticated lists.

This makes the immediate Aichi-specific policy case much simpler than the generic Beast Energy stress case: Marshadow's Red Knuckles costs one Colorless Energy, and the observed Active has eight identical Basic Psychic Energy. Removing any one leaves the attack energy-payable. A field-specific regression should verify that the selector reports no denied attack and applies its stable parent-index tie-break without inventing an energy-denial benefit.

The Beast Energy modifier case remains a useful general Expanded robustness test, but it is **not an observed requirement of the 29 authenticated lists**. The three missing original lists (ranks 23, 25 and 28) remain unauthenticated, so this does not characterize the complete Top 32. The decklist source uses English proxy printings and does not establish Japanese paper-print legality.

## Recommended next validation

1. Keep the current implementation labelled as a deterministic developmental heuristic, not optimal play.
2. Add a real native Ultra Beast + Beast Energy ◇ fixture. Verify the runtime Energy `provides` representation and the actual +30 damage effect before using either in a policy score.
3. Compare at least two explicit policies on identical public prompt states: current summed denied base damage, and a policy that minimizes the strongest remaining attack after each candidate Energy removal. Preserve the full option table and tie-breaks.
4. Keep energy-cost availability distinct from full attack legality. If the helper cannot inspect public attack-use restrictions or other relevant state, report that boundary rather than implying every payable attack is currently usable.

## Evidence boundary

This is a source-text and algorithmic counterexample, not a Twinleaf runtime result. The reviewed selector's tests use synthetic attack records; no new native run, complete game, deck comparison, matchup estimate, or competitive qualification was performed. The Snap Trap source/zone and ordinary Energy settlement receipts remain separate evidence layers. No candidate deck or frozen registration is changed.
