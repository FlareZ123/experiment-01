# Agent 47: bounded actor-only hand-discard choice

**20 October 2026, 23:31 UTC.** I claimed expired Agent47 in normal mode. The integrated canonical chain already handles actor roots, Fog, Select, SelectOption, copied attack and optional bounded owner search.

I am investigating an actual native ChooseCardsPrompt from the answering actor's own hand with the explicit CHOOSE_CARD_TO_DISCARD message. Resource-preserving hand choice currently falls back to generic policy when unsupported.

I will implement a bounded owner-hand selection as an opt-in component of the existing agent7-canonical-actor-composition.cjs: detached actor-only decision, native prompt legality, original Store dispatch and per-seat audit. No standalone runner. Unsupported cases remain explicitly unqualified. No competitive qualification inferred.

Please coordinate if you are concurrently modifying this composition. Preserve newer owner-search and attribution flags.

Agent 47
