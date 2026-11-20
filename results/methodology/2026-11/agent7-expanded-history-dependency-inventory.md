# English Expanded prior-turn card-text dependency inventory

**Prepared by:** Agent7  
**Date:** 2026-11-20  
**Card-pool snapshot SHA-256:** `c39af257e60a79a485aad09c7d7723b6afbb42eae1ba74e280b8a3f77581350a`  
**Scope:** English cards from sets released 2011-04-01 onward with `legalities.expanded == Legal`; text fields scanned for case-insensitive `last turn` or `previous turn`.

## Result

The scan found **162 printing records** grouped into **93 distinct card-name + exact full-text pairs** across **108 sets** and **14,550 Expanded-legal card records**. The attached CSV is the canonical row-level inventory: each row preserves the exact prior-turn sentence(s), printing count, PTCGO set code/number, and primary event type. Rows are deduplicated by exact card name + full concatenated card text, with all matching printings grouped together.

| Primary event type | Distinct pairs |
|---|---:|
| Attack / attack source | 29 |
| Damage / recipient | 7 |
| KO / cause / source | 51 |
| Prize count / award | 4 |
| Movement / promotion | 2 |
| Other prior-turn condition | 0 |

Categories are mutually exclusive primary dependencies, assigned from the sentence containing the prior-turn reference. In particular, a clause saying a Pokémon was Knocked Out **by attack damage** is classified as a KO/cause/source dependency, not as a damage-amount dependency; the damage/recipient category is reserved for clauses that need the actual damage event/amount/recipient. Attack history means a previously declared attack or a specific attack identity/type, not merely that a KO was caused by an attack.

## Minimum event facts suggested by the text

- **Attack / attack source:** turn-stamped declared attack, source printing, actor, attack name, GX status, and order where multiple attacks or Copycat eligibility matter.
- **Damage / recipient:** turn-stamped actual damage received, recipient Pokémon, source attack/attacker, and damage amount; distinguish attack damage from damage counters or other effects.
- **KO / cause / source:** turn-stamped Knock Out event, affected Pokémon/owner, cause, and source where the text distinguishes attack damage or a named Pokémon.
- **Prize count / award:** number of Prize cards actually taken during the relevant turn, not merely number of Pokémon Knocked Out.
- **Movement / promotion:** turn-stamped retreat or Bench-to-Active movement, actor, and affected Pokémon.
- **Other:** no rows fell into this bucket under the current lexical scan; retain it for future additions rather than assuming the inventory is semantically exhaustive.

## Limitations

This is a **lexical candidate inventory**, not a card-rules ruling or proof that every effect requires a native event receipt. It does not establish that any of the 93 pairs occurs in the Aichi Top 32, that a card was played in a game, or that Twinleaf exposes the required event fields. The 29 known Aichi lists were separately cross-checked by exact printing for the fixed candidate/field subset; see the Agent7 broadcast `20261120T011233382Z_agent7-exact-field-history-receipt-minimum.md`. The three missing lists remain uncounted.

## Canonical data

See [`agent7-expanded-history-dependency-inventory.csv`](agent7-expanded-history-dependency-inventory.csv) for all 93 machine-readable rows.
