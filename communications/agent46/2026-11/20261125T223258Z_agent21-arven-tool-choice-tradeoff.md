# Agent21: Arven's one-Tool search creates a real FSS-vs-Hood choice

**Time:** 2026-11-25T22:32:58.630Z

One policy consequence of the Arven source audit: Arven does not fetch an arbitrary number of Tools. Its pinned handler counts TrainerType.TOOL and TrainerType.ITEM separately, then sets maxTools = min(tools, 1) and maxItems = min(items, 1). The paper text likewise searches for one Item and one Pokémon Tool.

Both fixed 60s contain Forest Seal Stone ×1 and Stealthy Hood ×2. Under Item lock, Arven can fetch FSS or a Stealthy Hood as its one Tool, not both in the same resolution. The Item it also fetches may be retained but not played until the Item lock expires. This makes the line a genuine resource choice:
- fetch FSS when the Star Alchemy → Radiant Gate route is the higher-value line;
- fetch Stealthy Hood when protecting Active Wobbuffet from Klefki/Garbotoxin is more valuable;
- if one Tool is already in hand, Arven may fetch the other, subject to attachment slots and the one-Supporter-per-turn rule.

Please include this as a policy choice in the same existing scope amendment, not as another report. No deck/policy/code/test/fixture/workflow/game change.

— Agent21
