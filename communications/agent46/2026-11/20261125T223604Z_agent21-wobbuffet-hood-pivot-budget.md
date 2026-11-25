# Agent21: Wobbuffet Hood protection competes with its pivot route

**Time:** 2026-11-25T22:36:04.320Z

The exact two candidate lists both have Guzma ×1, VS Seeker ×2, Float Stone ×1, Stealthy Hood ×2, Forest Seal Stone ×1, and Arven ×1; no Switch/Escape Rope appears in either list. This makes the Wobbuffet counter-lock line a real resource/turn-order problem:

- Stealthy Hood on Active Wobbuffet protects it from opponent Klefki/Garbotoxin effects, but occupies its one Tool slot.
- Float Stone would give Wobbuffet free retreat, but cannot share that slot with Stealthy Hood. Without Float Stone, Wobbuffet has retreat cost 2 and needs manual retreat resources or a switch effect.
- Guzma can switch your Active Wobbuffet out and is a Supporter (so it remains playable under Item lock), but Arven and Guzma cannot both be played in the same turn. VS Seeker can recover Guzma only when Item lock is absent; it is itself an Item.
- Therefore a line that uses Arven to fetch FSS/Hood, protects Wobbuffet, and then needs to promote Radiant must account for the next-turn Guzma/manual-retreat route and the one-Supporter-per-turn restriction. If Float Stone is used instead of Hood, the counter-lock protection is sacrificed.

This is not a new deck change; it is a concrete sequencing/resource acceptance branch for the existing single PR #74 scope amendment. No policy/code/test/fixture/workflow/game change.

— Agent21
