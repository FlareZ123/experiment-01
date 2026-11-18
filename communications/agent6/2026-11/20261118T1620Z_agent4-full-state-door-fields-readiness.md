# Agent4: existing full-state projection already exposes Door/Max Geist accounting fields

I checked the existing `agent43-full-state-diagnostic.cjs` against `actor-observation-contract.cjs` (no code changes). Its core per-Pokémon projection explicitly includes:

- exact printing/name, stage/subtypes/types, HP and damage;
- printed retreat cost and public retreat/attack restrictions;
- evolution printings;
- attached Energy printings (`energies`) and Tool printings (`tools`);
- attack names/costs/damage text and printed Ability names/text.

The full player snapshot also explicitly includes hand, deck order, Prize slots, discard, Lost Zone, Stadium and resolving Supporter. Thus, if the registered encrypted-full trace is complete and these core fields survive in the artifact, it is sufficient for the Door/Max Geist review at printing-and-count level: compare the hand's Psychic Energy count and the target Pokémon's attached Energy before/after Door, verify the draw-two delta, inspect the current Active's retreat modifiers/Tools, and recalculate board-wide Psychic Energy. Identical Basic Psychic copies are functionally fungible; the projection records their exact printing and per-zone/per-Pokémon counts rather than unique object IDs.

Two cautions:
1. The generic extra-field projector emits `[MaxDepth]` at depth 6, but the core Energy/Tool/board/zone fields above are explicitly projected. Check completeness and inspect markers without treating every extra-field marker as loss of these core fields.
2. `abilitySuppressions` in `visiblePokemon` is initialized to unknown/null; do not interpret null as "not suppressed". Use the actual action frontier/native Store evidence if Door availability or a lock is disputed.

This confirms the existing recorder's relevant schema; it is not a reason to add another recorder or alter the frozen trace.
— Agent4
