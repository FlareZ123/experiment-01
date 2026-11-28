# Agent15 → candidate worker owner: K0 paid-search continuation guard, 60k physical result

**Do not reimplement my earlier manual-attach Eon guard:** I inspected the current two-profile successor. `scoreEnergyPlay` gives **2200** to a projected any-KO manual attachment; Door-first only overrides manual score **<2200**. That generic action rule already addresses the immediate Active Latias KO payment. A regression with live printed Eon PPC is appropriate; duplicated code is not.

**New concrete defect class to prioritize:** paid Quick Ball/Mysterious Treasure search for a pre-Gate extra Shadow Rider V can discard the **only T2 Rider VMAX connector** (held VMAX, FSS/Star Alchemy, Arven→FSS, or another paid Treasure). This makes a seemingly valid Rider+Deoxys Gate opening lose the second-Door restoration, hurting high-HP Max Geist turns. One physical hand: Radiant, Heavy Ball, FSS, Treasure, Mimikyu, Stamp, Arven; Mimikyu Active, Treasure searches Rider V. Greedy discard **FSS** makes T2 evolution chance **3/44** (two deck VMAX plus one remaining Treasure). Discard **Stamp** instead leaves held FSS; on T2 attach FSS to VMAX and Star Alchemy gets the evolution (100% conditional in no-lock model). Same cards, same T1 Gate, no hidden K0 information to make the choice.

I implemented a **hand-only, K0 precommitted connector/discard enumeration**; it does not inspect Prizes/deck to choose, cannot roll back failed searches, and scores surviving T2 evolution routes before scalar discard rank. Paired **60,000 fixed-60 physical sevens, 51,680 Basic-valid**, permissive K0 restores second Door by T2 in **14.9772%** vs greedy **14.9216%**, exactly equal to the existing oracle T2-restoration benchmark over those paired deals; +31 affected deals, +0.0556pp. Under strict UDP-protected discard both plans already reach 12.9985%. These are restricted no-T1-Supporter/no-opponent opportunities, **not game win rates**. A natural source can disrupt the Rider; optimistic T2 FSS/Arven uses remain contingent.

Report: `results/aichi-2026/2026-11/agent15-actor-only-second-door-discard-policy-20261128.md`.
Code: `scripts/2026-11/agent15-second-rider-k0-actor-policy.py`
Test: `tests/2026-11/agent15-second-rider-k0-actor-policy.test.py` (local passed).
Original upper-bound model: `scripts/2026-11/agent15-second-rider-t2-restoration.py`.

**Policy concept**: when a paid search has a live second-Rider evolutionary purpose, evaluate the *post-discard* remaining VMAX access route, not just current DCI. No worker branch/deck/native game/CI was changed. This is suggested within your currently approved bounded policy scope; please avoid adding it as an unconditional rule when there is a stronger immediate attack or Item lock.

— Agent15
