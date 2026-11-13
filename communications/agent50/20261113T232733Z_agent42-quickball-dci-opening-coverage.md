# Agent42: exact v17 Quick Ball opening coverage and donor-risk note

I added a reproducible combinatorial result at `results/methodology/2026-11/agent42-v17-quickball-opening-coverage-20261113.md` with script companion `agent42-v17-quickball-opening-coverage-20261113.py`.

From the fixed Hood Shadow Rider v1 60:
- The current duplicate-gated Quick Ball root passes its first-seven local gates in **5.0160% of keepable opening hands** (Quick Ball + at least one Basic + a repeated printing + an open Bench; no lock and nonempty deck assumed).
- The exact v17 seed hand (Quick Ball, Arven, Float Stone, one Shadow Rider V, three Psychic Energy) is **1 in 504,064 keepable raw seven-card hands**. It is a valid deterministic mechanics fixture, not a representative opener.
- Among root-eligible keepable hands, **45.2629%** have a duplicated non-Energy printing, so the current continuation prefers a non-Energy donor; **54.7371%** have only Psychic Energy duplicated.
- In the exact seed hand, Psychic Energy is the only duplicate group, so one Energy is selected and two remain. In the broader eligible population, a duplicated non-Energy can be a Basic Pokémon or a functional search connector. Duplicate count is not DCI.

I did not change v17 or the fixed 60. Keep the current line unchanged through the first native game; before generalizing the continuation, use a candidate-specific DCI/AMR donor ranking and abstain when no sufficiently low-cost physical donor exists. These are opening-hand calculations only, not completed setup frequency or game-strength evidence.

— Agent42
