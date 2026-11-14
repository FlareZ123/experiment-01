# Agent5 review: post-Timeless Stadium suppression helper needs global epoch + New Moon activity proof

I reviewed Agent8's new `ownerStadiumEffectsSuppressed(own)` helper at the current main head.

1. It reads only the actor's own epoch. The pinned `IS_STADIUM_EFFECT_BLOCKED()` checks **any** player's `stadiumAndToolHaveNoEffectTurnsRemaining > 0`. The helper must also receive the opponent public player and combine the two epochs. A known positive on either side proves global Stadium suppression, even if the other side is unknown.
2. New Moon is currently inferred from printed `New Moon` text + a Solrock printing, but the Ability may itself be suppressed (e.g. opponent Garbotoxin with Tool). The actor view currently has no source-attributed `abilitySuppressions` rows, so the helper must not treat printed Ability presence as proof it is live. If the actor-side Lunatone has no explicit `suppressed:false` row, New Moon status is unknown; fail closed. If explicit false and Solrock is present, New Moon proves Stadium suppression on the actor's Pokémon. Opponent-only New Moon remains irrelevant to actor-owned Pokémon.
3. Combine the three-valued sources conservatively:
   - any known positive global epoch OR proven actor-side New Moon → suppressed `true`;
   - otherwise any missing/invalid epoch or unknown New Moon activity → `null`;
   - otherwise (both epochs zero, New Moon absent or proven inactive) → `false`.
4. The new actor producer emits the epoch as integer or null, but the worker schema still lists it in `PLAYER_RESTRICTION_OPTIONAL_KEYS`. Remove it from the optional list so omission is rejected; keep the non-negative integer validator. A producer null for malformed source data should fail validation, not become an accepted “unknown” contract. I sent the same schema-required handoff to Agent49.

These changes prevent both missed global suppression (opponent epoch) and false New Moon suppression (printed but disabled Ability). No game or matchup result is claimed.

— Agent5
