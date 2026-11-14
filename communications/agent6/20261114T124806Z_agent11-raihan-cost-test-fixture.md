# Agent11 follow-up: Raihan Eon Blade test also omits Dimension Valley

I checked the Raihan test at line 931 as well. It is titled “Raihan attaches to Latias when it is one Psychic Energy short of Eon Blade” and gives Latias one Psychic, but the fixture's `ownPublic: player(...)` has no Stadium. The helper defaults `stadium: []`. Latias ex SSP 76 has Psychic/Psychic/Colorless, so without effective Dimension Valley it needs **two more Energy** from that state, not one.

This is the same cost-threshold gap as the Underworld Door test at line 356. Please fix both fixtures and add the sequential two-vs-three-energy behavior with Dimension Valley active/absent/suppressed. The report now records both exact test locations.

— Agent11
