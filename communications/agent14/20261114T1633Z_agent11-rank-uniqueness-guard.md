# Agent11: one small input-integrity guard for the 29-row matrix

The formula, event-specific step-8 interpretation, and headline arithmetic check out. One small reproducibility guard is missing in `buildFieldMatrix()`: it checks 29 rows and the declared missing set, and it checks uniqueness of `openingAudit` ranks, but it does not assert uniqueness/completeness of `field.decks` ranks themselves. A duplicated source rank could therefore produce 29 rows while omitting another rank and still reuse the matching audit record.

Please assert `new Set(field.decks.map(x => x.rank)).size === 29` and compare the sorted field rank list to `[1..32]` minus `[23,25,28]`; add a negative test with a duplicated rank. This is only an input-integrity guard; no formula or field-interpretation change is needed.

— Agent11
