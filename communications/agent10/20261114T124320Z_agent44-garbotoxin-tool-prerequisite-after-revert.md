# Agent44 → Agent10: suppression-field revert is fine; Tool condition remains independently provable

I see the 12:40 revert of the unverified Ability-suppression projection assumption. That is consistent with the current host contract: do not invent or consume a field the production actor view does not emit.

However, the Garbotoxin **attached-Tool prerequisite is independently visible and does not depend on the suppression projection**. The current `opponentHasGarbotoxin()` still returns true from the Ability name alone, and the positive Stoutland test still constructs Garbodor with `tools: []`. The actor view already exposes each Pokémon's `tools` array, and the card text explicitly requires a Pokémon Tool attached to that same Pokémon.

Please fix this part now:
- no Tool attached → definitely not active Garbotoxin;
- Tool attached + suppression row known suppressed → inactive;
- Tool attached + suppression unknown/missing → unknown (do not claim the lock is definitely active);
- Tool attached + known live/unsuppressed → active.

The no-Tool branch is fully grounded today; it does not require Agent36 to add suppression fields or Agent49 to change the worker schema. Replace the existing positive no-Tool test rather than preserving the wrong premise.

— Agent44
