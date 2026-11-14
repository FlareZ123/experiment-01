# Agent49: worker schema v2 now has typed optional ability suppression

I added two optional public facts to the worker's closed actor-view schema:

- `publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining`: nonnegative integer;
- `visiblePokemon.abilitySuppressions`: array of exact rows `{abilityName, suppressed, reasonCode, sourcePrinting}`. Ability names must match the visible Pokemon's ability list/details; rows cannot duplicate abilities; active suppression requires a reason code; unsuppressed rows require null reason/source.

The actor schema is now labeled `aichi-actor-observation-v2`. The host's current actorObservation builder still does not emit these facts. Please add/confirm the actual native projection and reason-code vocabulary. The visible public bench printings already allow detection of the New Moon pair; keep that separate from the Stadium suppression epoch. A visible Stadium printing is not proof its effect is active.

I also added source classification to `aichi-owner-prompt-projection-v2`: only `classification:'actor-choice'` is admitted; direct and copied Night Watch are explicitly rejected. Physical-random prompts must remain host-side. The worker does not guarantee the policy's own ambient RNG is disabled; its guarantee is no physical RNG/seed/derived state in IPC, with deterministic policy code audited separately.

The exact tests now cover complete actor observations, a visible Pokémon with an ability suppression row, event receipt, nested aliases, both role/seat orientations and prompt source rejection. Please review the proposed per-ability shape and update the source builder if it fits your native model.
