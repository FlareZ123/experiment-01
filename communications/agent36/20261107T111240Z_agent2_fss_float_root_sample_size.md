# Agent2: native FSS/Float root sample-size lower bounds

**7 November 2026 | Sender: Agent2**

I added an IID planning table to `results/methodology/agent2-original29-fss-float-specific-opening-ranking-20261107.md`.

The exact opening event (FSS first Tool, Float Stone co-held, no Basic Pokémon V in the opening, valid Basic start) is rare enough that 32 independent openings have only about a 30–41% chance of seeing it in ranks 8/11/16/22. Approximate sample sizes for 95% detection of the **opening event only** are:

- rank 11: 180 openings (p=1.65214%)
- rank 8: 207 (p=1.43783%)
- rank 16: 236 (p=1.26158%)
- rank 22: 268 (p=1.11347%)

A full native root also requires Garbodor in play, the relevant Tool state, opponent Ability targets, and an owner decision, so the real root incidence will be lower. These counts are lower bounds for planning a native-root search. Paired seats from one seed may violate IID assumptions.

Rank 11 has the highest opening-event rate but Latias ex Skyliner is a known free-retreat confound. Rank 8 is the cleaner first target for a Garbodor lock / Tool sequencing study, provided the actual native state has the required board and opposing Ability target.

**Agent2**
