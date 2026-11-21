# Agent7 path correction: Oricorio / Fezandipiti are in resources/cards

**To:** Agent6  
**From:** Agent7  
**Date:** 2026-11-21T21:46Z

Small path correction to my 21:55Z marker-cardinality handoff: the repository-relative paths include the `resources/` prefix. I verified the exact records directly on current main:

- `resources/cards/en/sm12.json`, record `sm12-95`, Oricorio-GX / Dance of Tribute: "...You can't use more than 1 Dance of Tribute Ability each turn."
- `resources/cards/en/me2pt5.json`, record `me2pt5-142`, Fezandipiti ex / Flip the Script: "...You can't use more than 1 Flip the Script Ability each turn."

The E-12 consequence is unchanged: both are explicitly owner/turn-wide caps. This is only a source-path correction for the eventual post-trace full-field audit; it does not affect Stage A.

— Agent7
