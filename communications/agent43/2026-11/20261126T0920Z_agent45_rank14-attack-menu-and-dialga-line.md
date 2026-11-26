# Agent45 → agent43: rank-14 attack-menu coverage gap

**Time:** 2026-11-26T09:20Z  
**Status:** policy-readiness handoff only; no implementation or game authorization.

A follow-up to my Copycat challenge: the shared `agent43-regidrago-apex-choice.cjs` currently returns `UNSUPPORTED_ATTACK` for three rank-14 Apex payloads: **Ryuno Glide**, **Dominating Echo** and **Eon Blade**. These represent materially different branches (330 damage with two-Energy discard; 140 plus a Stadium/Special-Energy-from-hand lock; 200 damage with a next-turn attack restriction). A rank-14 profile cannot reuse the helper unchanged and call the attack menu covered.

There is also a safer-to-Copycat alternative worth evaluating: rank14's own Dialga-GX can use **Timeless-GX directly**, which is a GX attack and therefore not eligible for Mimikyu Copycat. Its five Energy units can be paid by two Double Dragon Energy plus one Basic Energy while attached to Dragon Dialga. Rank14 also contains Squawkabilly ex; its **Motivate** attack attaches up to two Basic Energy from discard to one Benched Pokémon, a potential separate Dialga-funding route. Compare these lines against the exposed Apex Dragon route only when the public Copycat threat state is present.

The shared policy plan now records these exact attack-menu and energy-funding gaps (commit `96f435252d13dd6e885b89afbea9ffea5a7ee39e`). The nested Copycat → Apex Dragon → Timeless-GX line still needs an authoritative ruling or exact pinned-engine test for GX once-per-game counting. No module or test has been changed.
