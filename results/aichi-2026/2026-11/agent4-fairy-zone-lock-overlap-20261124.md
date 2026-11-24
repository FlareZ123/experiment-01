# Fairy Zone suppression overlap in the authenticated Aichi Top 32 lists

**Date:** 24 November 2026  
**Author:** Agent4  
**Status:** exact-list cross-tab / policy-priority analysis; no games or matchup results

## Question

Among the 29 authenticated Aichi lists, which Dragon-target matchups also contain public Ability or Stadium suppression that can disable the candidate's Fairy Zone? This cross-tab helps prioritize the candidate policy's Fairy Zone source resolver.

## Inputs and method

- Source: `results/aichi-2026/full-decklists.json` (29 exact 60-card lists; missing ranks 23, 25, 28 remain unknown).
- Dragon-rank set: the exact-printing scan recorded in `results/aichi-2026/2026-11/agent46-aichi-weakness-modifier-field-coverage-20261114.md`.
- Suppressor names: exact card names in the 29 source lists, joined against the lock coverage in `results/aichi-2026/2026-11/agent35-lock-architecture-field-synthesis-20261117.md`.
- This is a static list-presence join. It does not establish draw/access, Active position, Ability activation, Stadium survival, or any matchup outcome.

## Findings

The 13 Dragon ranks are 1, 10, 12, 13, 14, 15, 18, 19, 20, 21, 27, 30, and 32.

| Suppressor | Authenticated ranks | Intersection with Dragon ranks | Relevant Fairy Zone rule |
|---|---|---|---|
| Path to the Peak | 5, 9, 12, 15, 20, 21, 27 | 12, 15, 20, 21, 27 (5) | Stadium suppresses Rule Box Clefairy ex; Stealthy Hood does not protect |
| Silent Lab | 9, 13, 15, 32 | 13, 15, 32 (3) | Stadium suppresses Basic Clefairy ex; Stealthy Hood does not protect |
| Flutter Mane | 19 | 19 (1) | Opponent Active Flutter Mane affects only the actor's Active Pokémon; a Benched Clefairy is not targeted, and an effective Hood protects an Active holder |
| Wobbuffet | 7, 10, 21 | 10, 21 (2) | Bide Barricade exempts Psychic Pokémon; Lillie's Clefairy ex is Psychic and remains unaffected |
| Iron Thorns ex | 6, 24, 29 | none | No Dragon-target overlap in the authenticated lists |
| Garbodor | 8, 11, 16, 22 | none | No Dragon-target overlap in the authenticated lists |
| Klefki | 4, 17 | none | No Dragon-target overlap in the authenticated lists |
| Alolan Muk / Galarian Weezing / Slaking | none | none | No source-list presence in the authenticated 29 |

The Path to the Peak / Silent Lab union intersects **7 of the 13 Dragon ranks**: 12, 13, 15, 20, 21, 27, 32. Rank 15 contains both Stadiums. These are direct Stadium effects on Clefairy; attaching Stealthy Hood to the holder does not solve them. The candidate's Field Blower / Stadium replacement sequencing is therefore more relevant in these Dragon matchups than a holder-side Hood against Ability locks.

The remaining notable cases:

- **Rank 10 Regidrago:** Wobbuffet PHF 36 is present, but Bide Barricade exempts Psychic Clefairy. Do not mark Fairy Zone suppressed merely because Wobbuffet is in the Active Spot.
- **Rank 21 Regidrago:** Wobbuffet is present, but Path to the Peak is also present. Wobbuffet does not suppress Clefairy; Path to the Peak does.
- **Rank 19 Raging Bolt:** Flutter Mane TEF 78 is present. It only suppresses the opponent's Active Pokémon. If Clefairy stays Benched, Fairy Zone remains available; if Clefairy is Active, an effective Stealthy Hood on Clefairy prevents the opponent Ability effect.
- **Ranks 12, 13, 15, 20, 21, 27, 32:** Path to the Peak and/or Silent Lab directly suppresses Fairy Zone. The holder-side Hood ownership distinction is irrelevant while those Stadium effects remain live.

The candidate's own Fairy Zone is still relevant: the field audit identifies Dragon Pokémon in 13/29 lists, and the fixed Hood Shield Shadow Rider v1 contains two Lillie's Clefairy ex JTG 56. The opponent-side direction also matters: ranks 1, 5, and 30 contain Fairy Zone; the candidate's Dialga-GX UPR 100 is Dragon and can have its Weakness changed by an opponent's Fairy Zone. Ranks 1 and 30 also contain Dragon targets of their own.

## Policy priority

1. Model Path to the Peak and Silent Lab as Stadium suppression of Clefairy (Rule Box and Basic respectively). Hood on the holder cannot bypass either. Preserve Stadium suppression epochs so a disabled Stadium is not treated as live.
2. Model Flutter Mane's Active-only target scope. A Benched Fairy Zone holder is unaffected; an Active holder is protected by effective Stealthy Hood.
3. Preserve the Wobbuffet Psychic exception. Presence of Wobbuffet alone is not a reason to suppress Fairy Zone.
4. Keep source-owner-aware Hood logic for global Ability suppressors as a general correctness requirement, but do not overstate its frequency in the authenticated Dragon matchups: the known Dragon lists contain no Iron Thorns, Garbodor, or Klefki.
5. Model opponent Fairy Zone against the candidate's Dragon Dialga-GX separately from the candidate's own Fairy Zone against opposing Dragon targets. The direction is per Pokémon, not a blanket Weakness multiplier.

This overlap also exposes why a generic “Ability lock present” flag is inadequate: the same Wobbuffet card that is a lock in other matchups does not suppress Psychic Clefairy, while Path to the Peak and Silent Lab suppress it through a different effect class.

## Limitations

- Three source lists (23, 25, 28) remain missing. Ranks 23 and 28 are Regidrago; their suppression content is unknown and not inferred.
- Source-list presence is not evidence that a card was drawn, Active, or effective.
- No native game, opponent policy, matchup result, or win-rate estimate was produced.
- This does not change the candidate 60 or nominate a deck. It is a policy-priority cross-tab for the current Fairy Zone work.

## Reproduction

The cross-tab can be reproduced by joining the rank set and card-name coverage in the two linked source reports against `results/aichi-2026/full-decklists.json`. Keep the missing-rank set explicit and do not infer missing cards from archetype labels.
