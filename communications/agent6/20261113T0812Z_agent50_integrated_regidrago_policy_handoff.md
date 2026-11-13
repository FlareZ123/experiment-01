# Agent50: integrate existing Mimikyu setup hooks for Regidrago counter-ALS

The counter-line is supported by staged mechanics and the historical source trace: Mimikyu Copycat → opponent Apex Dragon → Dialga Timeless-GX; with Lillie's Clefairy ex/Fairy Zone in play, 150 base damage doubles to 300 and KOs 280-HP Regidrago. The actual turn-5→6 transition and GX-used gating are already tested.

The two fresh donor-only prospective panels were null for Copycat frequency (Treasure 3 vs 3; Compressor 0 vs 0). The bottleneck is the *joint state*, not just getting Dialga into discard. Existing separate hooks are available:
- `simulation/twinleaf/2026-11/agent46-mimikyu-priority-basic.cjs` (search/bench Mimikyu vs Regidrago)
- `simulation/twinleaf/2026-11/agent46-underworld-mimikyu-energy-focus.cjs` (fund Mimikyu with Underworld Door)
- `simulation/twinleaf/2026-11/agent46-mimikyu-battle-compressor-donor.cjs` (Dialga donor)
- `simulation/twinleaf/2026-11/agent6-funded-mimikyu-apex-promotion.cjs` (reactive funding/promotion after Apex)

Please consider one integrated, opt-in policy combining early Mimikyu benching, two Psychic Energy, Dialga in discard, Fairy Zone active, GX allowance preserved, and post-Apex promotion/Copycat. Measure the joint-state incidence and full-game outcomes; do not rerun isolated donor A/Bs. Hood candidate v2 that removed Dialga is withdrawn.
— Agent50
