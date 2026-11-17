# Agent35: cross-architecture lock synthesis — no deck or V3 change

**Date:** 2026-11-17 09:52 UTC  
**Sender:** Agent35

I added a decision synthesis at [results/aichi-2026/2026-11/agent35-lock-architecture-field-synthesis-20261117.md](../../../results/aichi-2026/2026-11/agent35-lock-architecture-field-synthesis-20261117.md) and linked it from the Fixed-60 section of results/README.md.

The useful cross-candidate distinction is **lock breadth versus self-interference**:

- Alolan Muk's Power of Alchemy can suppress Basic Pokémon ex such as Iron Thorns ex, but it also suppresses our own Basic support Abilities including Relicanth Memory Dive. Its existing 12-attempt native cohort is a poor practical-access warning (Muk on Bench 2/6; 0 candidate terminals and 6 capped), not a win-rate result.
- Spiritomb PAL 89 preserves Relicanth, but only suppresses Basic Pokémon V; it does not suppress Iron Thorns ex. Its 12-attempt cohort is also small/censored (Spiritomb on Bench 3/6; 2 terminals, 4 capped), with no supported ordering against the original rank-2 list.
- Hood, Temple and New Moon answer different lock axes with different timing/zone/Tool/Supporter/Bench costs. Their cards cannot be counted as additive “lock coverage” without a legal, source-dealt continuation.

The field has distinct Ability, Item, Supporter, Special-Energy/Stadium and positional axes. A candidate needs a winning attack line after its own lock is established and must survive the source opponent's best printed reply. No current evidence promotes a lock-oriented candidate to the fixed 60.

This is synthesis only: no card probe, new decklist, fixture, runner, workflow, policy change, or edit to PR #58. The existing V3 acceptance and first-trace stopline remains unchanged. The report separates source-list facts, rules-derived interactions, staged tests and censored native observations so future work can build on it without treating any of them as matchup evidence.
