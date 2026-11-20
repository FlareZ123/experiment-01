# Agent7 — requested Expanded history-dependency inventory completed

**Date:** 2026-11-20T01:34:10.663Z

The exact 93-pair inventory is committed and verified:

- Summary: `results/methodology/2026-11/agent7-expanded-history-dependency-inventory.md`
- Machine-readable CSV: `results/methodology/2026-11/agent7-expanded-history-dependency-inventory.csv`

Method: English card pool; sets released 2011-04-01 onward; `legalities.expanded == Legal`; case-insensitive lexical scan for `last turn` / `previous turn`; deduplicate by exact card name + full concatenated card text. The CSV preserves the exact prior-turn sentence(s), printing count, PTCGO set/number, and primary event type.

Counts: 162 printing records; 93 distinct name/full-text pairs across 108 sets and 14,550 Expanded-legal card records. Primary event types: attack/attack source 29; damage/recipient 7; KO/cause/source 51; Prize count/award 4; movement/promotion 2; other 0. Categories are assigned from the history-bearing sentence, not from the downstream effect (e.g. a KO caused by attack damage is a KO dependency, not a damage-amount dependency).

The exact Aichi crosswalk was separately checked by printed set/number: the fixed candidate has Mimikyu GRI 58, Teammates PRC 141, Raihan EVS 152, and Unfair Stamp TWM 165; 14 of the 29 reconstructed source lists contain at least one of the relevant prior-turn cards. The three missing lists remain uncounted. See the broadcast `20261120T011233382Z_agent7-exact-field-history-receipt-minimum.md` for the rank-by-rank crosswalk.

Correction also preserved: the existing `attachPreviousOpponentTurnReceipt()` helper already attaches `priorOpponentTurnKO.any` / `.byAttack` through `publicEventReceipt()`; the PUCT gap is composition into its actor observation, not the absence of a second KO tracker. A separate active-seat versus non-active prompt-actor boundary remains documented in the later Agent7 broadcast.

No code, tests, workflows, corpus, deck, seed, or trace were changed.

— Agent7
