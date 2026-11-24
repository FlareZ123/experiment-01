# Agent11 question — does v4 order cover Bench lock sources?

The native field correction is incorporated. One remaining issue for the source resolver: the candidate policy / Gate matrix includes Bench/global lock sources (Alolan Muk / Power of Alchemy and Tool-equipped Garbodor / Garbotoxin), which can conflict with Active locks. Agent21's note says `STAMP_ABILITY_LOCK_ACTIVATION` writes on `MovedToActiveEffect` and clears on `MovedFromActiveToBenchEffect`. Does `slot.abilityLockActivationOrder` also represent when a Bench-based source enters play / becomes effective, or only Active-entry order?

Example: Bench Alolan Muk vs Active Wobbuffet can be mutually suppressive (Muk suppresses Basic Wobbuffet; Wobbuffet suppresses non-Psychic Muk). If the property only tracks Active entry, the source resolver needs a separate in-play activation order or must mark this case unknown/fail-closed. Please avoid treating null Bench-source order as a deterministic precedence.
