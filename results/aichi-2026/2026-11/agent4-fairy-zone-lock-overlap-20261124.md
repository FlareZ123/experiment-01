# Fairy Zone suppression overlap in the authenticated Aichi Dragon-type field

**Date:** 24 November 2026  
**Author:** Agent4  
**Status:** corrected exact-card-type cross-tab; no games or matchup results

## Correction

The preliminary cross-tab included Metal Dialga-GX UPR 100, Fighting Koraidon ex TEF 120, and Water Kyurem SFA 47 as Dragon targets based on species identity. Fairy Zone targets Pokémon whose card `types` include Dragon. These three are not Fairy Zone targets. Rank 30's Dialga-GX is Metal, so rank 30 is not a Dragon rank.

The corrected authenticated Dragon ranks are **1, 10, 12, 13, 14, 15, 18, 19, 20, 21, 27, and 32** (12 lists, 91 Dragon Pokémon copies across 11 unique printings).

## Inputs and method

- Source: `results/aichi-2026/full-decklists.json` (29 exact 60-card lists; missing ranks 23, 25, 28 remain unknown).
- Dragon-type membership: exact `types` field from `resources/cards/en/*.json`, mapped through `resources/sets/en.json`.
- Suppressor ranks: exact card-name join against `results/aichi-2026/2026-11/agent35-lock-architecture-field-synthesis-20261117.md`.
- This is a static list-presence join. It does not establish draw/access, Active position, Ability activation, Stadium survival, or any matchup outcome.

## Findings

| Suppressor | Authenticated ranks | Intersection with corrected Dragon ranks | Relevant Fairy Zone rule |
|---|---|---|---|
| Path to the Peak | 5, 9, 12, 15, 20, 21, 27 | 12, 15, 20, 21, 27 (5) | Stadium suppresses Rule Box Clefairy ex; Stealthy Hood does not protect |
| Silent Lab | 9, 13, 15, 32 | 13, 15, 32 (3) | Stadium suppresses Basic Clefairy ex; Stealthy Hood does not protect |
| Flutter Mane | 19 | 19 (1) | Opponent Active Flutter Mane affects only the actor's Active Pokémon; a Benched Clefairy is not targeted, and an effective Hood protects an Active holder |
| Wobbuffet | 7, 10, 21 | 10, 21 (2) | Bide Barricade exempts Psychic Pokémon; Lillie's Clefairy ex is Psychic and remains unaffected |
| Iron Thorns ex | 6, 24, 29 | none | No corrected Dragon-rank overlap |
| Garbodor | 8, 11, 16, 22 | none | No corrected Dragon-rank overlap |
| Klefki | 4, 17 | none | No corrected Dragon-rank overlap |
| Alolan Muk / Galarian Weezing / Slaking | none | none | No source-list presence in the authenticated 29 |

The Path to the Peak / Silent Lab union intersects **7 of the 12 Dragon ranks**: 12, 13, 15, 20, 21, 27, 32. Rank 15 contains both Stadiums. These are direct Stadium effects on Clefairy; attaching Stealthy Hood to the holder does not solve them. The candidate's Field Blower / Stadium sequencing is therefore more relevant in these Dragon matchups than holder-side Hood against Ability locks.

The remaining notable cases:

- **Rank 10 Regidrago:** Wobbuffet PHF 36 is present, but Bide Barricade exempts Psychic Clefairy. Do not mark Fairy Zone suppressed merely because Wobbuffet is in the Active Spot.
- **Rank 21 Regidrago:** Wobbuffet is present, but its Psychic exception still applies; Path to the Peak is also present and does suppress Clefairy.
- **Rank 19 Raging Bolt:** Flutter Mane TEF 78 is present. It only suppresses the opponent's Active Pokémon. If Clefairy stays Benched, Fairy Zone remains available; if Clefairy is Active, an effective Stealthy Hood on Clefairy prevents the opponent Ability effect.
- **Ranks 12, 13, 15, 20, 21, 27, 32:** Path to the Peak and/or Silent Lab directly suppresses Fairy Zone. Holder-side Hood ownership is irrelevant while those Stadium effects remain live.

## Opponent Fairy Zone and candidate target

The Aichi lists with Fairy Zone are ranks 1, 5, and 30. The candidate's own Dragon-type Pokémon is **Radiant Eternatus CRZ 105** (170 HP, no printed Weakness); its Dialga-GX UPR 100 is Metal and is not a target. Therefore opponent Fairy Zone in ranks 1, 5, and 30 can change the candidate's Radiant Eternatus Weakness to Psychic ×2. Rank 30's own Dialga-GX is Metal, so rank 30 has no Dragon-type Pokémon in its own list. Rank 1 contains Radiant Eternatus, which the candidate's own Fairy Zone can affect.

## Policy priority

1. Model Path to the Peak and Silent Lab as Stadium suppression of Clefairy (Rule Box and Basic respectively). Hood on the holder cannot bypass either.
2. Model Flutter Mane's Active-only target scope. A Benched Fairy Zone holder is unaffected; an Active holder is protected by effective Stealthy Hood.
3. Preserve the Wobbuffet Psychic exception. Presence of Wobbuffet alone is not a reason to suppress Fairy Zone.
4. Keep source-owner-aware Hood logic for global Ability suppressors as a general correctness requirement, but do not overstate its frequency in the authenticated Dragon matchups: the corrected Dragon lists contain no Iron Thorns, Garbodor, or Klefki.
5. Model opponent Fairy Zone against the candidate's Radiant Eternatus CRZ 105, not Dialga-GX UPR 100. The candidate's own Fairy Zone affects opposing Dragon targets including Radiant Eternatus in rank 1.

## Limitations

- Three source lists (23, 25, 28) remain missing. Ranks 23 and 28 are Regidrago; their suppression content is unknown and not inferred.
- Source-list presence is not evidence that a card was drawn, Active, or effective.
- No native game, opponent policy, matchup result, or win-rate estimate was produced.
- This does not change the candidate 60 or nominate a deck. It is a policy-priority cross-tab for the current Fairy Zone work.

## Reproduction

Join exact Pokémon printing IDs in `results/aichi-2026/full-decklists.json` to `resources/cards/en/*.json` through `resources/sets/en.json`, filter to `types` containing `Dragon`, then intersect ranks with the exact suppressor card names. Keep the missing-rank set explicit.
