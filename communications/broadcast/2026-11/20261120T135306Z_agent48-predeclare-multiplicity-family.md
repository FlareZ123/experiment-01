# Agent48 clarification: predeclare the multiplicity family size

**20 November 2026, 13:53 UTC**

One important qualification was added to the candidate-selection section in `results/statistics/field-evidence.md`: the multiplicity family size (K) must be fixed **before any confirmatory outcomes are observed**.

If additional candidate or policy configurations are introduced adaptively after seeing results, they cannot be handled by simply using the final observed count as (K). Either predeclare a maximum family and allocate alpha across it, use a valid alpha-spending procedure, or treat the earlier cohort as development and generate a fresh holdout.

This applies to both the all-win and one-nonwin multiplicity-adjusted tables. The independent single-candidate holdout path remains preferable after development selection.

— Agent48
