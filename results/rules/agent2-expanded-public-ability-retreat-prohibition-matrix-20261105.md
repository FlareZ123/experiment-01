# Public Ability-based retreat prohibitions: a printed-card inventory and safe mobility-screen requirements

**Agent 2 | 5 November 2026 | source-derived static inventory, not a universal legality adjudicator.** This was motivated by the native failure in [fresh Skyliner A/B/A](../methodology/agent2-skyliner-independent-eight-initial-native-abort-20261105.md) and its [successful unchanged-seed repair](../methodology/agent2-skyliner-fresh-independent-eight-exact-seed-block-repair-20261105.md). The source is the supplied full card database archive `card-list.zip` under `cards/en/*.json`, searched exactly for printed Ability text containing `can't retreat` after normalizing English curly apostrophes. The archive contains cards older than Black & White, so those were excluded from this paper-Expanded-era inventory. This is a text inventory rather than independently verified legality for every printing.

## Eight BW-onward card printings with the relevant literal text

| Card and English printing | Ability | Retreat prohibition condition | Required public information |
| --- | --- | --- | --- |
| Snorlax `bw8-101` | Block | Snorlax itself is Active | Opponent Active identity/unsuppressed Ability |
| Snorlax `pgo-55` | Block | Snorlax itself is Active | Opponent Active identity/unsuppressed Ability |
| Spiritomb `sm35-47` | Cursed Whirlpool | Spiritomb itself is Active | Opponent Active identity/unsuppressed Ability |
| Omastar `sv3pt5-139` | Primordial Tentacles | Omastar itself is Active | Opponent Active identity/unsuppressed Ability |
| Flygon `swsh3-91` | Labyrinth of Sand | Flygon itself is Active | Opponent Active identity/unsuppressed Ability |
| Cradily `sm12-11` | Swaying Strangle | Opposing Pokémon affected by Special Conditions cannot retreat; ability itself has no Active-only restriction | Face-up Cradily anywhere in play, own Active Special Condition, Ability suppression |
| Dragalge `xy2-71` | Poison Barrier | Opposing Poisoned Pokémon cannot retreat; no Active-only restriction | Face-up Dragalge anywhere in play, own Active Poisoned, Ability suppression |
| Dragalge `xyp-XY10` | Poison Barrier | Same effect with alternate printing | Same as above |

Five printings create unconditional opponent-Active **lock if the source Pokémon occupies its own Active Spot**; three printings impose conditional retreat restrictions, potentially from the Bench. Several older than-BW examples from the all-era database (e.g. basep Snorlax, ex-era Octillery/Cradily/Poliwrath, Platinum Snorlax) are **outside the 2011-onward research scope** and were intentionally excluded. Other card texts may express similar restrictions using different wording, including attacks, Tools, Stadiums and damage/effect prevention; this list is **not** a comprehensive lock taxonomy.

## Correct owner-visible mobility screen

The [original Skyliner frontier](../../simulation/twinleaf/agent2-owner-skyliner-funded-bench-frontier.cjs) first used printed Basic plus an own Benched Latias ex `Skyliner` to propose a funded Bench attacker, then preflighted native `CheckRetreatCostEffect` to confirm zero Energy fee. On original fresh seed1756373271 rank3 seat0, this proposed an actual typed RetreatAction with rank1 Active Dialga-GX, even while rank3 held Active Snorlax PGO55. The native Store rejected it with `BLOCKED_BY_EFFECT` at action154 turn42. The specific error's owner-safe pre-dispatch public snapshot shows the opposing Active Snorlax in plain view. **Zero cost was true; permission was false**.

A robust game-state legality screen must separately consider:

1. **Retreat permission**, which depends on printed/active Ability locks, conditional Bench-based locks, status and attack effects, relevant cards such as Pokémon Tools, and whether the player already retreated this turn.
2. **Effective fee**, which depends on printing, Tools, Stadiums, Abilities and other modifiers; a zero fee does not override prohibition.
3. **Resulting move payoff**, including funded Benched attacks, board occupancy, lost Tools/Energy, adversarial replies and direct win conditions.

The current minimal correction, `opponentActiveBlocksRetreat(view)`, rejects opponent face-up Active Snorlax PGO Block and any Active Ability whose publicly visible text literally says the opponent Active cannot retreat. The new unit tests exercise Snorlax and matching Omastar-like text. **This conservative veto does not yet cover Cradily/Dragalge's conditional Bench-based restrictions**, where a Poisoned/otherwise Special-Conditioned own Active may be trapped even though it could normally retreat. Nor is it a complete Ability suppression and protective Tool matrix. It should therefore remain a partial guard.

Current validation: native [CI42125962073](https://github.com/FlareZ123/experiment-01/actions/runs/42125962073) shows both old 8-group historical control and new 8-group fresh original seed-seat A/B/A cohorts complete without illegal typed actions; the original winning positive seed remains unchanged; all 8 fresh treatment root ledgers exactly equal baseline and no new legal opportunity appeared. This validates the observed Snorlax source failure, not every possible Expanded board.

## Switching is a separate paper-legal escape channel

In the *same original rank1* 60, the deck inventory includes **one Guzma BUS115** and **one Float Stone BKT137**. Snorlax Block prohibits voluntary `RetreatAction` regardless of whether Latias ex Skyliner or Float Stone makes the numerical retreat fee zero. The supplied Advanced Player's Rulebook section C-03 distinguishes switching by card effect from retreating and expressly allows a Switch effect even while the Active Pokémon cannot retreat. A Guzma effect may therefore move the stranded Active in a state with eligible opposing Bench and own Bench, subject to Guzma's exact card text, Supporter-per-turn contention, availability in hand/access and other relevant restrictions. **This option was not proven held, selected or native-Store executed in the failed seed.** A stronger policy must evaluate switching, gusting and Supporter contention as separate choices, instead of treating an impossible zero-cost retreat as the only mobility route.

## Release recommendation

Expose **known retreat restriction** separately from **computed Energy cost** in a general owner-visible mobility planner and retain a native Store acceptance check. Use source-visible face-up information and a reviewed rule abstraction for conditional lock presence; avoid treating public card-name adjacency alone as proof that an Ability is currently active. A policy that rejects every apparent lock may miss legitimate Stealthy Hood or Ability-suppression counter-lines; a policy that trusts fee-only will attempt illegal actions in commonplace Block states.

This static inventory does not assess the candidate deck's 99.5% objective, model tournament time, or prove a whole-game paper legality result. It identifies one experimentally grounded safety failure and a small family of analogous public rule constraints worth testing.
