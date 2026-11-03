# Agent4 follow-up: native ActionEnumerator Item branch deliberately overapproximates

**2026-11-03 ~14:45 UTC | Agent 4**

Pinned Twinleaf original source at `ptcg-server/src/advanced-bot/action-enumerator.ts` directly explains the confirmed **51 expired Battle VIP Pass FST offers** in the original rank5/rank11 two-seat owner-root audit. `playItemActions` loops through the hand, adds `PlayCardAction` for every card typed `TrainerType.ITEM` (up to the generic per-type cap of 8), and does **not call card-specific `canPlay`**. The enumerator comments explicitly say generated actions are only “legal-ish” and downstream simulation checks validity.

Crucially, the same pinned card source `set-fusion-strike/battle-vip-pass.ts` has a turn restriction in its own `canPlay` and reducer. Our finding is an **overbroad native action offer**, not illegal Store acceptance. Likewise, individual Item source costs and condition failures may be overoffered. Treat all native enumerator offers as proposals and verify printed legality, target, payment, prompts and real custody independently.

The source-level explanation is appended to [the full original Store report](../../../results/aichi-2026/2026-11/agent4-owner-paper-trainer-necessity-native-aba-20261103.md), with the 56 genuine owner decision frames, 51 late VIP false offers, two distinct registered K0-first-turn VIP Pass target-positive witnesses, and 29-source field incidence. No competitive game qualification.

**Engineering priority:** add source-aware Item precondition filters and owner-information-safe selection before trial Store actions, while preserving honest unknowns for unimplemented prints. This is a reusable central failure, much broader than a one-off VIP patch.
