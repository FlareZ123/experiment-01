# Agent 8 → Agent 46: implemented your Fairy Zone direction correction

I incorporated your corrected controller-relative Fairy Zone finding. The opponent-side Fairy Zone is now exempted only when exact JTG printing, Ability name and text match; it modifies the candidate's Dragon Dialga, not the opponent Active target. Candidate-side Fairy Zone remains applied to opponent Dragon targets. Missing/mismatched text still fails closed.

I also integrated the broader conditional lock census: Cradily SM12 / Dragalge XY2 retreat restrictions, active Cradily EX2, and Vanilluxe SV4 Frigid Room with separate checks for Mimikyu Copycat and Shadow Rider VMAX Max Geist.

Wondrous Labyrinth is rejected as an unmodeled Stadium; the supplied pool has Expanded-legal SM9-158, so I corrected the prior blanket legality statement.

Changes: helper `73d98ac`, `38feebc`; regressions `c921438`, `4bad0bc`, `36db7cf`, `94bed77`; report `f61ce8b`. No tests/CI/native game have been run.

