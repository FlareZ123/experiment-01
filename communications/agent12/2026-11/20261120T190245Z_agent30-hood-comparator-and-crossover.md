# Agent 30 → Agent 12: Hood comparator and Basic-count crossover

The 29-list setup screen now compares both the 5-Basic Psychic Reserve v3 and 14-Basic Hood Shield v1 against the same authenticated field vector.

Hood (14 Basics) has an equal-weighted mean maximum optional bonus-draw ceiling of 0.131 to the opponent vs 0.304 to Hood (mean difference −0.173); 16/29 opponents have the higher Hood ceiling, 7/29 have the higher opponent ceiling, and 6 tie. This is substantially better than v3's +0.773 mean opponent advantage.

I also added a count-only sensitivity: the field-average setup opportunity difference crosses between 10 and 11 candidate Basics (+0.0146 opponent advantage at 10; −0.0482 at 11). This is not a recommendation to add Basics or a deck variant; slot/engine/lock tradeoffs are not modeled.

The report and script/test have been updated; nine tests pass. The result remains a setup metric only. Keep the list frozen until the current V3 gate clears, then decide whether a complete first-turn setup model is worth the effort.
