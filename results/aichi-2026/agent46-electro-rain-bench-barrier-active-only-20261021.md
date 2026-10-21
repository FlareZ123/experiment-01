# Electro Rain: Bench Barrier protects the Bench, not a vulnerable Active

**Agent 46 | 21 October 2026 | Status:** corrected, exact source-backed **pure-policy** test passed. No compiled live Store test, no game win, no candidate strength estimate.

## Printed source controls the interaction

The pinned upstream implementation `ptcg-server/src/sets/08-sun-and-moon/set-unified-minds/alolan-raichu.ts` and uploaded `card-list.zip` printing `sm11-57` agree on the operative end of Alolan Raichu's **Electro Rain** attack: **"This damage isn't affected by Weakness or Resistance."** The supplied Advanced Player's Rulebook, damage calculation B-06, also establishes that such wording skips both modifiers. Accordingly an Electro Rain allocation of 5 × 30 is **150 damage** to an unprotected Active Pidgeot ex OBF164, despite its printed Lightning ×2 Weakness; 4 × 30 is **120 damage** to Empoleon V BST40, despite the same Weakness. There is no Active-Weakness shortcut. Previous [erroneous Agent46 report](agent46-active-weakness-electro-rain-target-scoring-20261021.md) is prominently **retracted**, and the associated arithmetic and failing tests were replaced.

The repository's existing `simulation/twinleaf/electro-rain-damage-hook.cjs` already converts upstream's `PutCountersEffect` to a scoped `PutDamageEffect` **with `ignoreWeakness=true` and `ignoreResistance=true`**, and groups multiple damage allocations to the same target. This guard was correct and remains unchanged.

A separate issue was the optional Prize-aware target allocator's treatment of two potential Bench barriers:

- **Manaphy BRS, Wave Veil**: prevents opponent attack damage to its player's *Benched* Pokémon.
- **Mr. Mime PLF47, Bench Barrier**: prevents opponent attack damage to its player's *Benched* Pokémon. The exact published Aichi rank-2 list contains one Mr. Mime and two Pidgeot ex, but does not establish any particular in-game positioning.

Under the older optional allocator, seeing either potential barrier made it return `null` for *every* Electro Rain plan. That conservatively avoided impossible Bench KOs but also surrendered the chance to target an opposing Active Pokémon, which those Abilities do not protect. This was an unnecessary opportunity veto.

## Tested narrow correction

Commit `736e33f785bf5074362330944529bad5ec249ef5` changed the existing opt-in `planElectroRainDamage` to exclude **Benched target entries only** when a potential barrier is visible. The resulting prize evaluation may still target an unprotected Active Pokémon. The source code does not infer that the barrier is active through a suppressed Ability, so its exclusion can remain overconservative. The change is limited to the existing optional resolver and does not alter paper damage hooks, default tactics, Twinleaf vendor code, source/candidate 60s, or CI workflows.

After checking the pinned Alolan Raichu attack text, commit `4a33419761afbb105d496c71656adeea7e2df694` removed an erroneous intervening version that had incorporated opponent Active Weakness/Resistance into the damage formula. The final planner **ignores both modifiers** while retaining pre/post attack-damage reductions. The pure test was corrected at commit `76d2fdbfc9dc6f4c7c23e4a3a1f679d49fabcb47`.

The exact committed `tests/raichu-prize-allocation-planner.test.cjs`, current `raichu-prize-allocation-resolver.cjs` and actual `nominalKnockoutPrizes` helper were fetched from GitHub and executed together through a V8 harness with Node assert-equivalent adapters. **All current pure assertions passed**, including:

1. Original unprotected Shadow Rider and Regidrago hypothetical multi-target damage allocations.
2. No-Sight, Jamming Tower, Tool Jammer, Rolling Iron reduction, insufficient packet budget and off-archetype fallback.
3. Wave Veil / Bench Barrier on Bench, and Bench Barrier on Active: protected Bench targets are not chosen by the special planner.
4. A blocked Active target with a visible barrier: returns `null` rather than claiming an invalid Bench plan.
5. An exact rank-2 printed Pidgeot ex hypothetically **Active**, with a Mr. Mime Benched, when the source Raichu has **ten** 30-damage packets: one **300-damage Active target** is returned. The former erroneous 5-packet Active KO is now correctly rejected in the non-barrier test.
6. A printed Lightning-weak Empoleon V needs more than four damage packets; its Weakness does not change Electro Rain damage.

This execution is a **source-level pure-policy check**, not a compiled native Store test. It does not certify that the actual `PutDamagePrompt` will arise from a paper-legally built rank-4/17 source board, that all Energy discarded legally, or that the resulting damage/KO and opponent continuation will settle.

## Decision relevance and constraints

The new special allocation can still produce strategically poor overkill on an Active Pokémon when every other target is protected and every discarded Energy must be accounted for. It maximizes immediate nominal Prizes, without a real opponent response model, and can miss effects changing Ability validity, damage, Prize replacement, or target legality. The actor's true setup, retreat/pivot, attacker Energy, source locks, and printed game clock remain decisive. No specific win-rate uplift is forecast from this defensive correction.

**Next decisive falsification:** find a genuinely dealt rank-4 or rank-17 source Electro Rain prompt with active rival, visible Manaphy/Mr. Mime, and a legal nonzero attacker discard; replay the same physical state under unchanged versus corrected special targeting, then inspect actual target choices, settled damage, Prize movement and real opponent response. Capture no-op and absent-opportunity outcomes. Neither a synthetic 300-damage projection nor a raw Store engine terminal should be converted to competitive evidence.

**Current collective benchmark:** 29 of 32 exact Aichi opponent 60s, no qualified competitive games, no fixed 60 demonstrated at the 99.5% target.
