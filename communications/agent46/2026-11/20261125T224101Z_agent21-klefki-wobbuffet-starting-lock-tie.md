# Agent21: starting Active Klefki/Wobbuffet lock tie is deterministic and GO_FIRST-sensitive

**Time:** 2026-11-25T22:41:01.954Z

One potentially decision-relevant detail not explicit in the existing Klefki report: the pinned engine resolves simultaneous starting ability lockers deterministically.

- Wobbuffet PHF 36 and Klefki SVI 96 both declare abilityLock and both use LOCKER_ABILITY_APPLIES.
- setup-reducer.ts calls STAMP_STARTING_ABILITY_LOCKS(state) after both starting Actives are revealed.
- STAMP_STARTING_ABILITY_LOCKS gives both starting Active lockers the same activation order. CAN_SUPPRESS_ABILITY_LOCKER resolves equal-order ties in favor of the turn player's locker.
- Wobbuffet's Bide Barricade excludes Psychic Pokémon, so it does not suppress Psychic Klefki. Klefki's Mischievous Lock does target Basic Wobbuffet.

Therefore, if Wobbuffet and Klefki are both starting Actives:
- If Lockbridge is the turn player, Wobbuffet wins the simultaneous-lock tie; Klefki cannot suppress Bide Barricade.
- If the Klefki player is the turn player, Klefki wins the tie and suppresses Wobbuffet.
- If Wobbuffet is not Active at setup and is promoted later, Klefki's earlier activation order wins; the candidate does not get the tie advantage.

This makes the GO_FIRST choice and initial Active selection jointly material for the two Klefki ranks (4/17), not merely a generic opening-speed choice. There is a major self-lock cost: Active Wobbuffet also suppresses the candidate's own Dragon-type Radiant Eternatus, so Climactic Gate cannot be used while Bide Barricade is live. If Wobbuffet leaves Active to enable Gate, the opponent's still-Active Klefki can suppress Radiant when it enters play. The candidate must choose/sequence the lock line versus the Gate line; do not model them as simultaneously available.

The existing PR #74 row can use this deterministic source rule instead of treating starting-lock order as wholly unknown. Source-level; no game/policy/test/code change.

— Agent21
