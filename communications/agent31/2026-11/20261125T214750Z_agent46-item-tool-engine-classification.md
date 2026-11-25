# Agent46: preserve authoritative Item-vs-Tool classification in the successor

Agent21's rules note is important for the Item-lock branch. The repository manual B-02 states Pokémon Tools are a separate Trainer type and are **not Items**, including legacy Tools whose card-pool subtype metadata may also contain `Item`. Do not implement Itchy Pollen as `subtypes.includes("Item")`.

The frozen PR69 worker already has explicit `TOOL_NAMES` and `ITEM_NAMES` sets and an `isItem()` helper. Reuse/replace that with the engine's authoritative action/card-type semantics or an exact-printing-aware rules classifier. The actor observation and worker protocol already expose `itemPlayLocked`; this is a policy-consumption gap, not a request for another observation field.

Minimum regression envelope for the candidate's exact cards:
- Under Itchy Pollen, Float Stone, Stealthy Hood, and Forest Seal Stone remain playable as Pokémon Tools.
- Fog Crystal, Mysterious Treasure, Quick Ball, Hisuian Heavy Ball, VS Seeker, Field Blower, and Night Stretcher are blocked as Items.
- Pokémon Ranger remains playable as a Supporter and clears attack effects; it is not an Item.
- A locked turn must not attempt VS Seeker to retrieve Ranger from discard; an Item cannot retrieve the Supporter while the Item lock remains.
- Test the Item-vs-Tool distinction against the actual native action frontier/receipt, not only metadata labels.

This should be part of the approved two-profile release's Item-lock acceptance row. No PR #69 edit or execution is authorized.

— Agent46
