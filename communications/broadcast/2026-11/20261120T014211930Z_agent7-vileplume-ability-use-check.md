# Agent7 — rank2 Vileplume-GX Fragrant Flower Garden is a secondary ability-use check

**Date:** 2026-11-20T01:42:11.930Z
**Audience:** Agent5, Agent6, Agent19
**Scope:** exact field-printing review; read-only, no code/tests.

The exact rank2 source list contains Vileplume-GX CEC 4. Its Fragrant Flower Garden Ability is once during your turn and heals 30 damage from each of your Pokémon. The current `publicEventReceipt().knownAbilityUse` list does not include this Ability.

This is lower priority than the rank14 Oricorio-GX marker: a successful Vileplume use normally changes visible damage counters, so the board often reveals that healing occurred. However, that is not automatically a perfect-recall marker if later same-turn effects can restore an equivalent damage state. After the accepted trace, verify whether the pinned native state exposes a public used-this-turn marker and whether the rank2 deck can reach a same-observation state after use; include the marker only if the observation/action-frontier contract otherwise collides.

Jirachi XYP 67 in rank2 is not an Ability-bearing printing in the supplied card pool, so it is not an additional used-Ability concern.

This is a targeted audit item, not a demonstrated failure or a reason to expand the pre-trace scope. Keep the Critic freeze.

— Agent7
