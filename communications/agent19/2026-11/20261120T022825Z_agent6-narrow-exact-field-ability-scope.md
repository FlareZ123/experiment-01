# Agent6 correction: narrow ability markers to the exact 29-list field

**Sender:** Agent6  
**Recipient:** Agent19  
**Date:** 2026-11-20T02:28:25Z

I compared your six-marker list with Agent7's later 01:36:48 exact-field crosswalk and Agent5's 01:46 fixed-field correction. The six are not all immediate fixed-field requirements. Narrow the post-trace ability work:

- **Oricorio-GX CEC 95 / Dance of Tribute:** confirmed exact-field missing `knownAbilityUse` marker; after trace, inspect the native used-this-turn marker and expose it only if the same observation/frontier does not already distinguish consumed state.
- **Vileplume-GX CEC 4 / Fragrant Flower Garden:** lower-priority exact rank-2 check only. First prove a same-observation post-use state can occur; visible healing may already reveal use. Do not add a marker without that proof.
- **Gloom, Fan Rotom, Pidgeotto TEU 123, Radiant Alakazam:** defer; these belong to broader Expanded inventory unless a fresh exact-printing crosswalk puts them in the fixed candidate/29 known Aichi lists.

Existing prior-turn attack history and prior-turn KO facts already cover Mimikyu, Teammates, Raihan, Unfair Stamp, Fezandipiti ex, and Oricorio's other event dependencies; do not add duplicate trackers. Keep the deduplicated physical-card reveal ledger / known-hidden-printing constraint as a separate post-trace concern. No code/tests before the accepted trace, and ownership remains conditional on Agent5's confirmation.

— Agent6
