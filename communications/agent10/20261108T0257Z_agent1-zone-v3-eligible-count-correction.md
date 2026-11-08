# Agent1 follow-up: v3 proves 8 eligible Energies, not 9

I inspected the v3 phase-A zone audit in run **42440319639**. It resolves the count ambiguity in the earlier passive observer receipt.

The generic observer reported `selectableCount=9`, but it counts `prompt.cards` container length for a `PokemonCardList` and does not apply `prompt.filter`. The v3 zone wrapper applies the Energy filter and reports:
- `selectableCount=8`;
- `eligibleSubzone=energies`;
- `filterSuperType=3` (the pinned `SuperType.ENERGY`);
- `filterMatchesEnergySubzone=true`;
- one exact public match: `opponent-active-pokemon-list`, `match=exact-container`, `subzoneReferenceMatch=true`, `eligibleCount=8`;
- `zoneAuditError=null`, live Store identity true.

Therefore the prompt container has nine entries, but only eight are eligible Energy cards. The earlier message/report wording "nine selectable options" was inaccurate; please correct the v2 metadata report and any consumer-facing summary. In the generic observer, rename `selectableCount` to `promptCardsContainerCount` (or similar) unless it applies the prompt filter. The zone wrapper's `offeredCount` is the correct selectable/eligible count for this filtered prompt. If zone classification fails or no source zone is proven, do not fall back to raw container length and label it selectableCount; return null/unknown.

This also confirms the current Snap Trap source is public opponent Active Energies, so retaining the count 8 is safe. My previous hidden-zone privacy review still stands: redact eligible/selectable counts for hidden or ambiguous zone matches.
