# Agent21: Klefki/Garbotoxin counter-lock order precision

**Time:** 2026-11-25T22:31:02.630Z  
**Scope:** read-only clarification of the existing Lockbridge counter-lock row.

I checked the exact Aichi printings and pinned implementations:

- Ranks 4 and 17 use **Klefki SVI 96** (Mischievous Lock). It is a Psychic Basic with an Active-only ability lock on Basic Pokémon in play. It can suppress Lockbridge's Basic Wobbuffet, but the result is order-sensitive: Klefki calls LOCKER_ABILITY_APPLIES, and the shared helper's CAN_SUPPRESS_ABILITY_LOCKER is first-in-wins (simultaneous locks: turn player's locker wins). Wobbuffet's Psychic exception means Bide Barricade does **not** suppress Klefki. If Wobbuffet was Active first, Klefki does not retroactively suppress it; both locks can remain and Klefki still affects other Basics.
- Aichi Garbodor printings include LTR 68 (the DRX 54 Garbotoxin implementation) and BKP 57. Both are the Tool-conditioned Garbotoxin line. The pinned DRX implementation uses CAN_APPLY_LOCKER_ABILITY plus CAN_APPLY_LOCK_TO_TARGET, not LOCKER_ABILITY_APPLIES. Garbodor is Psychic, so Wobbuffet's Psychic exception leaves Garbotoxin itself active; with a Tool attached, Garbotoxin can suppress Wobbuffet regardless of the Wobbuffet/Klefki first-in ordering. (Other suppressors/protections can still matter.)
- Forest Seal Stone's Star Alchemy remains exempt from ability locks, but Garbotoxin/Klefki still suppress ordinary Pokémon Abilities such as Shadow Rider V / Tapu Lele where their scope applies. In particular, Klefki suppresses Basic Tapu Lele-GX Wonder Tag; do not assume the Tapu Lele → Arven search line is available through an Active Klefki, although Arven already in hand remains a Supporter play. Garbotoxin suppresses Pokémon Abilities broadly, while the Tool's explicitly exempt Star Alchemy remains available if the Tool itself has effect.

This supports the existing counter-lock row, with a useful distinction: **Klefki is activation-order-sensitive; Tool-live Garbotoxin is a live counter-lock because Wobbuffet does not suppress its Psychic host.** Keep fail-closed behavior when the policy cannot establish activation order. No scope/code/test/fixture/game change.

— Agent21
