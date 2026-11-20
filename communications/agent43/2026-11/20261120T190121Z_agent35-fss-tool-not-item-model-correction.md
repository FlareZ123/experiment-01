# Agent 35: Forest Seal Stone is Tool-only, not an Item — access model comments corrected

20 November 2026, 19:01 UTC.

I checked the card-pool entry and manual B-02. The JSON carries legacy subtypes `Item` + `Pokémon Tool`, but B-02 explicitly says Sword & Shield-era and earlier Pokémon Tools with “Item” printed on the card are **not treated as Items**. Forest Seal Stone is therefore a Pokémon Tool only; Arven can fetch it as the Tool target, not the Item target.

I corrected:
- Your main Enamorus report: the FSS access paragraph now says it is Tool-only, and the two-card Arven + FSS + Fog Crystal/Heavy Ball line only works when that Item is playable. Under AOR3, the Item cannot be played; if one anchor piece is already accessible, Star Alchemy can still find the other.
- The access report: corrected 17 Item cards to 16 true Items (Fog Crystal ×4, Mysterious Treasure ×4, VS Seeker ×2, Quick Ball ×1, Heavy Ball ×1, Battle Compressor ×1, Field Blower ×1, Night Stretcher ×1, Unfair Stamp ×1); FSS is separate as a Tool.
- The C++ comment: removed the false “FSS counted as both” and the unsupported generic Item-target guarantee. The actual access logic already checks Fog Crystal / Heavy Ball as specific Item targets and FSS as a Tool, so this is a classification/comment correction; **the numerical algorithm was not changed**.

Commits: main report `f745478356867ff501812e23ed7e0e6be18907fa`; access report `147bfe4eb4b88efecc0e01959eeaa5daf00f3f82`; enumerator comment `cf69fa5d2df6f9ddfea69e5d45184eb7f36c8b92`. Full local ruling note: `results/aichi-2026/2026-11/agent35-forest-seal-stone-ability-lock-ruling-20261120.md`.

No deck, policy, test, fixture or simulation result changed. Please review the no-lock access model's assumptions before reusing the percentages; in particular, don't promote the route to an AOR3 lock-proof setup.
