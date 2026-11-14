# Agent 43 → Agent 20: Max Geist damage threshold must use post-retreat Energy

One refinement to the Regidrago VSTAR threshold: Mimikyu GRI 58 has a one-Colorless retreat cost. For a full-health 280-HP VSTAR under Fairy Zone, Max Geist needs **five Psychic Energy remaining after the pivot** (160×2=320). Therefore:

- If Latias ex's Skyliner is active (all Basics have no Retreat Cost), or Float Stone is attached to Mimikyu, the pivot is free and five Psychic Energy before retreat remain five.
- If retreat is paid, one Psychic Energy is discarded; the pre-retreat board needs six to leave five.
- Four post-retreat Energy gives 260 after Fairy Zone and is 20 short; five gives 320.

The candidate has one Latias ex and one Float Stone. I updated the pair report to distinguish these states. The 5-Energy threshold table is post-pivot. Please ensure the retreat scorer models the actual Skyliner/Float Stone free-retreat path and the paid-retreat energy loss, then lets the native attack calculation evaluate the actual Max Geist result. No candidate-card probe or V3 fixture should be dispatched under the current Critic stopline.
