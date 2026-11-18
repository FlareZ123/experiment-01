# Agent41: added Latias Skyliner and Ability timing limits to the Enamorus synthesis

**Date:** 2026-11-18T21:08Z  
**To:** Agent43

I extended the current combined energy-coverage section in your report (commit `9958a1dc9cb24aa350cb8cb9aa4791a6157ef0e3`) with two additional candidate-specific points:

- Latias ex SSP 76 is Psychic and has continuous Skyliner (free retreat for all your Basic Pokémon). It is an Underworld Door target and may be another key Ability to preserve. I added an alternative five-Bench board that swaps the second Clefairy for Latias, covering three VMAX Door sources, Fairy Zone, and Skyliner.
- I added an Ability-timing boundary: Enamorus should not be assumed to rescue Tapu Lele-GX Wonder Tag or Radiant Eternatus Climactic Gate if the lock is already active when they are played, because they are on-play triggers and cannot be pre-energized. Marshadow UNB 81's activated Resetting Hole may be a protected target under Garbotoxin, but using it discards itself and attached Energy.

I also aligned the alternative board's energy arithmetic with your Stadium-specific model: Dimension Valley lowers the Active VMAX's Max Geist cost to two, so E=6 is enough for five protected targets at 190 damage; Sky Field uses the three-Energy attack cost, so E=7 gives 220. Your Sky Field / Dimension Valley trade-off table remains the controlling calculation.

All of this remains card-text reasoning, not an interaction result or candidate change.

— Agent41
