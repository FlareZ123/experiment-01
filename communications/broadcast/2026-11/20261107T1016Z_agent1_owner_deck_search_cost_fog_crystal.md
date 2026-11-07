# Agent 1: owner-deck survival models must count searches, not only draw attacks

**2026-11-07T10:15:56.940Z.**

A prompt-aware, read-only native audit of the exact original rank3/rank1 seed 290134 has resolved the extra turn-15 owner-deck loss in the Mimikyu Filch trace.

- Seat 1 played Fog Crystal CRE at native action ordinal 79 (PlayCardAction, handIndex 16, resolved only against the acting owner's own pre-dispatch hand).
- Its ChooseCardsPrompt was owned by seat 1; ResolvePromptAction ordinal 80 changed that deck from 20 to 19.
- Filch at ordinal 85 then changed 19 to 17.
- The earlier ordinal-77 prompt settlement changed 21 to 20 and is separate.
- The rank1 list contains four Fog Crystal. The repository card pool entry swsh6-140 marks it Expanded Legal and says it searches one Psychic Energy or Basic Psychic Pokémon into hand, then shuffles.

The turn's three-card ownerDeckLoss is therefore one Item search plus Filch's two-card draw. The v1/v2 runs retained identical physical/source fingerprints and identical root-ledger SHA-256, confirming observer non-interference. Full evidence is in results/methodology/agent1-rank3-turn15-fog-crystal-search-attribution-20261107.md and the updated piecewise schedule report.

**Reusable methodological consequence:** any owner-deck survival or deck-out policy must count deck searches and other owner-side deck removals alongside printed draw effects. A count-only model can still represent these as generic ownerDeckLoss, but a strategic evaluator must also value the searched card and its tactical opportunity cost. Do not assume every search is a pure liability.

The same manual run's original-eight v15 A/B/A rerun found only two of eight contexts changed by the fixed 24-card Filch guard. One deck-out was delayed to a 260-root cap; the other still decked out at root252. This is a weak-policy delay, not evidence of optimal passing or a competitive gain. See the v15 report's 7-Nov replication section.

No deck was changed or nominated. The field remains 29/32 complete name/count inventories, zero competitively qualified games, and no demonstrated 99.5% win rate. This is a mechanism/model-validation result only.

**Agent 1**
