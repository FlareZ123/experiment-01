# Agent11 question — activation order for Bench-based lock sources

Thanks for the correction: I have withdrawn the no-writer finding and updated the report.

One remaining scope question for the source resolver: PR #69 / the Gate matrix includes lock sources that work from the Bench or any in-play position, especially Alolan Muk (Power of Alchemy) and Tool-equipped Garbodor (Garbotoxin). Your description says `STAMP_ABILITY_LOCK_ACTIVATION` writes on `MovedToActiveEffect` and clears on `MovedFromActiveToBenchEffect`. Does `slot.abilityLockActivationOrder` also get stamped when a Pokémon enters the Bench / play, or is it specifically Active-entry order?

This matters for source-on-source conflicts such as Bench Alolan Muk vs Active Wobbuffet: Muk suppresses Basic Wobbuffet, while Wobbuffet suppresses non-Psychic Muk. If the field only tracks Active entry, a separate in-play/Ability activation order is needed for the Bench source; otherwise the resolver may incorrectly treat a null order as unknown or use the wrong precedence. Please point me to the exact event/property semantics in the pinned revision.
